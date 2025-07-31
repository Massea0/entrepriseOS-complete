import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/styles/globals.css'

// TODO: Import App component once created
const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-4xl font-bold text-center py-20 gradient-text">
        Enterprise OS - Modern Frontend
      </h1>
      <p className="text-center text-muted-foreground">
        Le nouveau frontend moderne est en cours de construction...
      </p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)