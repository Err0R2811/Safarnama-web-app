import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Trip, Expense } from '../hooks/useTripManagerSupabase';

// Types for import/export data
interface TripExportData {
  tripNumber: string;
  origin: string;
  destination: string;
  travelMode: string;
  date: string;
  time: string;
  notes: string;
  travelers: string;
  totalExpenses: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseExportData {
  tripNumber: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  time: string;
}

export const importExportService = {
  // Export trips to CSV
  exportTripsToCSV: (trips: Trip[]) => {
    const exportData: TripExportData[] = trips.map(trip => ({
      tripNumber: trip.tripNumber,
      origin: trip.origin,
      destination: trip.destination,
      travelMode: trip.travelMode,
      date: trip.date,
      time: trip.time,
      notes: trip.notes || '',
      travelers: trip.travelers.join(', '),
      totalExpenses: trip.totalExpenses,
      status: trip.status,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `safarnama-trips-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export expenses to CSV
  exportExpensesToCSV: (trips: Trip[]) => {
    const exportData: ExpenseExportData[] = [];
    
    trips.forEach(trip => {
      trip.expenses.forEach(expense => {
        exportData.push({
          tripNumber: trip.tripNumber,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          time: expense.time,
        });
      });
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `safarnama-expenses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export trips to Excel
  exportTripsToExcel: (trips: Trip[]) => {
    // Prepare trips data
    const tripsData: TripExportData[] = trips.map(trip => ({
      tripNumber: trip.tripNumber,
      origin: trip.origin,
      destination: trip.destination,
      travelMode: trip.travelMode,
      date: trip.date,
      time: trip.time,
      notes: trip.notes || '',
      travelers: trip.travelers.join(', '),
      totalExpenses: trip.totalExpenses,
      status: trip.status,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    }));

    // Prepare expenses data
    const expensesData: ExpenseExportData[] = [];
    trips.forEach(trip => {
      trip.expenses.forEach(expense => {
        expensesData.push({
          tripNumber: trip.tripNumber,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          time: expense.time,
        });
      });
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add trips sheet
    const tripsWorksheet = XLSX.utils.json_to_sheet(tripsData);
    XLSX.utils.book_append_sheet(workbook, tripsWorksheet, 'Trips');
    
    // Add expenses sheet
    const expensesWorksheet = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesWorksheet, 'Expenses');

    // Add summary sheet
    const summaryData = [
      { Metric: 'Total Trips', Value: trips.length },
      { Metric: 'Total Expenses', Value: trips.reduce((sum, trip) => sum + trip.totalExpenses, 0) },
      { Metric: 'Active Trips', Value: trips.filter(trip => trip.status === 'in_progress').length },
      { Metric: 'Completed Trips', Value: trips.filter(trip => trip.status === 'completed').length },
      { Metric: 'Planned Trips', Value: trips.filter(trip => trip.status === 'planning').length },
      { Metric: 'Export Date', Value: new Date().toISOString().split('T')[0] },
    ];
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Save file
    const fileName = `safarnama-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },

  // Import trips from CSV
  importTripsFromCSV: (file: File): Promise<Partial<Trip>[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          try {
            const trips: Partial<Trip>[] = results.data.map((row: any) => ({
              tripNumber: row.tripNumber || '',
              origin: row.origin || '',
              destination: row.destination || '',
              travelMode: row.travelMode || 'car',
              date: row.date || new Date().toISOString().split('T')[0],
              time: row.time || '09:00',
              notes: row.notes || '',
              travelers: row.travelers ? row.travelers.split(', ').filter(Boolean) : [],
              status: (row.status as Trip['status']) || 'planning',
            })).filter(trip => trip.origin && trip.destination); // Filter out empty rows

            resolve(trips);
          } catch (error) {
            reject(new Error('Failed to parse CSV file. Please check the format.'));
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  },

  // Import trips from Excel
  importTripsFromExcel: (file: File): Promise<Partial<Trip>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet (trips)
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const trips: Partial<Trip>[] = jsonData.map((row: any) => ({
            tripNumber: row.tripNumber || '',
            origin: row.origin || '',
            destination: row.destination || '',
            travelMode: row.travelMode || 'car',
            date: row.date || new Date().toISOString().split('T')[0],
            time: row.time || '09:00',
            notes: row.notes || '',
            travelers: row.travelers ? row.travelers.split(', ').filter(Boolean) : [],
            status: (row.status as Trip['status']) || 'planning',
          })).filter(trip => trip.origin && trip.destination); // Filter out empty rows

          resolve(trips);
        } catch (error) {
          reject(new Error('Failed to parse Excel file. Please check the format.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsArrayBuffer(file);
    });
  },

  // Generate sample CSV template
  downloadSampleCSV: () => {
    const sampleData = [
      {
        tripNumber: 'TR001',
        origin: 'Mumbai',
        destination: 'Delhi',
        travelMode: 'plane',
        date: '2024-01-15',
        time: '10:30',
        notes: 'Business trip',
        travelers: 'John Doe, Jane Smith',
        status: 'completed'
      },
      {
        tripNumber: 'TR002',
        origin: 'Delhi',
        destination: 'Bangalore',
        travelMode: 'train',
        date: '2024-02-20',
        time: '08:00',
        notes: 'Family vacation',
        travelers: 'Family',
        status: 'planning'
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'safarnama-import-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Generate sample Excel template
  downloadSampleExcel: () => {
    const sampleData = [
      {
        tripNumber: 'TR001',
        origin: 'Mumbai',
        destination: 'Delhi',
        travelMode: 'plane',
        date: '2024-01-15',
        time: '10:30',
        notes: 'Business trip',
        travelers: 'John Doe, Jane Smith',
        status: 'completed'
      },
      {
        tripNumber: 'TR002',
        origin: 'Delhi',
        destination: 'Bangalore',
        travelMode: 'train',
        date: '2024-02-20',
        time: '08:00',
        notes: 'Family vacation',
        travelers: 'Family',
        status: 'planning'
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips Template');
    XLSX.writeFile(workbook, 'safarnama-import-template.xlsx');
  }
};