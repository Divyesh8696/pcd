import React, { useState } from 'react';
import { useAutomaton } from '../context/AutomatonContext';
import { minimizeDFA, getReachableStates, getDeadStates } from '../lib/algorithms';
import { PageHeader, Card, PrimaryButton, MetricCard, AutomatonGraph, Badge } from '../components/UI';

export default function Minimizer() {
  const { automaton, loadAutomaton, addHistory } = useAutomaton();
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');

  const handleMinimize = () => {
    if (automaton.type !== 'DFA') { alert('Please load a DFA first.'); return; }
    try {
      const { minDFA, steps } = minimizeDFA(automaton);
      setResult({ minDFA, steps });
      addHistory(`Minimized DFA: ${automaton.states.length} → ${minDFA.states.length} states`);
    } catch (e) { alert('Minimization error: ' + e.message); }
  };

  const reachable = automaton.states ? [...getReachableStates(automaton)] : [];
  const unreachable = automaton.states?.filter(s => !reachable.includes(s)) ?? [];
  const deadStates = automaton.type === 'DFA' && automaton.states ? getDeadStates(automaton) : [];

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="DFA Minimizer" subtitle="Hopcroft partition refinement algorithm" icon="📉" />

      {/* Pre-analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total States" value={automaton.states?.length ?? 0} color="indigo" />
        <MetricCard label="Unreachable States" value={unreachable.length} color={unreachable.length > 0 ? 'rose' : 'emerald'} />
        <MetricCard label="Dead States" value={deadStates.length} color={deadStates.length > 0 ? 'amber' : 'emerald'} />
      </div>

      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div>
          {automaton.type !== 'DFA'
            ? <p className="text-amber-600 font-semibold">⚠️ Active automaton is NFA — convert to DFA first</p>
            : <p className="text-gray-600 text-sm">Ready to minimize <strong>{automaton.states?.length}</strong> state DFA</p>
          }
        </div>
        <PrimaryButton onClick={handleMinimize} disabled={automaton.type !== 'DFA'}>
          Run Minimization
        </PrimaryButton>
      </Card>

      {result && (
        <>
          {/* Result Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Original States" value={automaton.states.length} color="purple" />
            <MetricCard label="Minimized States" value={result.minDFA.states.length} color="emerald" />
            <MetricCard label="States Saved" value={automaton.states.length - result.minDFA.states.length} color="indigo" />
            <MetricCard label="Reduction" value={`${Math.round((1 - result.minDFA.states.length / automaton.states.length) * 100)}%`} color="amber" />
          </div>

          {/* Tabs */}
          <Card>
            <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4 flex-wrap">
              {[['analysis', '🔍 Analysis'], ['partitions', '📊 Partitions'], ['min-graph', '🟢 Min. DFA'], ['min-json', '{ } JSON']].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'analysis' && (
              <div className="space-y-4">
                {result.steps.filter(s => s.phase === 'reachability').map((s, i) => (
                  <div key={i} className="space-y-3">
                    <h4 className="font-bold text-gray-700">Step 1: Reachability Analysis</h4>
                    <div className="flex flex-wrap gap-2">
                      {s.reachable.map(st => <Badge key={st} color="emerald">{st} ✓ reachable</Badge>)}
                      {s.unreachable.map(st => <Badge key={st} color="rose">{st} ✗ unreachable</Badge>)}
                    </div>
                    {deadStates.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-700 mt-4">Dead States (no path to final):</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {deadStates.map(st => <Badge key={st} color="amber">{st} dead</Badge>)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'partitions' && (
              <div className="space-y-4">
                {result.steps.filter(s => s.phase === 'partition').map((s, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-3">
                      {s.iteration === 0 ? 'Initial Partition (Finals vs Non-Finals)' : `Iteration ${s.iteration}`}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {s.partitions.map((part, j) => (
                        <div key={j} className="px-3 py-2 bg-white border-2 border-indigo-200 rounded-xl text-sm font-mono font-bold text-indigo-700">
                          {'{' + part.join(', ') + '}'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-800">✅ Final Partition (No further splitting possible)</h4>
                  <p className="text-sm text-emerald-600 mt-1">Each partition becomes one state in the minimized DFA</p>
                </div>
              </div>
            )}

            {activeTab === 'min-graph' && (
              <div>
                <AutomatonGraph automaton={result.minDFA} />
                <PrimaryButton onClick={() => loadAutomaton(result.minDFA, 'Set minimized DFA as active')} className="mt-4">
                  Set as Active Automaton
                </PrimaryButton>
              </div>
            )}

            {activeTab === 'min-json' && (
              <pre className="bg-gray-50 rounded-xl p-4 text-sm font-mono overflow-auto border border-gray-200">
                {JSON.stringify(result.minDFA, null, 2)}
              </pre>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
