import React, { createContext, useContext, useState, useCallback } from 'react';

const AutomatonContext = createContext(null);

const EXAMPLE_NFA = {
  type: 'NFA',
  states: ['q0', 'q1', 'q2'],
  alphabet: ['0', '1'],
  start_state: 'q0',
  final_states: ['q2'],
  transitions: {
    q0: { '0': ['q0', 'q1'], '1': ['q0'] },
    q1: { '1': ['q2'] },
    q2: {},
  },
};

const EXAMPLE_DFA = {
  type: 'DFA',
  states: ['q0', 'q1', 'q2', 'q3'],
  alphabet: ['0', '1'],
  start_state: 'q0',
  final_states: ['q2'],
  transitions: {
    q0: { '0': 'q1', '1': 'q0' },
    q1: { '0': 'q1', '1': 'q2' },
    q2: { '0': 'q3', '1': 'q0' },
    q3: { '0': 'q3', '1': 'q3' },
  },
};

const EXAMPLE_MIN = {
  type: 'DFA',
  states: ['a', 'b', 'c', 'd', 'e'],
  alphabet: ['0', '1'],
  start_state: 'a',
  final_states: ['c'],
  transitions: {
    a: { '0': 'b', '1': 'c' },
    b: { '0': 'a', '1': 'd' },
    c: { '0': 'e', '1': 'a' },
    d: { '0': 'e', '1': 'b' },
    e: { '0': 'e', '1': 'e' },
  },
};

const EXAMPLE_ENFA = {
  type: 'NFA',
  states: ['q0', 'q1', 'q2', 'q3'],
  alphabet: ['a', 'b'],
  start_state: 'q0',
  final_states: ['q3'],
  transitions: {
    q0: { 'ε': ['q1', 'q2'] },
    q1: { 'a': ['q1'], 'ε': ['q3'] },
    q2: { 'b': ['q2', 'q3'] },
    q3: {},
  },
};

export const EXAMPLES = { EXAMPLE_NFA, EXAMPLE_DFA, EXAMPLE_MIN, EXAMPLE_ENFA };

export function AutomatonProvider({ children }) {
  const [automaton, setAutomaton] = useState(EXAMPLE_NFA);
  const [history, setHistory] = useState([
    { time: new Date().toLocaleTimeString(), event: 'Session started' },
  ]);

  const addHistory = useCallback((event) => {
    setHistory(h => [{ time: new Date().toLocaleTimeString(), event }, ...h]);
  }, []);

  const loadAutomaton = useCallback((auto, label = 'Loaded automaton') => {
    setAutomaton(auto);
    addHistory(label);
  }, [addHistory]);

  return (
    <AutomatonContext.Provider value={{ automaton, loadAutomaton, history, addHistory }}>
      {children}
    </AutomatonContext.Provider>
  );
}

export const useAutomaton = () => {
  const ctx = useContext(AutomatonContext);
  if (!ctx) throw new Error('useAutomaton must be used inside AutomatonProvider');
  return ctx;
};
