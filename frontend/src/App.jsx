import { useState } from 'react'
import LandingPage from './components/LandingPage'

function App() {
  const [view, setView] = useState('home');

  return (
    <>
      {view === 'home' ? (
        <LandingPage onNavigate={(target) => setView(target)} />
      ) : (
        <div className="p-20 text-center">
          <h1 className="text-3xl font-bold">Pagina: {view}</h1>
          <button 
            onClick={() => setView('home')}
            className="mt-5 px-6 py-2 bg-slate-900 text-white rounded-lg"
          >
            Înapoi la Home
          </button>
        </div>
      )}
    </>
  )
}

export default App