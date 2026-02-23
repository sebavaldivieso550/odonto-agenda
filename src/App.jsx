import Calendar from '../src/components/calendar/calendar';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b p-4 mb-4">
        <h1 className="text-xl font-bold text-med-blue">OdontoApp <span className="text-slate-400 font-light">| Agenda Médica</span></h1>
      </nav>
      <Calendar />
    </div>
  )
}

export default App