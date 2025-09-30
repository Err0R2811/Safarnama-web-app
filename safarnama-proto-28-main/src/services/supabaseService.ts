import { supabase } from '../lib/supabase';
import { Trip, Expense } from '../hooks/useTripManagerSupabase';

// Trip Services
export const tripService = {
  // Get all trips for the current user
  async getTrips(): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        expenses (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch trips: ${error.message}`);
    }

    // Transform database data to match app interface
    return data?.map((trip: any) => ({
      id: trip.id,
      tripNumber: trip.trip_number,
      origin: trip.origin,
      destination: trip.destination,
      travelMode: trip.travel_mode,
      date: trip.date,
      time: trip.time,
      notes: trip.notes || '',
      travelers: trip.travelers || [],
      expenses: trip.expenses.map((expense: any) => ({
        id: expense.id,
        description: expense.description,
        amount: parseFloat(expense.amount),
        category: expense.category,
        date: expense.date,
        time: expense.time,
      })),
      totalExpenses: parseFloat(trip.total_expenses || 0),
      status: trip.status,
      createdAt: trip.created_at,
      updatedAt: trip.updated_at,
    })) || [];
  },

  // Get a single trip by ID
  async getTripById(tripId: string): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        expenses (*)
      `)
      .eq('id', tripId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Trip not found
      }
      throw new Error(`Failed to fetch trip: ${error.message}`);
    }

    // Transform database data to match app interface
    return {
      id: data.id,
      tripNumber: data.trip_number,
      origin: data.origin,
      destination: data.destination,
      travelMode: data.travel_mode,
      date: data.date,
      time: data.time,
      notes: data.notes || '',
      travelers: data.travelers || [],
      expenses: data.expenses.map((expense: any) => ({
        id: expense.id,
        description: expense.description,
        amount: parseFloat(expense.amount),
        category: expense.category,
        date: expense.date,
        time: expense.time,
      })),
      totalExpenses: parseFloat(data.total_expenses || 0),
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Create a new trip
  async createTrip(tripData: Omit<Trip, 'id' | 'tripNumber' | 'expenses' | 'totalExpenses' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate trip number
    const { data: tripNumber, error: tripNumberError } = await supabase
      .rpc('generate_trip_number', { user_uuid: user.id });

    if (tripNumberError) {
      throw new Error(`Failed to generate trip number: ${tripNumberError.message}`);
    }

    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        trip_number: tripNumber,
        origin: tripData.origin,
        destination: tripData.destination,
        travel_mode: tripData.travelMode,
        date: tripData.date,
        time: tripData.time,
        notes: tripData.notes || null,
        travelers: tripData.travelers,
        status: tripData.status,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create trip: ${error.message}`);
    }

    return {
      id: data.id,
      tripNumber: data.trip_number,
      origin: data.origin,
      destination: data.destination,
      travelMode: data.travel_mode,
      date: data.date,
      time: data.time,
      notes: data.notes || '',
      travelers: data.travelers || [],
      expenses: [],
      totalExpenses: 0,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Update a trip
  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};
    if (updates.origin) updateData.origin = updates.origin;
    if (updates.destination) updateData.destination = updates.destination;
    if (updates.travelMode) updateData.travel_mode = updates.travelMode;
    if (updates.date) updateData.date = updates.date;
    if (updates.time) updateData.time = updates.time;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.travelers) updateData.travelers = updates.travelers;
    if (updates.status) updateData.status = updates.status;

    const { error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', tripId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to update trip: ${error.message}`);
    }
  },

  // Delete a trip
  async deleteTrip(tripId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete trip: ${error.message}`);
    }
  },
};

// Expense Services
export const expenseService = {
  // Add expense to a trip
  async addExpense(tripId: string, expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
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

    if (error) {
      throw new Error(`Failed to add expense: ${error.message}`);
    }

    return {
      id: data.id,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: data.date,
      time: data.time,
    };
  },

  // Update an expense
  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};
    if (updates.description) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.category) updateData.category = updates.category;
    if (updates.date) updateData.date = updates.date;
    if (updates.time) updateData.time = updates.time;

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  },

  // Delete an expense
  async deleteExpense(expenseId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  },
};

// Auth Services
export const authService = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
    return user;
  },

  // Sign up
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // For development - you can remove this in production
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }

    return data;
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }

    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Re-export profile service for convenience
export { profileService } from './profileService';
