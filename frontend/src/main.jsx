import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import IPhoneFrame from './components/IPhoneFrame';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IPhoneFrame>
      <App />
    </IPhoneFrame>
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#fff',
          color: '#1a1a2e',
          border: '1px solid #ede9fe',
          borderRadius: '12px',
          fontSize: '13px',
          boxShadow: '0 4px 20px rgba(124,58,237,0.15)'
        },
        success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
      }}
    />
  </React.StrictMode>
);
