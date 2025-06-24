import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AppLayout = () => {
  const location = useLocation();
  const hiddenNavbarRoutes = ['/', '/signin', '/signup'];

  const shouldShowNavbar = !hiddenNavbarRoutes.includes(location.pathname);

  return (
    <div className="relative">
      {/* ✅ Always show grid background */}
      <div className="grid-background absolute inset-0 -z-10" />

      {/* ✅ Show Navbar only on non-landing/auth pages */}
      {shouldShowNavbar && <Navbar />}

      <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
