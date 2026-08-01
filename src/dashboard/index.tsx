import React from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from './Dashboard';
import '@/index.css';

const root = document.getElementById('root')!;
createRoot(root).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>,
);
