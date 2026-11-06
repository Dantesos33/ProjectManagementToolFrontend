// src/pages/Dashboard.tsx
import { useAppSelector, useAppLogout } from '../hooks/index';

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const { logout, isLoading } = useAppLogout();

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-600">
            {user?.email} · role: <span className="font-medium">{user?.role}</span> · tenant #{user?.tenant_id}
          </p>
        </div>
        <button onClick={logout} disabled={isLoading}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-60">
          {isLoading ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </div>
  );
}