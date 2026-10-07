// Shared reusable UI components

import React from 'react';

// Page wrapper with header
export const PageHeader = ({ title, subtitle, icon }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-4xl">{icon}</span>
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
    <div className="h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 mt-3" />
  </div>
);

// Metric card
export const MetricCard = ({ label, value, color = 'indigo' }) => {
  const colors = {
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700',
    emerald: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
    rose: 'from-rose-50 to-rose-100 border-rose-200 text-rose-700',
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${colors[color]}`}>
      <p className="text-sm font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
};

// Step table
export const StepTable = ({ columns, rows, highlightRow }) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
        <tr>
          {columns.map((c, i) => (
            <th key={i} className="px-4 py-3 font-bold">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            className={`border-t border-gray-100 transition-colors ${i === highlightRow ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-gray-50'}`}
          >
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 font-mono text-sm">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Badge
export const Badge = ({ children, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[color]}`}>
      {children}
    </span>
  );
};

// Primary button
export const PrimaryButton = ({ children, onClick, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all ${className}`}
  >
    {children}
  </button>
);

// Card
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

// Automaton graph visualization (SVG-based, no external lib dependency)
// We place nodes in a circle and draw edges between them
export const AutomatonGraph = ({ automaton, highlightStates = [] }) => {
  if (!automaton || !automaton.states?.length) return null;

  const states = automaton.states;
  const n = states.length;
  const cx = 300, cy = 200, r = Math.min(150, 40 * n);
  const nodeR = 26;

  const positions = {};
  states.forEach((s, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions[s] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // Group transitions by (src, tgt) to merge labels
  const edgeMap = {};
  Object.entries(automaton.transitions || {}).forEach(([src, trans]) => {
    Object.entries(trans).forEach(([sym, tgt]) => {
      const targets = Array.isArray(tgt) ? tgt : [tgt];
      targets.forEach(t => {
        const key = `${src}→${t}`;
        edgeMap[key] = edgeMap[key] ? edgeMap[key] + ',' + sym : sym;
      });
    });
  });

  return (
    <svg viewBox="0 0 600 400" className="w-full h-full" style={{ minHeight: 300 }}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
        </marker>
        <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
        </marker>
      </defs>

      {/* Start arrow */}
      {positions[automaton.start_state] && (() => {
        const pos = positions[automaton.start_state];
        return <line x1={pos.x - 50} y1={pos.y} x2={pos.x - nodeR} y2={pos.y} stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />;
      })()}

      {/* Edges */}
      {Object.entries(edgeMap).map(([key, label]) => {
        const [src, tgt] = key.split('→');
        const p1 = positions[src], p2 = positions[tgt];
        if (!p1 || !p2) return null;

        if (src === tgt) {
          // Self-loop
          return (
            <g key={key}>
              <path d={`M${p1.x - 10},${p1.y - nodeR} C${p1.x - 40},${p1.y - 80} ${p1.x + 40},${p1.y - 80} ${p1.x + 10},${p1.y - nodeR}`}
                fill="none" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
              <text x={p1.x} y={p1.y - 68} textAnchor="middle" fontSize="12" fill="#4338ca" fontWeight="bold">{label}</text>
            </g>
          );
        }

        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / dist, uy = dy / dist;
        const x1 = p1.x + ux * nodeR, y1 = p1.y + uy * nodeR;
        const x2 = p2.x - ux * nodeR, y2 = p2.y - uy * nodeR;
        const mx = (x1 + x2) / 2 - uy * 25, my = (y1 + y2) / 2 + ux * 25;

        return (
          <g key={key}>
            <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
              fill="none" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
            <text x={mx} y={my - 4} textAnchor="middle" fontSize="12" fill="#4338ca" fontWeight="bold">{label}</text>
          </g>
        );
      })}

      {/* Nodes */}
      {states.map(s => {
        const pos = positions[s];
        const isHighlight = highlightStates.includes(s);
        const isFinal = automaton.final_states.includes(s);
        return (
          <g key={s}>
            {isFinal && <circle cx={pos.x} cy={pos.y} r={nodeR + 5} fill="none" stroke={isHighlight ? '#ef4444' : '#10b981'} strokeWidth="2" />}
            <circle cx={pos.x} cy={pos.y} r={nodeR}
              fill={isHighlight ? '#fef2f2' : '#eef2ff'}
              stroke={isHighlight ? '#ef4444' : '#6366f1'}
              strokeWidth={isHighlight ? 3 : 2} />
            <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="13" fontWeight="bold"
              fill={isHighlight ? '#dc2626' : '#3730a3'}>{s}</text>
          </g>
        );
      })}
    </svg>
  );
};
