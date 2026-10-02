"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { defaultCategories } from "@/data/categories";
import { revalidatePath } from "next/cache";

/**
 * Get all categories available for the current user:
 * Active default categories (minus any hidden by the user) + custom categories created by the user.
 */
export async function getUserCategories() {
  try {
    const user = await checkUser();
    if (!user) {
      // Fallback for unauthenticated or initial loads
      return {
        success: true,
        data: defaultCategories.map((c) => ({ ...c, isCustom: false })),
        hiddenCategories: [],
      };
    }

    // Get user's hidden default category IDs
    const hiddenCategories = Array.isArray(user.hiddenCategories)
      ? user.hiddenCategories
      : [];

    // Get user's custom categories from DB
    const customCategoriesFromDb = await db.category.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const customCategories = customCategoriesFromDb.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      color: c.color || "#6366f1",
      icon: c.icon || "Tag",
      isCustom: true,
      createdAt: c.createdAt,
    }));

    // Active default categories (not hidden)
    const activeDefaultCategories = defaultCategories
      .filter((c) => !hiddenCategories.includes(c.id))
      .map((c) => ({ ...c, isCustom: false }));

    // Combined list: custom categories first, then default categories
    const allCategories = [...customCategories, ...activeDefaultCategories];

    return {
      success: true,
      data: allCategories,
      hiddenCategories,
      customCategories,
    };
  } catch (error) {
    console.error("getUserCategories error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch categories",
      data: defaultCategories.map((c) => ({ ...c, isCustom: false })),
      hiddenCategories: [],
      customCategories: [],
    };
  }
}

/**
 * Create a new custom category for the current user
 */
export async function createCustomCategory(data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const trimmedName = data.name?.trim();
    if (!trimmedName) throw new Error("Category name is required");
    if (trimmedName.length > 50)
      throw new Error("Category name must be under 50 characters");

    const type = data.type === "INCOME" ? "INCOME" : "EXPENSE";
    const color = data.color?.trim() || "#6366f1";
    const icon = data.icon?.trim() || "Tag";

    // Check if category with this name already exists for this user (custom or default)
    const existingCustom = await db.category.findFirst({
      where: {
        userId: user.id,
        name: { equals: trimmedName, mode: "insensitive" },
        type,
      },
    });

    if (existingCustom) {
      throw new Error(`A category named "${trimmedName}" already exists for ${type.toLowerCase()}.`);
    }

    // Also check if matches an active default category
    const matchesDefault = defaultCategories.some(
      (c) =>
        c.type === type &&
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        !(user.hiddenCategories || []).includes(c.id)
    );

    if (matchesDefault) {
      throw new Error(`A default category named "${trimmedName}" is already active.`);
    }

    // If matches a hidden default category, unhide it!
    const hiddenDefaultMatch = defaultCategories.find(
      (c) =>
        c.type === type &&
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        (user.hiddenCategories || []).includes(c.id)
    );

    if (hiddenDefaultMatch) {
      const updatedHidden = (user.hiddenCategories || []).filter(
        (id) => id !== hiddenDefaultMatch.id
      );
      await db.user.update({
        where: { id: user.id },
        data: { hiddenCategories: updatedHidden },
      });

      revalidatePath("/transaction/categories");
      revalidatePath("/transaction/create");
      revalidatePath("/dashboard");

      return {
        success: true,
        data: { ...hiddenDefaultMatch, isCustom: false },
        message: `Restored default category "${hiddenDefaultMatch.name}"`,
      };
    }

    const newCategory = await db.category.create({
      data: {
        name: trimmedName,
        type,
        color,
        icon,
        userId: user.id,
      },
    });

    revalidatePath("/transaction/categories");
    revalidatePath("/transaction/create");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: newCategory.id,
        name: newCategory.name,
        type: newCategory.type,
        color: newCategory.color,
        icon: newCategory.icon,
        isCustom: true,
      },
    };
  } catch (error) {
    console.error("createCustomCategory error:", error);
    return {
      success: false,
      error: error.message || "Failed to create category",
    };
  }
}

/**
 * Remove / Delete a category
 * If it's a custom category, delete it from the database.
 * If it's a default category, add its ID to user.hiddenCategories.
 */
