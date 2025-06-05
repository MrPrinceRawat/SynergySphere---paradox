"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddExpenseDialog({ parentId, parentType }: { parentId: string, parentType: string }) {
  const [loading, setLoading] = useState(false);

  const createExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // cast amount as a float 32
    const amount = parseFloat(formData.get("amount") as string);
    const currency = formData.get("currency") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const receiptURL = formData.get("receipt_url") as string;
    const expenseDate = formData.get("expense_date") as string;

    if (!amount || !currency || !description || !category || !expenseDate) {
      alert("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const token = Cookies.get("auth-token");

    const res = await fetch("http://localhost:8080/api/expenses", {
      method: "POST",
      headers: {
        "Authorization": token || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        description,
        category,
        parent_id: parentId,
        parent_type: parentType,
        receipt_url: receiptURL || undefined,
        expense_date: new Date(expenseDate),
      }),
    });

    if (res.ok) {
      alert("Expense added successfully!");
    } else {
      alert("Failed to add expense.");
    }

    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record a new expense.</DialogDescription>
        </DialogHeader>
        <form onSubmit={createExpense}>
          <div className="flex flex-col gap-4 mt-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium">
                Currency <span className="text-red-500">*</span>
              </label>
              <Input
                id="currency"
                name="currency"
                placeholder="e.g. USD"
                maxLength={3}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="What was this expense for?"
                maxLength={500}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium">
                Category <span className="text-red-500">*</span>
              </label>
              <Input
                id="category"
                name="category"
                placeholder="e.g. travel, meals"
                required
              />
            </div>

            <div>
              <label htmlFor="expense_date" className="block text-sm font-medium">
                Expense Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="expense_date"
                name="expense_date"
                type="date"
                required
              />
            </div>

            <div>
              <label htmlFor="receipt_url" className="block text-sm font-medium">
                Receipt URL (optional)
              </label>
              <Input
                id="receipt_url"
                name="receipt_url"
                placeholder="https://link-to-receipt"
              />
            </div>
          </div>
          <DialogTrigger asChild>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
          </DialogTrigger>
        </form>
      </DialogContent>
    </Dialog>
  );
}
