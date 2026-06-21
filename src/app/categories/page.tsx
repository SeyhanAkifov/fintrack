import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { getCategories } from "@/server/db";
import { CategoriesManager } from "@/components/categories/CategoriesManager";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = Number(session.user.id);
  const categories = await getCategories(userId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize the categories, colors, and icons used across your transactions and budgets.
        </p>
      </div>
      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
