import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';  // or './index.css' if you renamed
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
