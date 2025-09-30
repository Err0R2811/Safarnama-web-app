import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Plus, 
  User, 
  Settings,
  Plane, 
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/add-trip", label: "Add Trip", icon: Plus },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-gradient-card border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-button">
                <Plane className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Safarnama</span>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "gap-2 px-4",
                      isActive(item.path) && "shadow-button"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
              {/* Theme Toggle */}
              <div className="ml-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-gradient-card border-b border-border shadow-card">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Plane className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Safarnama</span>
            </div>

            {/* Theme Toggle and Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="pb-4 space-y-2 border-t border-border mt-2 pt-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-card border-t border-border shadow-floating z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col gap-1 h-14 text-xs",
                  isActive(item.path) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mobile spacing for bottom nav */}
      <div className="lg:hidden h-20" />
    </>
  );
};

export default Navigation;