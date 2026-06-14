import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage({ searchParams }) {
  const editId = searchParams?.edit;

  // Fetch accounts first
  const accountsPromise = getUserAccounts();

  // Fetch transaction only if needed
  const transactionPromise = editId ? getTransaction(editId) : null;

  const [accounts, transaction] = await Promise.all([
    accountsPromise,
    transactionPromise,
  ]);

  let initialData = null;

  if (transaction && editId) {
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="gradient-title max-sm:text-4xl text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600">
          Add Transaction
        </h1>
      </div>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={Boolean(editId)}
        initialData={initialData}
      />
    </div>
  );
}
