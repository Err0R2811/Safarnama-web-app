import { supabase } from '../lib/supabase';
import { Expense } from '../hooks/useTripManagerSupabase';

// Optimized expense service for faster response times
export const optimizedExpenseService = {
  // Batch expense operations for better performance
  async addExpenseOptimized(tripId: string, expense: Omit<Expense, 'id'>): Promise<{
    expense: Expense;
    newTotal: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Use a database transaction to ensure consistency
    const { data, error } = await supabase.rpc('add_expense_with_total', {
      p_trip_id: tripId,
      p_user_id: user.id,
      p_description: expense.description,
      p_amount: expense.amount,
      p_category: expense.category,
      p_date: expense.date,
      p_time: expense.time
    });

    if (error) {
      console.error('RPC call failed, falling back to manual method:', error);
      // Fallback to manual method
      return await this.addExpenseManual(tripId, expense);
    }

    return {
      expense: {
        id: data.expense_id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        time: expense.time,
      },
      newTotal: parseFloat(data.new_total)
    };
  },

  // Fallback manual method
  async addExpenseManual(tripId: string, expense: Omit<Expense, 'id'>): Promise<{
    expense: Expense;
    newTotal: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Add expense
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        time: expense.time,
      })
      .select()
      .single();

    if (expenseError) {
      throw new Error(`Failed to add expense: ${expenseError.message}`);
    }

    // Get updated total from the trip (database trigger should have updated it)
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('total_expenses')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single();

    if (tripError) {
      console.error('Failed to fetch updated total:', tripError);
    }

    return {
      expense: {
        id: expenseData.id,
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        date: expenseData.date,
        time: expenseData.time,
      },
      newTotal: tripData ? parseFloat(tripData.total_expenses) : expense.amount
    };
  },

  // Optimized update with minimal data fetching
  async updateExpenseOptimized(expenseId: string, updates: Partial<Expense>): Promise<{
    expense: Expense;
    newTotal: number;
    tripId: string;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Use RPC for atomic update
    const { data, error } = await supabase.rpc('update_expense_with_total', {
      p_expense_id: expenseId,
      p_user_id: user.id,
      p_description: updates.description,
      p_amount: updates.amount,
      p_category: updates.category,
      p_date: updates.date,
      p_time: updates.time
    });

    if (error) {
      console.error('RPC call failed, falling back to manual method:', error);
      return await this.updateExpenseManual(expenseId, updates);
    }

    return {
      expense: {
        id: expenseId,
        description: data.description,
        amount: parseFloat(data.amount),
        category: data.category,
        date: data.date,
        time: data.time,
      },
      newTotal: parseFloat(data.new_total),
      tripId: data.trip_id
    };
  },

  // Fallback manual update
  async updateExpenseManual(expenseId: string, updates: Partial<Expense>): Promise<{
    expense: Expense;
    newTotal: number;
    tripId: string;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.time !== undefined) updateData.time = updates.time;

    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseId)
      .eq('user_id', user.id)
      .select('*, trip_id')
      .single();

    if (expenseError) {
      throw new Error(`Failed to update expense: ${expenseError.message}`);
    }

    // Get updated total
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('total_expenses')
      .eq('id', expenseData.trip_id)
      .eq('user_id', user.id)
      .single();

    if (tripError) {
      console.error('Failed to fetch updated total:', tripError);
    }

    return {
      expense: {
        id: expenseData.id,
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        date: expenseData.date,
        time: expenseData.time,
      },
      newTotal: tripData ? parseFloat(tripData.total_expenses) : parseFloat(expenseData.amount),
      tripId: expenseData.trip_id
    };
  },

  // Optimized delete with total recalculation
  async deleteExpenseOptimized(expenseId: string): Promise<{
    newTotal: number;
    tripId: string;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.rpc('delete_expense_with_total', {
      p_expense_id: expenseId,
      p_user_id: user.id
    });

    if (error) {
      console.error('RPC call failed, falling back to manual method:', error);
      return await this.deleteExpenseManual(expenseId);
    }

    return {
      newTotal: parseFloat(data.new_total),
      tripId: data.trip_id
    };
  },

  // Fallback manual delete
  async deleteExpenseManual(expenseId: string): Promise<{
    newTotal: number;
    tripId: string;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get expense details before deletion
    const { data: expenseData, error: fetchError } = await supabase
      .from('expenses')
      .select('trip_id')
      .eq('id', expenseId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch expense details: ${fetchError.message}`);
    }

    // Delete expense
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(`Failed to delete expense: ${deleteError.message}`);
    }

    // Get updated total
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('total_expenses')
      .eq('id', expenseData.trip_id)
      .eq('user_id', user.id)
      .single();

    if (tripError) {
      console.error('Failed to fetch updated total:', tripError);
    }

    return {
      newTotal: tripData ? parseFloat(tripData.total_expenses) : 0,
      tripId: expenseData.trip_id
    };
  },

  // Get expenses for a specific trip (with pagination support)
  async getExpensesForTrip(tripId: string, limit: number = 50, offset: number = 0): Promise<Expense[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    return data.map((expense: any) => ({
      id: expense.id,
      description: expense.description,
      amount: parseFloat(expense.amount),
      category: expense.category,
      date: expense.date,
      time: expense.time,
    }));
  },

  // Batch operations for multiple expenses
  async batchAddExpenses(tripId: string, expenses: Omit<Expense, 'id'>[]): Promise<{
    expenses: Expense[];
    newTotal: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const expensesToInsert = expenses.map(expense => ({
      trip_id: tripId,
      user_id: user.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      time: expense.time,
    }));

    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert(expensesToInsert)
      .select();

    if (expenseError) {
      throw new Error(`Failed to add expenses: ${expenseError.message}`);
    }

    // Get updated total
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('total_expenses')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single();

    if (tripError) {
      console.error('Failed to fetch updated total:', tripError);
    }

    return {
      expenses: expenseData.map((expense: any) => ({
        id: expense.id,
        description: expense.description,
        amount: parseFloat(expense.amount),
        category: expense.category,
        date: expense.date,
        time: expense.time,
      })),
      newTotal: tripData ? parseFloat(tripData.total_expenses) : 0
    };
  }
};

// Cache for recent expense operations to prevent duplicate calls
const operationCache = new Map<string, Promise<any>>();
const CACHE_TIMEOUT = 1000; // 1 second

export const cachedExpenseService = {
  async addExpense(tripId: string, expense: Omit<Expense, 'id'>) {
    const cacheKey = `add-${tripId}-${JSON.stringify(expense)}`;
    
    if (operationCache.has(cacheKey)) {
      return operationCache.get(cacheKey);
    }

    const operation = optimizedExpenseService.addExpenseOptimized(tripId, expense);
    operationCache.set(cacheKey, operation);

    // Clear cache after timeout
    setTimeout(() => {
      operationCache.delete(cacheKey);
    }, CACHE_TIMEOUT);

    return operation;
  },

  async updateExpense(expenseId: string, updates: Partial<Expense>) {
    const cacheKey = `update-${expenseId}-${JSON.stringify(updates)}`;
    
    if (operationCache.has(cacheKey)) {
      return operationCache.get(cacheKey);
    }

    const operation = optimizedExpenseService.updateExpenseOptimized(expenseId, updates);
    operationCache.set(cacheKey, operation);

    setTimeout(() => {
      operationCache.delete(cacheKey);
    }, CACHE_TIMEOUT);

    return operation;
  },

  async deleteExpense(expenseId: string) {
    const cacheKey = `delete-${expenseId}`;
    
    if (operationCache.has(cacheKey)) {
      return operationCache.get(cacheKey);
    }

    const operation = optimizedExpenseService.deleteExpenseOptimized(expenseId);
    operationCache.set(cacheKey, operation);

    setTimeout(() => {
      operationCache.delete(cacheKey);
    }, CACHE_TIMEOUT);

    return operation;
  }
};