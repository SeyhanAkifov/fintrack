import Link from "next/link";
import { UserMenu } from "./UserMenu";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            FinTrack
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all">
            Dashboard
          </Link>
          <Link href="/transactions" className="text-sm font-medium text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all">
            Transactions
          </Link>
          <Link href="/budgets" className="text-sm font-medium text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all">
            Budgets
          </Link>
          <div className="ml-2 pl-2 border-l border-gray-200">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
