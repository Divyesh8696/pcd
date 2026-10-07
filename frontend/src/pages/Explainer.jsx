import React, { useState } from 'react';
import { PageHeader, Card } from '../components/UI';

const LESSONS = [
  {
    id: 1, title: 'Finite Automata Basics', icon: '📚',
    concept: 'A finite automaton (FA) is a mathematical model of computation. It consists of a finite set of states, an alphabet of input symbols, a transition function, a start state, and a set of final (accepting) states.',
    example: 'Think of a turnstile: it can be either LOCKED or UNLOCKED. Inserting a coin unlocks it; pushing it locks it again. This is a DFA!',
    keyPoints: ['Finite number of states', 'Reads input left-to-right', 'Either accepts or rejects a string', 'No memory beyond current state'],
  },
  {
    id: 2, title: 'Deterministic Finite Automaton (DFA)', icon: '🔵',
    concept: 'In a DFA, for every state and every input symbol, there is exactly ONE next state. The machine cannot be in multiple states simultaneously.',
    example: 'DFA that accepts binary strings ending in "01": States q0→q1 on "0", q1→q2 on "1". q2 is the final state.',
    keyPoints: ['Exactly one transition per (state, symbol) pair', 'Deterministic = predictable behavior', 'Always processes entire input', 'Simpler to implement than NFA'],
  },
  {
    id: 3, title: 'Nondeterministic Finite Automaton (NFA)', icon: '🟣',
    concept: 'In an NFA, a state can have zero, one, or multiple transitions for the same symbol. The machine accepts if ANY possible path leads to an accepting state.',
    example: 'NFA that accepts strings ending in "ab": q0→q0 on a/b, q0→q1 on "a", q1→q2 on "b". q2 is final.',
    keyPoints: ['Multiple transitions allowed per symbol', 'Accepts if any path accepts', 'Often smaller/simpler than equivalent DFA', 'Easier to design for many languages'],
  },
  {
    id: 4, title: 'Epsilon-NFA (ε-NFA)', icon: '✨',
    concept: 'An ε-NFA allows transitions that consume no input symbol (epsilon/ε transitions). The ε-closure of a state is the set of all states reachable via only ε-transitions.',
    example: 'ε-NFA: q0 →ε→ q1 →a→ q2. Starting at q0, the ε-closure is {q0,q1}. Processing "a" from {q0,q1} gives {q2}.',
    keyPoints: ['ε-transitions are "free" moves', 'ε-closure = reachable by ε alone', 'Every ε-NFA has an equivalent DFA', 'Useful for building automata from regex'],
  },
  {
    id: 5, title: 'NFA → DFA (Subset Construction)', icon: '🔄',
    concept: 'Every NFA has an equivalent DFA. The subset construction algorithm creates DFA states that are SETS of NFA states, tracking all possible states the NFA could be in simultaneously.',
    example: 'NFA with states {q0,q1,q2}. DFA start state = ε-closure({q0}) = {q0}. On "0": move({q0},"0") = {q0,q1}. New DFA state = {q0,q1}. Continue...',
    keyPoints: ['DFA states are subsets of NFA states', 'Use ε-closure and move() operations', 'At most 2ⁿ DFA states for n NFA states', 'A DFA state is final if it contains an NFA final state'],
  },
  {
    id: 6, title: 'DFA Minimization', icon: '📉',
    concept: 'Multiple DFAs can recognize the same language. The minimal DFA has the fewest possible states. Hopcroft\'s algorithm finds equivalent states and merges them.',
    example: 'Two states are EQUIVALENT if for every string w, they either both accept w or both reject w. If equivalent → merge into one state.',
    keyPoints: ['Remove unreachable states first', 'Initial partition: {Finals} and {Non-Finals}', 'Refine: split groups whose members behave differently', 'Final partitions become minimized states'],
  },
  {
    id: 7, title: 'Regular Expressions', icon: '🔤',
    concept: 'Regular expressions (regex) describe regular languages using operators: concatenation (ab), union (a|b), and Kleene star (a*). Every regular language has an equivalent regex and DFA.',
    example: '(0|1)*1(0|1): Binary strings ending in "1" followed by exactly one symbol. Matches: "01", "10", "11", "001", etc.',
    keyPoints: ['ε = empty string', '∅ = empty language', 'a|b = a or b', 'a* = zero or more a\'s', 'Parentheses group sub-expressions'],
  },
  {
    id: 8, title: 'DFA → Regular Expression', icon: '🔁',
    concept: 'To convert a DFA to a regex, use state elimination (GNFA method): add a new start and final state, then eliminate original states one-by-one, updating transition labels with regex.',
    example: 'DFA: q0→q1 on "a", q1 is final. GNFA: S →ε→ q0 →a→ q1 →ε→ F. Eliminate q0 and q1: S → "a" → F. Regex = "a".',
    keyPoints: ['Add super-start state S and super-final state F', 'Eliminate one state at a time', 'For each (in,out) pair through eliminated state: update regex', 'Final transition S→F is the result'],
  },
];

export default function Explainer() {
  const [activeLesson, setActiveLesson] = useState(0);
  const lesson = LESSONS[activeLesson];

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="Algorithm Explainer & Learning Mode" subtitle="8 lessons covering all core automata theory concepts" icon="📖" />

      <div className="flex gap-6 min-h-0">
        {/* Lesson list */}
        <div className="w-72 flex-shrink-0">
          <Card className="p-3">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3 px-2">Lessons</p>
            <nav className="space-y-1">
              {LESSONS.map((l, i) => (
                <button key={l.id} onClick={() => setActiveLesson(i)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${i === activeLesson ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <span className="text-xl">{l.icon}</span>
                  <div>
                    <p className="text-xs opacity-60">Lesson {l.id}</p>
                    <p className="text-sm font-semibold leading-tight">{l.title}</p>
                  </div>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Lesson content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{lesson.icon}</span>
              <div>
                <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest">Lesson {lesson.id}</p>
                <h2 className="text-2xl font-black">{lesson.title}</h2>
              </div>
            </div>
          </Card>

          {/* Concept */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span> Concept
            </h3>
            <p className="text-gray-700 leading-relaxed">{lesson.concept}</p>
          </Card>

          {/* Example */}
          <Card className="border-l-4 border-l-amber-400 bg-amber-50">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span className="text-lg">📌</span> Example
            </h3>
            <p className="text-amber-900 leading-relaxed font-mono text-sm bg-white rounded-xl p-4 border border-amber-200">{lesson.example}</p>
          </Card>

          {/* Key Points */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">🔑</span> Key Points
            </h3>
            <ul className="space-y-2">
              {lesson.keyPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                  <span className="text-gray-700">{p}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <button onClick={() => setActiveLesson(l => Math.max(0, l-1))} disabled={activeLesson === 0}
              className="px-6 py-3 border border-gray-200 rounded-xl font-semibold disabled:opacity-30 hover:bg-gray-50 transition-all">
              ← Previous
            </button>
            <span className="flex items-center text-sm text-gray-500">{activeLesson+1} / {LESSONS.length}</span>
            <button onClick={() => setActiveLesson(l => Math.min(LESSONS.length-1, l+1))} disabled={activeLesson === LESSONS.length-1}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-30 hover:bg-indigo-700 transition-all">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
