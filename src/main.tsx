
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import BlueThemeProvider from './components/ui/BlueThemeProvider.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { StoreProvider } from './contexts/StoreContext.tsx'

createRoot(document.getElementById("root")!).render(
  <BlueThemeProvider>
    <AuthProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </AuthProvider>
  </BlueThemeProvider>
);
