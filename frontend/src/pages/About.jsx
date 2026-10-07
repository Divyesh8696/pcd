import React from 'react';
import { PageHeader, Card } from '../components/UI';

export default function About() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader title="About AutomataLab Pro" subtitle="Interactive Finite Automata Platform" icon="ℹ️" />
      <Card>
        <h2 className="text-2xl font-bold mb-4">MERN Edition</h2>
        <p className="text-gray-600 mb-4">
          AUTOMATALAB PRO is an advanced interactive platform for designing, simulating, and optimizing finite automata.
          Originally built in Python and Streamlit, it has been fully ported to a modern React frontend using the MERN stack.
        </p>
        <h3 className="text-xl font-bold mb-2 mt-6">Features</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li><strong>Automaton Designer:</strong> Build and edit NFAs/DFAs visually or via JSON.</li>
          <li><strong>NFA → DFA Conversion:</strong> Step-by-step subset construction.</li>
          <li><strong>DFA Minimization:</strong> See reachability and partition refinement in action.</li>
          <li><strong>String Simulator:</strong> Step-by-step execution path animation.</li>
          <li><strong>DFA → Regex:</strong> Generate regular expressions using state elimination.</li>
          <li><strong>Equivalence & Comparator:</strong> Test if two DFAs are equivalent and find counterexamples.</li>
          <li><strong>Algorithm Explainer:</strong> Learn the theory behind the transformations.</li>
          <li><strong>Challenge Mode:</strong> Test your knowledge of Finite Automata.</li>
        </ul>
      </Card>
    </div>
  );
}
