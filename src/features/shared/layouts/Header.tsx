import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();


  return (
    <header className="sticky top-0 z-0 bg-white border-b border-gray-200 dark:bg-gray-900">
      <nav className="max-w-screen-xl mx-auto p-4">
        <div className="flex justify-end">
          <button
              type="button"
              onClick={() => navigate("/projects/create")}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-primary/80"
            >
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </button>
        </div>

      </nav>
    </header>
  );
}
