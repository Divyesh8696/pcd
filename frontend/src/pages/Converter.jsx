import React, { useState } from 'react';
import { useAutomaton } from '../context/AutomatonContext';
import { nfaToDFA } from '../lib/algorithms';
import { PageHeader, Card, PrimaryButton, StepTable, MetricCard, AutomatonGraph, Badge } from '../components/UI';
import { ArrowRight } from 'lucide-react';

export default function Converter() {
  const { automaton, loadAutomaton, addHistory } = useAutomaton();
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('steps');

  const handleConvert = () => {
    if (!automaton?.start_state) return;
    try {
      const { dfa, steps } = nfaToDFA(automaton);
      setResult({ dfa, steps });
      addHistory(`Converted NFA → DFA: ${automaton.states.length} states → ${dfa.states.length} states`);
    } catch (e) {
      alert('Conversion error: ' + e.message);
    }
  };

  const tableRows = result?.steps.map(s => [
    <Badge key="d" color="indigo">{s.dfaState}</Badge>,
    '{' + s.nfaStates.join(', ') + '}',
    <span key="s" className="font-mono font-bold">{s.symbol}</span>,
    '{' + s.moveResult.join(', ') + '}',
    '{' + s.epsClosure.join(', ') + '}',
    <Badge key="n" color="emerald">{s.nextDfaState}</Badge>,
  ]) ?? [];

  const tabs = ['steps', 'dfa-graph', 'dfa-json'];

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="NFA → DFA Converter" subtitle="Subset construction algorithm with full derivation" icon="🔄" />

      {/* Active automaton info + convert button */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <span className="text-2xl">📐</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">Active Automaton</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={automaton.type === 'DFA' ? 'indigo' : 'purple'}>{automaton.type}</Badge>
              <span className="text-sm text-gray-500">{automaton.states?.length} states · Σ = {'{' + automaton.alphabet?.join(', ') + '}'}</span>
            </div>
          </div>
        </div>
        {automaton.type === 'DFA'
          ? <div className="text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-sm font-semibold">Already a DFA — load an NFA from Designer</div>
          : <PrimaryButton onClick={handleConvert} className="flex items-center gap-2">Run Subset Construction <ArrowRight size={16}/></PrimaryButton>
        }
      </Card>

      {result && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="NFA States" value={automaton.states.length} color="purple" />
            <MetricCard label="DFA States" value={result.dfa.states.length} color="indigo" />
            <MetricCard label="DFA Finals" value={result.dfa.final_states.length} color="emerald" />
            <MetricCard label="Conv. Steps" value={result.steps.length} color="amber" />
          </div>

          {/* Tabs */}
          <Card>
            <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
              {[['steps', '📋 Derivation Table'], ['dfa-graph', '🔵 DFA Graph'], ['dfa-json', '{ } DFA JSON']].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'steps' && (
              <div>
                <p className="text-sm text-gray-500 mb-4">Each row shows how a DFA state is computed from a set of NFA states using move() and ε-closure.</p>
                <StepTable
                  columns={['DFA State', 'NFA States', 'Symbol', 'move()', 'ε-closure', 'Next DFA State']}
                  rows={tableRows}
                />
              </div>
            )}

            {activeTab === 'dfa-graph' && (
              <div>
                <AutomatonGraph automaton={result.dfa} />
                <div className="mt-4 flex gap-3 justify-center flex-wrap">
                  {result.dfa.states.map(s => (
                    <div key={s} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${result.dfa.final_states.includes(s) ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : s === result.dfa.start_state ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                      {s} {s === result.dfa.start_state ? '(start)' : result.dfa.final_states.includes(s) ? '(final)' : ''}
                    </div>
                  ))}
                </div>
                <PrimaryButton onClick={() => loadAutomaton(result.dfa, 'Set converted DFA as active')} className="mt-4">
                  Set as Active Automaton
                </PrimaryButton>
              </div>
            )}

            {activeTab === 'dfa-json' && (
              <pre className="bg-gray-50 rounded-xl p-4 text-sm font-mono overflow-auto border border-gray-200">
                {JSON.stringify(result.dfa, null, 2)}
              </pre>
            )}
          </Card>
        </>
      )}

      {!result && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-8xl mb-4">🔄</div>
          <p className="text-xl font-bold">Load an NFA in the Designer then click Convert</p>
        </div>
      )}
    </div>
  );
}
