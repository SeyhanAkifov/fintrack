"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) return null;

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/profile"
        className="text-sm font-medium text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-300 dark:hover:bg-gray-800 transition-all truncate max-w-[160px]"
        title="Profile"
      >
        {session.user.name ?? session.user.email}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="text-sm font-medium text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all"
      >
        Sign out
      </button>
    </div>
  );
}
