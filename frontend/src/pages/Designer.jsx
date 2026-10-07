import React, { useState, useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAutomaton, EXAMPLES } from '../context/AutomatonContext';
import { PageHeader, Card, PrimaryButton, Badge } from '../components/UI';
import { Download, Upload, RotateCcw, CheckCircle } from 'lucide-react';

const toFlowElements = (auto) => {
  if (!auto?.states?.length) return { nodes: [], edges: [] };
  const n = auto.states.length;
  const nodes = auto.states.map((s, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = Math.min(180, 50 * n);
    const isFinal = auto.final_states.includes(s);
    const isStart = s === auto.start_state;
    return {
      id: s,
      position: { x: 300 + r * Math.cos(angle), y: 200 + r * Math.sin(angle) },
      data: { label: s },
      style: {
        borderRadius: '50%', width: 56, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isStart ? '#eef2ff' : isFinal ? '#f0fdf4' : '#fff',
        border: isFinal ? '4px double #10b981' : isStart ? '2px solid #6366f1' : '2px solid #94a3b8',
        fontWeight: 700, fontSize: 13, color: '#1e1b4b',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
    };
  });

  const edgeMap = {};
  Object.entries(auto.transitions || {}).forEach(([src, trans]) => {
    Object.entries(trans).forEach(([sym, tgt]) => {
      const targets = Array.isArray(tgt) ? tgt : [tgt];
      targets.forEach(t => { const k = `${src}→${t}`; edgeMap[k] = edgeMap[k] ? edgeMap[k] + ',' + sym : sym; });
    });
  });

  const edges = Object.entries(edgeMap).map(([key, label]) => {
    const [src, tgt] = key.split('→');
    return {
      id: `e-${key}`, source: src, target: tgt, label,
      animated: true, style: { stroke: '#6366f1' },
      labelStyle: { fontWeight: 700, fontSize: 12, fill: '#4338ca' },
      type: src === tgt ? 'selfConnecting' : 'default',
    };
  });

  return { nodes, edges };
};

export default function Designer() {
  const { automaton, loadAutomaton } = useAutomaton();
  const [jsonText, setJsonText] = useState(JSON.stringify(automaton, null, 2));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { nodes: initNodes, edges: initEdges } = toFlowElements(automaton);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const onConnect = useCallback((p) => setEdges(eds => addEdge({ ...p, animated: true }, eds)), [setEdges]);

  const applyJson = () => {
    setError(''); setSuccess('');
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.states || !parsed.alphabet || !parsed.start_state) throw new Error('Missing required fields: states, alphabet, start_state');
      if (!parsed.final_states) parsed.final_states = [];
      if (!parsed.transitions) parsed.transitions = {};
      if (!parsed.type) parsed.type = 'DFA';
      loadAutomaton(parsed, `Loaded ${parsed.type} in Designer`);
      const { nodes: n, edges: e } = toFlowElements(parsed);
      setNodes(n); setEdges(e);
      setSuccess('Automaton applied and set as active!');
    } catch (e) { setError(e.message); }
  };

  const loadExample = (key) => {
    const ex = EXAMPLES[key];
    setJsonText(JSON.stringify(ex, null, 2));
    loadAutomaton(ex, `Loaded example: ${key}`);
    const { nodes: n, edges: e } = toFlowElements(ex);
    setNodes(n); setEdges(e);
    setSuccess(`Loaded example: ${key}`);
  };

  const downloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'automaton.json'; a.click();
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6">
      <PageHeader title="Automaton Designer" subtitle="Build automata visually or via JSON" icon="✏️" />

      {/* Example loader */}
      <Card className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Load Example:</span>
        {Object.keys(EXAMPLES).map(k => (
          <button key={k} onClick={() => loadExample(k)}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
            {k.replace('EXAMPLE_', '')}
          </button>
        ))}
      </Card>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* JSON Editor */}
        <div className="w-80 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">JSON Editor</h3>
              <div className="flex gap-2">
                <button onClick={downloadJson} title="Download" className="p-2 rounded-lg hover:bg-gray-100"><Download size={16} /></button>
              </div>
            </div>
            <textarea
              className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              value={jsonText}
              onChange={e => { setJsonText(e.target.value); setError(''); setSuccess(''); }}
            />
            {error && <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
            {success && <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2"><CheckCircle size={16}/>{success}</div>}
            <PrimaryButton onClick={applyJson} className="mt-4 w-full">Apply & Set Active</PrimaryButton>
          </Card>

          {/* Automaton Stats */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-3">Current Active Automaton</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Type</span><Badge color={automaton.type === 'DFA' ? 'indigo' : 'purple'}>{automaton.type}</Badge></div>
              <div className="flex justify-between"><span className="text-gray-500">States</span><span className="font-bold">{automaton.states?.length ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Alphabet</span><span className="font-bold font-mono">{automaton.alphabet?.join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Finals</span><span className="font-bold">{automaton.final_states?.length ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Start</span><Badge>{automaton.start_state}</Badge></div>
            </div>
          </Card>
        </div>

        {/* React Flow canvas */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-full">
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
              <Background color="#e0e7ff" gap={20} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}
