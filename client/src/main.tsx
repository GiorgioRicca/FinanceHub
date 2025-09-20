import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";


if (!sessionStorage.getItem('cache-cleared')) {
  sessionStorage.setItem('cache-cleared', 'true');
  
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
  
  
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
  
  
  setTimeout(() => {
    window.location.reload();
  }, 100);
} else {
  
  createRoot(document.getElementById("root")!).render(<App />);
}
