import React, { useState } from 'react';
import { useAutomaton } from '../context/AutomatonContext';
import { simulateString } from '../lib/algorithms';
import { PageHeader, Card, PrimaryButton, StepTable, MetricCard, AutomatonGraph } from '../components/UI';
import { SkipBack, SkipForward, Play, RotateCcw } from 'lucide-react';

export default function Simulator() {
  const { automaton, addHistory } = useAutomaton();
  const [inputStr, setInputStr] = useState('01');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);

  const handleSimulate = () => {
    if (!automaton?.start_state) return;
    const r = simulateString(automaton, inputStr);
    setResult(r);
    setStep(0);
    addHistory(`Simulated "${inputStr}" on ${automaton.type} → ${r.accepted ? 'ACCEPTED' : 'REJECTED'}`);
  };

  const currentStepData = result?.steps[step];
  const highlightStates = currentStepData?.nextStates ?? [];

  const tableRows = result?.steps.map(s => [
    s.step,
    s.symbol,
    '{' + s.currentStates.join(', ') + '}',
    s.nextStates.length ? '{' + s.nextStates.join(', ') + '}' : '∅',
    s.status,
  ]) ?? [];

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="String Simulator" subtitle="Trace string processing step-by-step" icon="▶️" />

      {/* Input row */}
      <Card className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Input String</label>
          <input type="text" value={inputStr} onChange={e => setInputStr(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSimulate()}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest"
            placeholder="e.g. 01101" />
        </div>
        <PrimaryButton onClick={handleSimulate} className="flex items-center gap-2 h-[50px]">
          <Play size={18} /> Simulate
        </PrimaryButton>
        {result && (
          <button onClick={() => { setResult(null); setStep(0); }}
            className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 h-[50px]">
            <RotateCcw size={18} />
          </button>
        )}
      </Card>

      {result && (
        <>
          {/* Result banner */}
          <div className={`rounded-2xl p-5 flex items-center gap-4 text-white shadow-lg ${result.accepted ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}>
            <span className="text-4xl">{result.accepted ? '✅' : '❌'}</span>
            <div>
              <p className="text-2xl font-black">{result.accepted ? 'ACCEPTED' : 'REJECTED'}</p>
              <p className="opacity-80 text-sm">Input: <span className="font-mono font-bold">"{inputStr}"</span> · {result.steps.length - 1} transitions</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Input Length" value={inputStr.length} color="indigo" />
            <MetricCard label="Steps Taken" value={result.steps.length - 1} color="purple" />
            <MetricCard label="States" value={automaton.states?.length} color="emerald" />
            <MetricCard label="Result" value={result.accepted ? 'Accept' : 'Reject'} color={result.accepted ? 'emerald' : 'rose'} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Graph */}
            <Card>
              <h3 className="font-bold text-gray-800 mb-4">Execution Graph
                <span className="ml-2 text-sm text-gray-400 font-normal">— highlighted: current state</span>
              </h3>
              <AutomatonGraph automaton={automaton} highlightStates={highlightStates} />

              {/* Step Controls */}
              <div className="mt-4 flex items-center gap-3 justify-center">
                <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <SkipBack size={20} />
                </button>
                <div className="flex gap-1">
                  {result.steps.map((_, i) => (
                    <button key={i} onClick={() => setStep(i)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === step ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {i}
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(s => Math.min(result.steps.length-1, s+1))} disabled={step === result.steps.length-1}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <SkipForward size={20} />
                </button>
              </div>
            </Card>

            {/* Step trace */}
            <Card>
              <h3 className="font-bold text-gray-800 mb-4">Execution Trace</h3>
              <StepTable
                columns={['Step', 'Symbol', 'Current State(s)', 'Next State(s)', 'Status']}
                rows={tableRows}
                highlightRow={step}
              />
            </Card>
          </div>
        </>
      )}

      {!result && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-8xl mb-4">▶️</div>
            <p className="text-xl font-bold">Enter a string and click Simulate</p>
            <p className="text-sm mt-2">Works for both DFA and NFA (including ε-NFA)</p>
          </div>
        </div>
      )}
    </div>
  );
}
