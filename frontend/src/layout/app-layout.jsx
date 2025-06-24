import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AppLayout = () => {
  const location = useLocation();
  const hiddenNavbarRoutes = ['/', '/signin', '/signup'];

  const shouldShowNavbar = !hiddenNavbarRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
     
    </div>
  );
};

export default AppLayout;
