import React from "react";
import { getUserCategories } from "@/actions/categories";
import { CategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Categories - Wealth",
  description: "Add, customize, and remove categories for your transactions.",
};

export default async function CategoriesPage() {
  const result = await getUserCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <CategoriesClient
        initialCategories={result.data || []}
        initialHidden={result.hiddenCategories || []}
      />
    </div>
  );
}
