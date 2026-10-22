import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import App from '@/App';
import CookieConsent from '@/components/CookieConsent';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
        <CookieConsent />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
