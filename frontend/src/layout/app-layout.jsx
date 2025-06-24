import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AppLayout = () => {
  const location = useLocation();
  const hiddenNavbarRoutes = ['/', '/signin', '/signup'];

  const shouldShowNavbar = !hiddenNavbarRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
      {/* ✅ Grid background - safely fills the viewport */}
      <div className="grid-background absolute inset-0 -z-10 pointer-events-none" />

      {/* ✅ Conditionally rendered Navbar */}
    
      {/* ✅ Main content wrapper - padded and centered */}
      <main className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
