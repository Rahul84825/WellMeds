import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Handle stale dynamic imports when new production bundles are deployed
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected. Reloading to get latest bundle...', event);
  window.location.reload();
});

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
