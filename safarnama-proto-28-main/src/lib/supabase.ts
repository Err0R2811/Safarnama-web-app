import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string;
          user_id: string;
          trip_number: string;
          origin: string;
          destination: string;
          travel_mode: string;
          date: string;
          time: string;
          notes: string | null;
          travelers: string[];
          total_expenses: number;
          status: 'planning' | 'in_progress' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trip_number: string;
          origin: string;
          destination: string;
          travel_mode: string;
          date: string;
          time: string;
          notes?: string | null;
          travelers: string[];
          total_expenses?: number;
          status?: 'planning' | 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trip_number?: string;
          origin?: string;
          destination?: string;
          travel_mode?: string;
          date?: string;
          time?: string;
          notes?: string | null;
          travelers?: string[];
          total_expenses?: number;
          status?: 'planning' | 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          description: string;
          amount: number;
          category: 'transport' | 'food' | 'accommodation' | 'entertainment' | 'other';
          date: string;
          time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          description: string;
          amount: number;
          category: 'transport' | 'food' | 'accommodation' | 'entertainment' | 'other';
          date: string;
          time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          category?: 'transport' | 'food' | 'accommodation' | 'entertainment' | 'other';
          date?: string;
          time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}