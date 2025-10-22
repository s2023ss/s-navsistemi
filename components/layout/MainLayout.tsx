
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useAuthStore } from '../../store/useAuthStore';
import Spinner from '../ui/Spinner';

const MainLayout: React.FC = () => {
    const { loading, profile } = useAuthStore();

    if(loading && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
