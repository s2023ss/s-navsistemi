
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const isAdmin = profile?.role === 'admin';

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gray-900/10 dark:bg-white/10 text-gray-900 dark:text-white'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-900/5 dark:hover:bg-white/5'
    }`;

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Test Platformu
            </Link>
            <nav className="hidden md:flex items-baseline space-x-4 ml-10">
              <NavLink to="/" className={navLinkClasses} end>
                Ana Sayfa
              </NavLink>
              <NavLink to="/profile" className={navLinkClasses}>
                Profilim
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClasses}>
                  Admin Paneli
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              Hoş geldin, {profile?.full_name || 'Kullanıcı'}
            </span>
            <Button onClick={signOut} size="sm" variant="secondary">
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
