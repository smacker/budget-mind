import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// this automatically triggers data fetching as soon as token becomes available
// and sends new transactions to gsheet when they are added to a store
import './features/sync/aspire.ts';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
