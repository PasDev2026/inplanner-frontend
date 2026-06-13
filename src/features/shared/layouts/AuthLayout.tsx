import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[420px] px-6">
        <div className="rounded-2xl border border-gray-100 p-8" style={{ backgroundColor: 'var(--bg-primary)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col items-center mb-8">
            <img
              src="/in planner.png"
              className="h-14"
              alt="Logo"
            />
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
