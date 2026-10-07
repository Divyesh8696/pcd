import React from 'react';
import { useAutomaton } from '../context/AutomatonContext';
import { buildTransitionTable } from '../lib/algorithms';
import { PageHeader, Card, Badge } from '../components/UI';
import { Download } from 'lucide-react';

export default function TransitionTable() {
  const { automaton } = useAutomaton();

  if (!automaton?.states?.length) return (
    <div className="p-8"><PageHeader title="Transition Table" icon="📊" />
      <div className="text-center py-20 text-gray-400"><p className="text-xl font-bold">No automaton loaded</p></div>
    </div>
  );

  const symbols = automaton.type === 'NFA' ? [...automaton.alphabet, 'ε'] : automaton.alphabet;
  const rows = buildTransitionTable(automaton);

  const downloadCSV = () => {
    const header = ['State', ...symbols].join(',');
    const body = rows.map(r => [
      (r.isStart ? '→' : '') + (r.isFinal ? '*' : '') + r.state,
      ...symbols.map(s => r[s] ?? '∅')
    ].join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'transition_table.csv'; a.click();
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="Transition Table" subtitle="Visual representation of the transition function" icon="📊" />

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge color={automaton.type === 'DFA' ? 'indigo' : 'purple'}>{automaton.type}</Badge>
            <span className="text-sm text-gray-500">{automaton.states.length} states · Σ = {'{' + automaton.alphabet.join(',') + '}'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="text-indigo-600 font-bold">→</span> Start state</span>
            <span className="flex items-center gap-1"><span className="text-emerald-600 font-bold">*</span> Final state</span>
            <span className="flex items-center gap-1"><span className="font-mono">∅</span> No transition</span>
            <button onClick={downloadCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Download size={14} /> CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-5 py-4 font-bold rounded-tl-2xl">State</th>
                {symbols.map(s => (
                  <th key={s} className="px-5 py-4 font-bold text-center font-mono last:rounded-tr-2xl">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.state}
                  className={`border-t border-gray-100 transition-colors ${row.isStart && row.isFinal ? 'bg-purple-50' : row.isStart ? 'bg-indigo-50' : row.isFinal ? 'bg-emerald-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-5 py-3 font-bold">
                    <div className="flex items-center gap-2">
                      {row.isStart && <span className="text-indigo-600 font-black text-lg">→</span>}
                      {row.isFinal && <span className="text-emerald-600 font-black text-lg">*</span>}
                      <span className="font-mono">{row.state}</span>
                      {row.isStart && <Badge color="indigo">start</Badge>}
                      {row.isFinal && <Badge color="emerald">final</Badge>}
                    </div>
                  </td>
                  {symbols.map(s => (
                    <td key={s} className="px-5 py-3 text-center font-mono font-semibold">
                      <span className={row[s] === '∅' ? 'text-gray-300' : 'text-gray-800'}>{row[s]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
