
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import BlueThemeProvider from './components/ui/BlueThemeProvider.tsx'

createRoot(document.getElementById("root")!).render(
  <BlueThemeProvider>
    <App />
  </BlueThemeProvider>
);
