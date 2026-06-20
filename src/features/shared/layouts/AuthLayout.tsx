import { Suspense } from "react"
import { Outlet } from "react-router-dom";
import PageSpinner from "@/components/ui/PageSpinner";

export default function AuthLayout() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[420px] px-6">
        <div className="rounded-2xl border border-border p-8" style={{ backgroundColor: 'var(--bg-primary)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col items-center mb-8">
            <img
              src="/in planner.png"
              className="h-14"
              alt="InPlanner - Inicio de sesión"
            />
          </div>
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
