
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
      <h2 className="text-3xl font-semibold mt-4">Sayfa Bulunamadı</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link to="/" className="mt-6">
        <Button>Ana Sayfaya Dön</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
