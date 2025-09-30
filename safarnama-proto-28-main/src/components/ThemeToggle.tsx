import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-10 w-10 hover:bg-accent/10 transition-colors"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-foreground hover:text-accent transition-colors" />
      ) : (
        <Moon className="h-4 w-4 text-foreground hover:text-accent transition-colors" />
      )}
    </Button>
  );
};

export default ThemeToggle;