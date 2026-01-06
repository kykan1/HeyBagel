import { auth } from "./config";

/**
 * Get the current user ID from the session
 * Throws an error if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be signed in to perform this action");
  }
  
  return session.user.id;
}

/**
 * Get the current user ID or null if not authenticated
 */
export async function getOptionalAuth(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}


