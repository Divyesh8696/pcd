import React, { useState } from 'react';
import { checkEquivalence, simulateString } from '../lib/algorithms';
import { PageHeader, Card, PrimaryButton, MetricCard, AutomatonGraph, Badge } from '../components/UI';
import { useAutomaton } from '../context/AutomatonContext';

const COMPARE_DFA_B = {
  type: 'DFA', states: ['p0', 'p1', 'p2'],
  alphabet: ['0', '1'], start_state: 'p0', final_states: ['p2'],
  transitions: { p0: { '0': 'p0', '1': 'p1' }, p1: { '0': 'p0', '1': 'p2' }, p2: { '0': 'p2', '1': 'p2' } },
};

export default function Comparator() {
  const { automaton, addHistory } = useAutomaton();
  const [dfaB, setDfaB] = useState(COMPARE_DFA_B);
  const [dfaBText, setDfaBText] = useState(JSON.stringify(COMPARE_DFA_B, null, 2));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCompare = () => {
    setError('');
    try {
      const b = JSON.parse(dfaBText);
      setDfaB(b);
      if (automaton.type !== 'DFA' || b.type !== 'DFA') throw new Error('Both must be DFAs');
      const res = checkEquivalence(automaton, b);
      setResult({ ...res, dfaB: b });
      addHistory(`Equivalence check: ${res.equivalent ? 'EQUIVALENT' : 'NOT EQUIVALENT'}`);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="Automata Comparator" subtitle="Equivalence checking via product automaton BFS" icon="⚖️" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* DFA A */}
        <Card>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            DFA A <Badge color="indigo">Active Automaton</Badge>
          </h3>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between"><span>Type</span><Badge color={automaton.type==='DFA'?'indigo':'purple'}>{automaton.type}</Badge></div>
            <div className="flex justify-between"><span>States</span><span className="font-bold">{automaton.states?.length}</span></div>
            <div className="flex justify-between"><span>Finals</span><span className="font-bold">{automaton.final_states?.length}</span></div>
            <div className="flex justify-between"><span>Alphabet</span><span className="font-mono font-bold">{'{'+automaton.alphabet?.join(',')+'}' }</span></div>
          </div>
          <AutomatonGraph automaton={automaton} />
        </Card>

        {/* DFA B */}
        <Card>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">DFA B <Badge color="purple">Custom Input</Badge></h3>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-xs h-40 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none mb-3"
            value={dfaBText} onChange={e => setDfaBText(e.target.value)} />
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <AutomatonGraph automaton={dfaB} />
        </Card>
      </div>

      <div className="flex justify-center">
        <PrimaryButton onClick={handleCompare} className="px-12">
          ⚖️ Check Equivalence
        </PrimaryButton>
      </div>

      {result && (
        <>
          {/* Result banner */}
          <div className={`rounded-2xl p-6 text-center shadow-lg ${result.equivalent ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-r from-rose-500 to-red-600 text-white'}`}>
            {result.equivalent ? (
              <>
                <div className="text-5xl mb-2">✅</div>
                <h2 className="text-3xl font-black">The two DFAs are EQUIVALENT</h2>
                <p className="mt-2 opacity-80">They accept exactly the same language.</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-2">❌</div>
                <h2 className="text-3xl font-black">The two DFAs are NOT EQUIVALENT</h2>
                <div className="mt-3 bg-white/20 rounded-xl px-6 py-3 inline-block">
                  <p className="font-bold">Counterexample: <span className="font-mono text-2xl">{result.counterexample}</span></p>
                  <p className="text-sm mt-1">DFA A: {simulateString(automaton, result.counterexample === 'ε' ? '' : result.counterexample).accepted ? '✓ ACCEPTS' : '✗ REJECTS'} &nbsp;|&nbsp;
                    DFA B: {simulateString(result.dfaB, result.counterexample === 'ε' ? '' : result.counterexample).accepted ? '✓ ACCEPTS' : '✗ REJECTS'}</p>
                </div>
              </>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="DFA A States" value={automaton.states.length} color="indigo" />
            <MetricCard label="DFA B States" value={result.dfaB.states.length} color="purple" />
            <MetricCard label="DFA A Finals" value={automaton.final_states.length} color="emerald" />
            <MetricCard label="DFA B Finals" value={result.dfaB.final_states.length} color="amber" />
          </div>
        </>
      )}
    </div>
  );
}
