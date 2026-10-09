import {getAccountWithTransaction} from "@/actions/accounts";
import {notFound} from "next/navigation";
import React, {Suspense} from "react";
import AccountView from "../_components/account-view";
import {BarLoader} from "react-spinners";

const AccountPage = async ({params}) => {
    const accountData = await getAccountWithTransaction((await params).id);

    if (!accountData) {
        notFound();
    }

    const {
        transactions,
        categories = [],
        ...account
    } = accountData;

    return (
        <Suspense fallback={
            <BarLoader className="mt-4" width={"100%"} color="#9333ea"/>
        }>
            <AccountView account={account} transactions={transactions} categories={categories} />
        </Suspense>
    );
};

export default AccountPage;
