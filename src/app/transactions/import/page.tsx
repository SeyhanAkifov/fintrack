import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/server/auth";
import { ImportWizard } from "@/components/transactions/ImportWizard";

export default async function ImportPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/transactions" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back to transactions
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import CSV</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a bank statement, map the columns, review, and import. Duplicates are skipped automatically.
        </p>
      </div>
      <ImportWizard />
    </div>
  );
}
