import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // 1. Fast path: check DB using local JWT userId
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // 2. Slow path: user not in DB, fetch from Clerk API and create
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    // Double check again in case it was created concurrently while fetching Clerk user
    const doubleCheck = await db.user.findUnique({
      where: {
        clerkUserId: clerkUser.id,
      },
    });
    if (doubleCheck) {
      return doubleCheck;
    }

    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User";

    const newUser = await db.user.create({
      data: {
        clerkUserId: clerkUser.id,
        name,
        imageUrl: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    // Concurrent request might have created the user, do one final lookup
    try {
      const { userId } = await auth();
      if (userId) {
        const finalCheck = await db.user.findUnique({
          where: {
            clerkUserId: userId,
          },
        });
        if (finalCheck) {
          return finalCheck;
        }
      }
    } catch (e) {
      console.error("Final check failed in checkUser catch:", e.message);
    }
    throw error;
  }
};

