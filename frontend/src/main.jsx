import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AutomatonProvider } from './context/AutomatonContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AutomatonProvider>
      <App />
    </AutomatonProvider>
  </StrictMode>,
)
