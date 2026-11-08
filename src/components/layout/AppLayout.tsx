import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/index';
import { closeSidebar } from '../../store/theme/uiSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import ConnectionBanner from '../ConnectionBanner';
import { useAppRealtime } from '../../hooks/index';

export default function AppLayout() {
  useAppRealtime();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();

  // Close the mobile drawer after navigating
  useEffect(() => { dispatch(closeSidebar()); }, [pathname, dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <ConnectionBanner />
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}