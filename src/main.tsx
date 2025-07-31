import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/styles/globals.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">EntrepriseOS</h1>
        <p className="text-gray-600">Application is running! ✅</p>
        <p className="text-sm text-gray-500 mt-4">
          Le serveur fonctionne sur http://localhost:3000
        </p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)