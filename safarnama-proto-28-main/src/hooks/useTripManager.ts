import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from './use-toast';

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

export const useTripManager = () => {
  const { toast } = useToast();
  const [trips, setTrips, removeTrips, isLoading] = useLocalStorage<Trip[]>('travel_trips', []);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  // Auto-save trips when they change
  useEffect(() => {
    if (!isLoading && trips.length > 0) {
      console.log('Auto-saving trips to local storage');
    }
  }, [trips, isLoading]);

  const generateTripNumber = (): string => {
    const count = trips.length + 1;
    return `TR${String(count).padStart(3, '0')}`;
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'tripNumber' | 'expenses' | 'totalExpenses' | 'createdAt' | 'updatedAt'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: Date.now().toString(),
      tripNumber: generateTripNumber(),
      expenses: [],
      totalExpenses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setTrips(prev => [...prev, newTrip]);
    
    toast({
      title: "Trip Created!",
      description: `Trip ${newTrip.tripNumber} has been saved.`,
    });

    return newTrip;
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    await setTrips(prev => 
      prev.map(trip => 
        trip.id === tripId 
          ? { ...trip, ...updates, updatedAt: new Date().toISOString() }
          : trip
      )
    );

    toast({
      title: "Trip Updated",
      description: "Your changes have been saved.",
    });
  };

  const deleteTrip = async (tripId: string) => {
    await setTrips(prev => prev.filter(trip => trip.id !== tripId));
    
    toast({
      title: "Trip Deleted",
      description: "Trip has been removed.",
      variant: "destructive"
    });
  };

  const addExpense = async (tripId: string, expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };

    await setTrips(prev => 
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

    toast({
      title: "Expense Added",
      description: `₹${expense.amount.toFixed(2)} expense recorded.`,
    });
  };

  const updateExpense = async (tripId: string, expenseId: string, updates: Partial<Expense>) => {
    await setTrips(prev => 
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

    toast({
      title: "Expense Updated",
      description: "Expense has been modified.",
    });
  };

  const deleteExpense = async (tripId: string, expenseId: string) => {
    await setTrips(prev => 
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

    toast({
      title: "Expense Deleted",
      description: "Expense has been removed.",
      variant: "destructive"
    });
  };

  const startTrip = async (tripId: string) => {
    await updateTrip(tripId, { status: 'in_progress' });
    const trip = trips.find(t => t.id === tripId);
    setActiveTrip(trip || null);
    
    toast({
      title: "Trip Started!",
      description: "Have a safe journey!",
    });
  };

  const completeTrip = async (tripId: string) => {
    await updateTrip(tripId, { status: 'completed' });
    if (activeTrip?.id === tripId) {
      setActiveTrip(null);
    }
    
    toast({
      title: "Trip Completed!",
      description: "Welcome back!",
    });
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
  };
};