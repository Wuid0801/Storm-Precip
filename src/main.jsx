import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import faviconUrl from './assets/logo.svg?url';

let faviconLink = document.querySelector("link[rel='icon']");
if (!faviconLink) {
  faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = 'image/svg+xml';
  document.head.appendChild(faviconLink);
}
faviconLink.href = faviconUrl;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
