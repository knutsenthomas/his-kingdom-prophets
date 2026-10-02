import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import App from '@/App';
import { Analytics } from '@vercel/analytics/react';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
        <Analytics />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
