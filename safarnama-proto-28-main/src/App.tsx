import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import AddTrip from "./pages/AddTrip";
import EditTrip from "./pages/EditTrip";
import TripDetails from "./pages/TripDetails";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showNavigation = location.pathname !== "/";

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation />}
      <main className={showNavigation ? "pb-20 lg:pb-0" : ""}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-trip" element={<AddTrip />} />
          <Route path="/edit-trip/:id" element={<EditTrip />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
