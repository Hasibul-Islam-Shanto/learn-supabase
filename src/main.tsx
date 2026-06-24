import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './app/App.tsx';
import { AuthProvider } from './app/providers/AuthProvider.tsx';
import { MessagesProvider } from './app/providers/MessagesProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MessagesProvider>
          <App />
        </MessagesProvider>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
);
