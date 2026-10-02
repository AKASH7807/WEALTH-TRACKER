import { getUserAccounts } from "@/actions/dashboard";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction, getUserDescriptionSuggestions } from "@/actions/transaction";
import { getUserCategories } from "@/actions/categories";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Edit3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage({ searchParams }) {
  const [accounts, categoriesResult, suggestionsResult] = await Promise.all([
    getUserAccounts(),
    getUserCategories(),
    getUserDescriptionSuggestions(),
  ]);

  const editId = (await searchParams)?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  const isEdit = Boolean(editId);
  const categories = categoriesResult?.data || [];
  const descriptionSuggestions = suggestionsResult?.data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors w-fit"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm">
              {isEdit ? (
                <Edit3 className="h-5 w-5" />
              ) : (
                <PlusCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isEdit ? "Edit Transaction" : "New Transaction"}
              </h1>
            </div>
          </div>

          <span
            className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isEdit
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
            }`}
          >
            {isEdit ? "Editing Mode" : "New Entry"}
          </span>
        </div>
      </div>

      {/* Responsive Form Workspace */}
      <AddTransactionForm
        accounts={accounts}
        categories={categories}
        descriptionSuggestions={descriptionSuggestions}
        editMode={isEdit}
        initialData={initialData}
      />
    </div>
  );
}

