"use client";
import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[160px]">
        {session.user.name ?? session.user.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="text-sm font-medium text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
      >
        Sign out
      </button>
    </div>
  );
}
