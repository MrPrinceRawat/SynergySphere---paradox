"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, FileText, Tag, User } from "lucide-react";
import Cookies from "js-cookie";

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  parent_id: string;
  parent_type: "task" | "project";
  receipt_url?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export default function ExpenseTable({ initialExpenses, refreshExpenses }: { initialExpenses: Expense[]; refreshExpenses: () => void }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const token = Cookies.get("auth-token");

  useEffect(() => {
    setExpenses(initialExpenses);
  }, [initialExpenses]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const deleteExpense = async (id: string) => {
    await fetch(`http://localhost:8080/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token || "",
      },
    });
    refreshExpenses();
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses && expenses.map((expense) => (
            <TableRow key={expense.id}>
              <Dialog>
                <DialogTrigger asChild>
                  <TableCell className="cursor-pointer hover:underline">
                    {expense.id.slice(-6)}
                  </TableCell>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Expense Details</DialogTitle>
                    <DialogDescription>
                      {expense.description}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-4 text-sm">
                    <div className="flex gap-2 items-center">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {expense.amount.toFixed(2)} {expense.currency}
                      </span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Tag className="w-4 h-4" />
                      <span>{expense.category}</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(expense.expense_date)}</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <User className="w-4 h-4" />
                      <span>{expense.created_by}</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <FileText className="w-4 h-4" />
                      {expense.receipt_url ? (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="text-gray-500">No receipt</span>
                      )}
                    </div>

                    <div>
                      <p className="text-gray-400">
                        Created at: {formatDate(expense.created_at)}
                      </p>
                      <p className="text-gray-400">
                        Updated at: {formatDate(expense.updated_at)}
                      </p>
                    </div>

                    <div>
                      <Badge variant="outline">
                        {expense.parent_type.toUpperCase()} - {expense.parent_id.slice(-6)}
                      </Badge>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        Delete Expense
                      </Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <TableCell>
                {expense.amount.toFixed(2)} {expense.currency}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
              <TableCell>{expense.created_by}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
