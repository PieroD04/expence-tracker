import { useEffect } from "react";
import LastExpense from "../components/dashboard/LastExpense";
import { Expense } from "../models/expense";
import ExpenseDialog from "../components/common/ExpenseDialog";
import RecurringExpenses from "../components/dashboard/RecurringExpenses";
import ExpenseAnalytics from "../components/dashboard/ExpenseAnalytics";
import { Toast, ProgressSpinner } from "../ui";
import { useToast } from "../hooks/useToast";
import { useExpense } from "../hooks/useExpense";
import { useDialog } from "../hooks/useDialog";
import dayjs from "dayjs";

function Dashboard() {
    const { expenses, recurringExpenses, loading, getExpenses, getRecurringExpenses, createExpense, deleteExpense } = useExpense();
    const { open, selectedItem: selectedExpense, isRecurring, openDialog, closeDialog } = useDialog();
    const { showToast, toastRef } = useToast();

    useEffect(() => {
        getExpenses();
        getRecurringExpenses();
    }, []);

    const handleCreateExpense = (id) => {
        const expense = recurringExpenses.find((expense) => expense.id === id);
        const data = new Expense(-1, -1, expense.description, expense.category_name, expense.amount, expense.currency, dayjs().format("YYYY-MM-DD"), false);

        if (createExpense(data)) {
            showToast("Expense created!", "success");
            closeDialog();
        } else {
            showToast("Failed to create Expense.", "error");
        }
    };

    const handleEditExpense = (id, isRecurring) => {
        const expense = isRecurring ? recurringExpenses.find((expense) => expense.id === id) : expenses.find((expense) => expense.id === id);
        openDialog(expense);
    };

    const handleDeleteExpense = (id) => {
        if (deleteExpense(id)) {
            showToast("Expense deleted!", "success");
        } else {
            showToast("Failed to delete Expense.", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <ProgressSpinner strokeWidth="4" />
            </div>
        );
    }

    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-4">
                    <LastExpense
                        expense={expenses[expenses.length - 1]}
                        onDelete={handleDeleteExpense}
                        onEdit={handleEditExpense}
                        onCreate={() => openDialog()}
                    />
                </div>
                <div className="col-12 lg:col-8">
                    <RecurringExpenses
                        expenses={recurringExpenses}
                        onDelete={handleDeleteExpense}
                        onEdit={handleEditExpense}
                        onCreate={handleCreateExpense}
                        onAdd={() => openDialog(null, true)}
                    />
                </div>
                <div className="col-12">
                    <ExpenseAnalytics
                        expenses={expenses}
                    />
                </div>
            </div>

            <ExpenseDialog
                visible={open}
                onHide={closeDialog}
                selectedExpense={selectedExpense}
                isRecurring={isRecurring}
                getExpenses={getExpenses}
                getRecurringExpenses={getRecurringExpenses}
                showToast={showToast}
            />

            <Toast ref={toastRef} position="bottom-right" />
        </>
    );
}

export default Dashboard;