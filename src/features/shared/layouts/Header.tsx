import { Plus, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import CreateProjectSheet from "@/features/projects/components/CreateProjectSheet";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
<header className="sticky top-0 z-10 border-b border-border bg-background">
      <nav className="p-4">
        <div className="flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent"
            aria-label="Cambiar tema"
          >
            {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </button>
          <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-primary/80"
            >
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
          </button>
        </div>
      </nav>

      <CreateProjectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </header>
  );
}
