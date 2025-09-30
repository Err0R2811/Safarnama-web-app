import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, IndianRupee, Edit2, Trash2, Receipt, Car, Utensils, Hotel, PartyPopper } from "lucide-react";
import { Expense, useTripManagerSupabase } from "@/hooks/useTripManagerSupabase";

interface ExpenseTrackerProps {
  tripId: string;
  expenses: Expense[];
}

const ExpenseTracker = ({ tripId, expenses }: ExpenseTrackerProps) => {
  const { addExpense, updateExpense, deleteExpense } = useTripManagerSupabase();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other" as Expense["category"],
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });

  const categories = [
    { value: "transport", label: "Transport", icon: Car, color: "bg-blue-100 text-blue-800" },
    { value: "food", label: "Food & Drinks", icon: Utensils, color: "bg-orange-100 text-orange-800" },
    { value: "accommodation", label: "Accommodation", icon: Hotel, color: "bg-purple-100 text-purple-800" },
    { value: "entertainment", label: "Entertainment", icon: PartyPopper, color: "bg-pink-100 text-pink-800" },
    { value: "other", label: "Other", icon: Receipt, color: "bg-gray-100 text-gray-800" },
  ];

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[4];
  };

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category: "other",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    });
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) return;

    const expenseData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      time: formData.time,
    };

    if (editingExpense) {
      await updateExpense(tripId, editingExpense.id, expenseData);
    } else {
      await addExpense(tripId, expenseData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      time: expense.time,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    await deleteExpense(tripId, expenseId);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesByCategory = categories.map(category => ({
    ...category,
    total: expenses
      .filter(expense => expense.category === category.value)
      .reduce((sum, expense) => sum + expense.amount, 0),
  })).filter(category => category.total > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-3xl font-bold text-foreground">₹{totalExpenses.toFixed(2)}</p>
              </div>
              <IndianRupee className="h-12 w-12 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold text-foreground">{expenses.length}</p>
              </div>
              <Receipt className="h-12 w-12 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {expensesByCategory.length > 0 && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Breakdown of your spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expensesByCategory.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.value} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{category.label}</p>
                      <p className="text-lg font-bold text-foreground">₹{category.total.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>All recorded expenses for this trip</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                  <DialogDescription>
                    Record your travel expenses to keep track of your spending.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      placeholder="What did you spend money on?"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <category.icon className="h-4 w-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expense-date">Date *</Label>
                      <Input
                        id="expense-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense-time">Time *</Label>
                      <Input
                        id="expense-time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingExpense ? "Update Expense" : "Add Expense"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No expenses recorded yet</p>
              <p className="text-sm text-muted-foreground">Add your first expense to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category);
                const IconComponent = categoryInfo.icon;
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{expense.description}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={categoryInfo.color}>
                            {categoryInfo.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {expense.date} at {expense.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-foreground">₹{expense.amount.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(expense.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTracker;