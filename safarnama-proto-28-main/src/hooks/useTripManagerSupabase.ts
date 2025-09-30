import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useAuth } from '../contexts/AuthContext';
import { tripService, expenseService } from '../services/supabaseService';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'transport' | 'food' | 'accommodation' | 'entertainment' | 'other';
  date: string;
  time: string;
}

export interface Trip {
  id: string;
  tripNumber: string;
  origin: string;
  destination: string;
  travelMode: string;
  date: string;
  time: string;
  notes?: string;
  travelers: string[];
  expenses: Expense[];
  totalExpenses: number;
  status: 'planning' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const useTripManagerSupabase = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load trips when user is authenticated
  useEffect(() => {
    if (user) {
      loadTrips();
      
      // Set up real-time refresh interval for expenses
      const intervalId = setInterval(() => {
        loadTrips();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(intervalId);
    } else {
      setTrips([]);
      setActiveTrip(null);
    }
  }, [user]);

  const loadTrips = async () => {
    if (!user) return;
    
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
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'tripNumber' | 'expenses' | 'totalExpenses' | 'createdAt' | 'updatedAt'>) => {
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
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
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

      // Update active trip if it's the one being updated
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
  };

  const deleteTrip = async (tripId: string) => {
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
  };

  const addExpense = async (tripId: string, expense: Omit<Expense, 'id'>) => {
    if (!user) return;

    try {
      const newExpense = await expenseService.addExpense(tripId, expense);
      
      setTrips(prev => 
        prev.map(trip => {
          if (trip.id === tripId) {
            const updatedExpenses = [...trip.expenses, newExpense];
            const totalExpenses = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            return {
              ...trip,
              expenses: updatedExpenses,
              totalExpenses,
              updatedAt: new Date().toISOString(),
            };
          }
          return trip;
        })
      );

      // Update active trip if it's the one being updated
      if (activeTrip?.id === tripId) {
        const updatedExpenses = [...activeTrip.expenses, newExpense];
        const totalExpenses = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        setActiveTrip({
          ...activeTrip,
          expenses: updatedExpenses,
          totalExpenses,
        });
      }

    toast({
      title: "Expense Added",
      description: `₹${expense.amount.toFixed(2)} expense recorded.`,
    });
    
    // Immediately refresh data to show updated totals
    setTimeout(() => loadTrips(), 1000);
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateExpense = async (tripId: string, expenseId: string, updates: Partial<Expense>) => {
    if (!user) return;

    try {
      await expenseService.updateExpense(expenseId, updates);
      
      setTrips(prev => 
        prev.map(trip => {
          if (trip.id === tripId) {
            const updatedExpenses = trip.expenses.map(exp => 
              exp.id === expenseId ? { ...exp, ...updates } : exp
            );
            const totalExpenses = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            return {
              ...trip,
              expenses: updatedExpenses,
              totalExpenses,
              updatedAt: new Date().toISOString(),
            };
          }
          return trip;
        })
      );

      // Update active trip if it's the one being updated
      if (activeTrip?.id === tripId) {
        const updatedExpenses = activeTrip.expenses.map(exp => 
          exp.id === expenseId ? { ...exp, ...updates } : exp
        );
        const totalExpenses = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        setActiveTrip({
          ...activeTrip,
          expenses: updatedExpenses,
          totalExpenses,
        });
      }

    toast({
      title: "Expense Updated",
      description: "Expense has been modified.",
    });
    
    // Immediately refresh data to show updated totals
    setTimeout(() => loadTrips(), 1000);
    } catch (error) {
      console.error('Failed to update expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteExpense = async (tripId: string, expenseId: string) => {
    if (!user) return;

    try {
      await expenseService.deleteExpense(expenseId);
      
      setTrips(prev => 
        prev.map(trip => {
          if (trip.id === tripId) {
            const updatedExpenses = trip.expenses.filter(exp => exp.id !== expenseId);
            const totalExpenses = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            return {
              ...trip,
              expenses: updatedExpenses,
              totalExpenses,
              updatedAt: new Date().toISOString(),
            };
          }
          return trip;
        })
      );

      // Update active trip if it's the one being updated
      if (activeTrip?.id === tripId) {
        const updatedExpenses = activeTrip.expenses.filter(exp => exp.id !== expenseId);
        const totalExpenses = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        setActiveTrip({
          ...activeTrip,
          expenses: updatedExpenses,
          totalExpenses,
        });
      }

    toast({
      title: "Expense Deleted",
      description: "Expense has been removed.",
      variant: "destructive"
    });
    
    // Immediately refresh data to show updated totals
    setTimeout(() => loadTrips(), 1000);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const startTrip = async (tripId: string) => {
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
  };

  const completeTrip = async (tripId: string) => {
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
  };

  const getTripById = (tripId: string): Trip | undefined => {
    return trips.find(trip => trip.id === tripId);
  };

  const getStats = () => {
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
  };

  const refreshTrips = () => {
    loadTrips();
  };

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
  };
};