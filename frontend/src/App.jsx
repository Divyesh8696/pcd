import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Settings, PlayCircle, Minimize2, ArrowRightLeft, Database, Search, Type, Table, BookOpen, Trophy, Clock, Info } from 'lucide-react';
import Designer from './pages/Designer';
import Simulator from './pages/Simulator';
import Minimizer from './pages/Minimizer';
import Converter from './pages/Converter';
import Comparator from './pages/Comparator';
import RegexPage from './pages/RegexPage';
import TransitionTable from './pages/TransitionTable';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-dark text-white flex flex-col h-full overflow-y-auto shrink-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-wider text-primary">AUTOMATA<span className="text-secondary">PRO</span></h1>
            <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">MERN Edition</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4 pb-6">
            <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              <Database size={20} />
              <span>Home</span>
            </Link>
            <Link to="/designer" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              <Settings size={20} />
              <span>Designer</span>
            </Link>
            <Link to="/converter" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              <ArrowRightLeft size={20} />
              <span>NFA → DFA</span>
            </Link>
            <Link to="/minimizer" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              <Minimize2 size={20} />
              <span>Minimizer</span>
            </Link>
            <Link to="/simulator" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              <PlayCircle size={20} />
              <span>Simulator</span>
            </Link>
            <Link to="/regex" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              <Type size={20} />
              <span>DFA → Regex</span>
            </Link>
            <Link to="/comparator" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              <Search size={20} />
              <span>Comparator</span>
            </Link>
            <Link to="/table" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              <Table size={20} />
              <span>Transition Table</span>
            </Link>
          </nav>
          
          <div className="p-6 text-sm text-gray-500 mt-auto">
            &copy; 2026 AutomataPro
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/designer" element={<Designer />} />
            <Route path="/converter" element={<Converter />} />
            <Route path="/minimizer" element={<Minimizer />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/regex" element={<RegexPage />} />
            <Route path="/comparator" element={<Comparator />} />
            <Route path="/table" element={<TransitionTable />} />
            <Route path="*" element={<div className="p-10 text-xl text-gray-400">Module coming soon...</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const Home = () => (
  <div className="p-10 max-w-5xl mx-auto">
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-10 border border-gray-100">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6">
        Welcome to AUTOMATALAB PRO
      </h1>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        The most advanced, interactive platform for designing, simulating, and optimizing finite automata. Completely rewritten from the ground up using the modern MERN stack.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Designer", icon: <Settings className="text-primary" size={32}/>, desc: "Build visually with React Flow" },
          { title: "Simulator", icon: <PlayCircle className="text-secondary" size={32}/>, desc: "Step-by-step interactive tracing" },
          { title: "NFA → DFA", icon: <ArrowRightLeft className="text-purple-500" size={32}/>, desc: "Subset construction engine" }
        ].map((feat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all cursor-pointer group">
            <div className="mb-4 bg-white w-14 h-14 flex items-center justify-center rounded-xl shadow-sm group-hover:scale-110 transition-transform">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{feat.title}</h3>
            <p className="text-gray-500 mt-2">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default App;
