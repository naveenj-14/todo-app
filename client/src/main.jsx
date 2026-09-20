import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AeroShards from './components/AeroShards';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <AeroShards />
      <App />
    </>
  </React.StrictMode>
);
