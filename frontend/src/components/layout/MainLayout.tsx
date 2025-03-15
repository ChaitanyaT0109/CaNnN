
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 ml-64 p-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
