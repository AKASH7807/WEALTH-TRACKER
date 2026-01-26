import {getUserAccounts} from "@/actions/dashboard";
import {defaultCategories} from "@/data/categories";
import {AddTransactionForm} from "../_components/transaction-form";
import {getTransaction} from "@/actions/transaction";

export default async function AddTransactionPage({searchParams}) {
    const accounts = await getUserAccounts();
    const editId = (await searchParams) ?. edit;

    let initialData = null;
    if (editId) {
        const transaction = await getTransaction(editId);
        initialData = transaction;
    }

    return (<div className="max-w-3xl mx-auto px-5">
        <div className="flex justify-center md:justify-normal mb-8">
            <h1 className="gradient-title max-sm:text-4xl text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600">
                Add Transaction
            </h1>
        </div>
        <AddTransactionForm accounts={accounts}
            categories={defaultCategories}
            editMode={
                !! editId
            }
            initialData={initialData}/>
    </div>);
}