export async function deleteCategory(categoryId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Check if it's a custom category
    const customCategory = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (customCategory && customCategory.userId === user.id) {
      await db.category.delete({
        where: { id: categoryId },
      });

      revalidatePath("/transaction/categories");
      revalidatePath("/transaction/create");
      revalidatePath("/dashboard");

      return {
        success: true,
        message: `Category "${customCategory.name}" removed successfully`,
      };
    }

    // 2. Check if it's a default category
    const defaultCat = defaultCategories.find((c) => c.id === categoryId);
    if (defaultCat) {
      const currentHidden = Array.isArray(user.hiddenCategories)
        ? user.hiddenCategories
        : [];

      if (!currentHidden.includes(categoryId)) {
        await db.user.update({
          where: { id: user.id },
          data: {
            hiddenCategories: [...currentHidden, categoryId],
          },
        });
      }

      revalidatePath("/transaction/categories");
      revalidatePath("/transaction/create");
      revalidatePath("/dashboard");

      return {
        success: true,
        message: `Default category "${defaultCat.name}" removed successfully`,
      };
    }

    throw new Error("Category not found");
  } catch (error) {
    console.error("deleteCategory error:", error);
    return {
      success: false,
      error: error.message || "Failed to remove category",
    };
  }
}

/**
 * Update an existing category (name and type)
 * Allows editing custom categories or customizing default categories
 */
export async function updateCategory(categoryId, data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const trimmedName = data.name?.trim();
    if (!trimmedName) throw new Error("Category name is required");
    if (trimmedName.length > 50)
      throw new Error("Category name must be under 50 characters");

    const type = data.type === "INCOME" ? "INCOME" : "EXPENSE";

    // 1. Check if it's a custom category
    const customCategory = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (customCategory && customCategory.userId === user.id) {
      if (
        customCategory.name.toLowerCase() !== trimmedName.toLowerCase() ||
        customCategory.type !== type
      ) {
        const existing = await db.category.findFirst({
          where: {
            userId: user.id,
            name: { equals: trimmedName, mode: "insensitive" },
            type,
            id: { not: categoryId },
          },
        });
        if (existing) {
          throw new Error(
            `A category named "${trimmedName}" already exists for ${type.toLowerCase()}.`
          );
        }
      }

      const updated = await db.category.update({
        where: { id: categoryId },
        data: {
          name: trimmedName,
          type,
        },
      });

      revalidatePath("/transaction/categories");
      revalidatePath("/transaction/create");
      revalidatePath("/dashboard");

      return {
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          type: updated.type,
          color: updated.color,
          isCustom: true,
        },
        message: `Category updated to "${updated.name}"`,
      };
    }

    // 2. Check if it's a default category
    const defaultCat = defaultCategories.find((c) => c.id === categoryId);
    if (defaultCat) {
      const currentHidden = Array.isArray(user.hiddenCategories)
        ? user.hiddenCategories
        : [];

      if (!currentHidden.includes(categoryId)) {
        await db.user.update({
          where: { id: user.id },
          data: {
            hiddenCategories: [...currentHidden, categoryId],
          },
        });
      }

      const created = await db.category.create({
        data: {
          name: trimmedName,
          type,
          color: defaultCat.color || (type === "EXPENSE" ? "#f43f5e" : "#10b981"),
          userId: user.id,
        },
      });

      revalidatePath("/transaction/categories");
      revalidatePath("/transaction/create");
      revalidatePath("/dashboard");

      return {
        success: true,
        data: {
          id: created.id,
          name: created.name,
          type: created.type,
          color: created.color,
          isCustom: true,
        },
        message: `Category updated to "${created.name}"`,
      };
    }

    throw new Error("Category not found");
  } catch (error) {
    console.error("updateCategory error:", error);
    return {
      success: false,
      error: error.message || "Failed to update category",
    };
  }
}

/**
 * Restore a previously hidden default category
 */
export async function restoreCategory(categoryId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const currentHidden = Array.isArray(user.hiddenCategories)
      ? user.hiddenCategories
      : [];

    const updated = currentHidden.filter((id) => id !== categoryId);

    await db.user.update({
      where: { id: user.id },
      data: { hiddenCategories: updated },
    });

    revalidatePath("/transaction/categories");
    revalidatePath("/transaction/create");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("restoreCategory error:", error);
    return {
      success: false,
      error: error.message || "Failed to restore category",
    };
  }
}

/**
 * Reset all default categories to visible
 */
export async function resetCategories() {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.user.update({
      where: { id: user.id },
      data: { hiddenCategories: [] },
    });

    revalidatePath("/transaction/categories");
    revalidatePath("/transaction/create");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("resetCategories error:", error);
    return {
      success: false,
      error: error.message || "Failed to reset categories",
    };
  }
}
