import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { useAuth } from '../contexts/AuthContext';
import { tripService } from '../services/supabaseService';
import { cachedExpenseService } from '../services/optimizedExpenseService';
import { Expense, Trip } from './useTripManagerSupabase';

// Optimized version of trip manager with focus on expense performance
export const useOptimizedTripManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for optimistic updates
  const optimisticUpdatesRef = useRef<Map<string, any>>(new Map());
  const pendingOperationsRef = useRef<Set<string>>(new Set());

  // Debounced refresh to avoid excessive API calls
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      loadTrips();
    }, 2000); // Refresh after 2 seconds of inactivity
  }, []);

  // Load trips with caching
  const loadTrips = useCallback(async (force: boolean = false) => {
    if (!user || (!force && isLoading)) return;
    
    setIsLoading(true);
    try {
      const fetchedTrips = await tripService.getTrips();
      setTrips(fetchedTrips);
      
      // Set active trip if there's one in progress
      const inProgressTrip = fetchedTrips.find(trip => trip.status === 'in_progress');
      if (inProgressTrip) {
        setActiveTrip(inProgressTrip);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
      toast({
        title: "Error",
        description: "Failed to load trips. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, toast]);

  // Load trips when user is authenticated
  useEffect(() => {
    if (user) {
      loadTrips();
    } else {
      setTrips([]);
      setActiveTrip(null);
    }
  }, [user, loadTrips]);

  // Optimistic update helper
  const applyOptimisticUpdate = useCallback((tripId: string, updateFn: (trip: Trip) => Trip) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? updateFn(trip) : trip
    ));
    
    if (activeTrip?.id === tripId) {
      setActiveTrip(prev => prev ? updateFn(prev) : null);
    }
  }, [activeTrip]);

  // Add expense with optimistic updates
  const addExpense = useCallback(async (tripId: string, expense: Omit<Expense, 'id'>) => {
    if (!user) return;

    const operationId = `add-${tripId}-${Date.now()}`;
    
    // Prevent duplicate operations
    if (pendingOperationsRef.current.has(operationId)) return;
    pendingOperationsRef.current.add(operationId);

    // Generate temporary ID for optimistic update
    const tempExpense: Expense = {
      id: `temp-${Date.now()}`,
      ...expense
    };

    try {
      // Optimistic update
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        expenses: [...trip.expenses, tempExpense],
        totalExpenses: trip.totalExpenses + expense.amount,
        updatedAt: new Date().toISOString(),
      }));

      // Actual API call
      const result = await cachedExpenseService.addExpense(tripId, expense);
      
      // Replace temporary expense with real one
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        expenses: trip.expenses.map(exp => 
          exp.id === tempExpense.id ? result.expense : exp
        ),
        totalExpenses: result.newTotal,
      }));

      toast({
        title: "Expense Added",
        description: `₹${expense.amount.toFixed(2)} expense recorded.`,
      });

    } catch (error) {
      console.error('Failed to add expense:', error);
      
      // Revert optimistic update on error
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        expenses: trip.expenses.filter(exp => exp.id !== tempExpense.id),
        totalExpenses: trip.totalExpenses - expense.amount,
      }));

      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      pendingOperationsRef.current.delete(operationId);
    }
  }, [user, applyOptimisticUpdate, toast]);

  // Update expense with optimistic updates
  const updateExpense = useCallback(async (tripId: string, expenseId: string, updates: Partial<Expense>) => {
    if (!user) return;

    const operationId = `update-${expenseId}-${Date.now()}`;
    
    if (pendingOperationsRef.current.has(operationId)) return;
    pendingOperationsRef.current.add(operationId);

    // Store original expense for rollback
    const originalTrip = trips.find(t => t.id === tripId);
    const originalExpense = originalTrip?.expenses.find(e => e.id === expenseId);
    
    if (!originalExpense || !originalTrip) return;

    const originalTotal = originalTrip.totalExpenses;

    try {
      // Calculate new total for optimistic update
      const newAmount = updates.amount ?? originalExpense.amount;
      const totalDiff = newAmount - originalExpense.amount;

      // Optimistic update
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        expenses: trip.expenses.map(exp => 
          exp.id === expenseId ? { ...exp, ...updates } : exp
        ),
        totalExpenses: trip.totalExpenses + totalDiff,
        updatedAt: new Date().toISOString(),
      }));

      // Actual API call
      const result = await cachedExpenseService.updateExpense(expenseId, updates);
      
      // Update with server response
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        expenses: trip.expenses.map(exp => 
          exp.id === expenseId ? result.expense : exp
        ),
        totalExpenses: result.newTotal,
      }));

      toast({
        title: "Expense Updated",
        description: "Expense has been modified.",
      });

    } catch (error) {
      console.error('Failed to update expense:', error);
      
      // Revert optimistic update
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        expenses: trip.expenses.map(exp => 
          exp.id === expenseId ? originalExpense : exp
        ),
        totalExpenses: originalTotal,
      }));

      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      pendingOperationsRef.current.delete(operationId);
    }
  }, [user, trips, applyOptimisticUpdate, toast]);

  // Delete expense with optimistic updates
  const deleteExpense = useCallback(async (tripId: string, expenseId: string) => {
    if (!user) return;

    const operationId = `delete-${expenseId}-${Date.now()}`;
    
    if (pendingOperationsRef.current.has(operationId)) return;
    pendingOperationsRef.current.add(operationId);

    // Store original state for rollback
    const originalTrip = trips.find(t => t.id === tripId);
    const expenseToDelete = originalTrip?.expenses.find(e => e.id === expenseId);
    
    if (!expenseToDelete || !originalTrip) return;

    try {
      // Optimistic update
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        expenses: trip.expenses.filter(exp => exp.id !== expenseId),
        totalExpenses: trip.totalExpenses - expenseToDelete.amount,
        updatedAt: new Date().toISOString(),
      }));

      // Actual API call
      const result = await cachedExpenseService.deleteExpense(expenseId);
      
      // Update with server total
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        totalExpenses: result.newTotal,
      }));

      toast({
        title: "Expense Deleted",
        description: "Expense has been removed.",
        variant: "destructive"
      });

    } catch (error) {
      console.error('Failed to delete expense:', error);
      
      // Revert optimistic update
      applyOptimisticUpdate(tripId, (trip) => ({
        ...trip,
        expenses: [...trip.expenses, expenseToDelete].sort((a, b) => 
          new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
        ),
        totalExpenses: trip.totalExpenses + expenseToDelete.amount,
      }));

      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      pendingOperationsRef.current.delete(operationId);
    }
  }, [user, trips, applyOptimisticUpdate, toast]);

  // Other trip operations (unchanged from original)
  const createTrip = useCallback(async (tripData: Omit<Trip, 'id' | 'tripNumber' | 'expenses' | 'totalExpenses' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create trips.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newTrip = await tripService.createTrip(tripData);
      setTrips(prev => [newTrip, ...prev]);
      
      toast({
        title: "Trip Created!",
        description: `Trip ${newTrip.tripNumber} has been saved.`,
      });

      return newTrip;
    } catch (error) {
      console.error('Failed to create trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  const updateTrip = useCallback(async (tripId: string, updates: Partial<Trip>) => {
    if (!user) return;

    try {
      await tripService.updateTrip(tripId, updates);
      
      setTrips(prev => 
        prev.map(trip => 
          trip.id === tripId 
            ? { ...trip, ...updates, updatedAt: new Date().toISOString() }
            : trip
        )
      );

      if (activeTrip?.id === tripId) {
        setActiveTrip(prev => prev ? { ...prev, ...updates } : null);
      }

      toast({
        title: "Trip Updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error('Failed to update trip:', error);
      toast({
        title: "Error",
        description: "Failed to update trip. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [user, activeTrip, toast]);

  const deleteTrip = useCallback(async (tripId: string) => {
    if (!user) return;

    try {
      await tripService.deleteTrip(tripId);
      
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      
      if (activeTrip?.id === tripId) {
        setActiveTrip(null);
      }
      
      toast({
        title: "Trip Deleted",
        description: "Trip has been removed.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Failed to delete trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [user, activeTrip, toast]);

  const startTrip = useCallback(async (tripId: string) => {
    if (!user) return;

    try {
      await updateTrip(tripId, { status: 'in_progress' });
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        setActiveTrip({ ...trip, status: 'in_progress' });
      }
      
      toast({
        title: "Trip Started!",
        description: "Have a safe journey!",
      });
    } catch (error) {
      console.error('Failed to start trip:', error);
    }
  }, [user, trips, updateTrip, toast]);

  const completeTrip = useCallback(async (tripId: string) => {
    if (!user) return;

    try {
      await updateTrip(tripId, { status: 'completed' });
      if (activeTrip?.id === tripId) {
        setActiveTrip(null);
      }
      
      toast({
        title: "Trip Completed!",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error('Failed to complete trip:', error);
    }
  }, [user, activeTrip, updateTrip, toast]);

  const getTripById = useCallback((tripId: string): Trip | undefined => {
    return trips.find(trip => trip.id === tripId);
  }, [trips]);

  const getStats = useCallback(() => {
    const totalTrips = trips.length;
    const totalExpenses = trips.reduce((sum, trip) => sum + trip.totalExpenses, 0);
    const activeTrips = trips.filter(trip => trip.status === 'in_progress').length;
    const completedTrips = trips.filter(trip => trip.status === 'completed').length;

    return {
      totalTrips,
      totalExpenses,
      activeTrips,
      completedTrips,
    };
  }, [trips]);

  // Force refresh without cache
  const refreshTrips = useCallback(() => {
    loadTrips(true);
  }, [loadTrips]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    trips,
    activeTrip,
    isLoading,
    createTrip,
    updateTrip,
    deleteTrip,
    addExpense,
    updateExpense,
    deleteExpense,
    startTrip,
    completeTrip,
    getTripById,
    getStats,
    setActiveTrip,
    refreshTrips,
    // Additional optimized methods
    debouncedRefresh,
  };
};