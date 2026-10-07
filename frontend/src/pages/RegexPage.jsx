import React, { useState } from 'react';
import { useAutomaton } from '../context/AutomatonContext';
import { dfaToRegex } from '../lib/algorithms';
import { PageHeader, Card, PrimaryButton } from '../components/UI';

export default function RegexPage() {
  const { automaton, addHistory } = useAutomaton();
  const [result, setResult] = useState(null);

  const handleGenerate = () => {
    if (automaton.type !== 'DFA') { alert('Please load a DFA first.'); return; }
    try {
      const { regex, steps } = dfaToRegex(automaton);
      setResult({ regex, steps });
      addHistory(`Generated regex: ${regex}`);
    } catch (e) { alert('Regex generation error: ' + e.message); }
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="DFA → Regular Expression" subtitle="State elimination (GNFA) algorithm" icon="🔤" />

      <Card className="flex items-center justify-between flex-wrap gap-4">
        {automaton.type !== 'DFA'
          ? <p className="text-amber-600 font-semibold">⚠️ Load a DFA first</p>
          : <p className="text-gray-600 text-sm">Ready: <strong>{automaton.states?.length}</strong> state DFA</p>
        }
        <PrimaryButton onClick={handleGenerate} disabled={automaton.type !== 'DFA'}>Generate Regex</PrimaryButton>
      </Card>

      {result && (
        <>
          <Card className="text-center py-8">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Resulting Regular Expression</p>
            <div className="inline-block bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-8 py-5">
              <p className="text-3xl font-black font-mono text-indigo-800 break-all">{result.regex}</p>
            </div>
            <p className="mt-4 text-sm text-gray-500">This regex describes the same language as the input DFA</p>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-800 mb-4">State Elimination Steps</h3>
            <div className="space-y-3">
              {result.steps.map((s, i) => (
                <div key={i} className={`p-4 rounded-xl border ${i === result.steps.length - 1 ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">{i + 1}</span>
                    <h4 className="font-semibold text-gray-700 text-sm">{s.description}</h4>
                  </div>
                  <div className="ml-10 space-y-1">
                    {Object.entries(s.gnfa).map(([from, tos]) =>
                      Object.entries(tos).map(([to, regex]) => (
                        <div key={`${from}-${to}`} className="text-sm font-mono text-gray-600">
                          <span className="text-indigo-600 font-bold">{from}</span>
                          <span className="mx-2 text-gray-400">─</span>
                          <span className="bg-white px-2 py-0.5 rounded border text-indigo-800 font-bold">{regex}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-emerald-600 font-bold">{to}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {!result && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-8xl mb-4">🔤</div>
          <p className="text-xl font-bold">Generate a regular expression from your DFA</p>
        </div>
      )}
    </div>
  );
}
