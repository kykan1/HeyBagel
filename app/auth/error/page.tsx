import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Error",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            {error === "OAuthAccountNotLinked"
              ? "This email is already associated with another account."
              : error === "OAuthCallback"
              ? "There was an error signing in with Google."
              : error === "Configuration"
              ? "There was a configuration error. Please contact support."
              : "Something went wrong during sign in."}
          </p>
        </div>

        <Link
          href="/auth/signin"
          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}


