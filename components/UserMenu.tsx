import { auth, signOut } from "@/lib/auth/config";

export async function UserMenu() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-600">
        {session.user.name || session.user.email}
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/auth/signin" });
        }}
      >
        <button
          type="submit"
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}


