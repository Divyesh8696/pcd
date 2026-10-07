// ============================================================
// AUTOMATALAB PRO - Complete Algorithms Library (JS)
// ============================================================

// ─── EPSILON CLOSURE ────────────────────────────────────────
export const getEpsilonClosure = (states, transitions) => {
  let closure = new Set(states);
  let stack = [...states];
  while (stack.length > 0) {
    let state = stack.pop();
    let eps = (transitions[state] || {})['ε'] || [];
    if (!Array.isArray(eps)) eps = [eps];
    eps.forEach(s => { if (!closure.has(s)) { closure.add(s); stack.push(s); } });
  }
  return closure;
};

// ─── MOVE ────────────────────────────────────────────────────
export const move = (states, symbol, transitions) => {
  let result = new Set();
  states.forEach(state => {
    let targets = (transitions[state] || {})[symbol] || [];
    if (!Array.isArray(targets)) targets = [targets];
    targets.forEach(t => result.add(t));
  });
  return result;
};

// ─── NFA TO DFA (SUBSET CONSTRUCTION) ───────────────────────
export const nfaToDFA = (nfa) => {
  const alphabet = nfa.alphabet.filter(s => s !== 'ε');
  const steps = [];
  const dfaStateMap = new Map(); // frozenKey -> dfaStateName
  const queue = [];

  const frozenKey = (set) => [...set].sort().join(',');
  const getName = (set) => {
    const key = frozenKey(set);
    if (!dfaStateMap.has(key)) {
      dfaStateMap.set(key, `Q${dfaStateMap.size}`);
      queue.push(set);
    }
    return dfaStateMap.get(key);
  };

  const startClosure = getEpsilonClosure([nfa.start_state], nfa.transitions);
  const startName = getName(startClosure);
  const dfaTransitions = {};
  const processed = new Set();

  while (queue.length > 0) {
    const currentSet = queue.shift();
    const currentKey = frozenKey(currentSet);
    if (processed.has(currentKey)) continue;
    processed.add(currentKey);

    const currentName = dfaStateMap.get(currentKey);
    dfaTransitions[currentName] = {};

    for (const sym of alphabet) {
      const moved = move(currentSet, sym, nfa.transitions);
      const closure = getEpsilonClosure([...moved], nfa.transitions);
      if (closure.size === 0) continue;
      const nextName = getName(closure);
      dfaTransitions[currentName][sym] = nextName;

      steps.push({
        dfaState: currentName,
        nfaStates: [...currentSet].sort(),
        symbol: sym,
        moveResult: [...moved].sort(),
        epsClosure: [...closure].sort(),
        nextDfaState: nextName,
      });
    }
  }

  const nfaFinals = new Set(nfa.final_states);
  const dfaFinals = [];
  dfaStateMap.forEach((name, key) => {
    const nfaSet = new Set(key.split(',').filter(Boolean));
    if ([...nfaSet].some(s => nfaFinals.has(s))) dfaFinals.push(name);
  });

  const dfa = {
    type: 'DFA',
    states: [...dfaStateMap.values()],
    alphabet,
    start_state: startName,
    final_states: dfaFinals,
    transitions: dfaTransitions,
  };

  return { dfa, steps };
};

// ─── REACHABLE STATES ────────────────────────────────────────
export const getReachableStates = (dfa) => {
  const visited = new Set();
  const stack = [dfa.start_state];
  while (stack.length) {
    const s = stack.pop();
    if (visited.has(s)) continue;
    visited.add(s);
    Object.values(dfa.transitions[s] || {}).forEach(t => {
      if (!visited.has(t)) stack.push(t);
    });
  }
  return visited;
};

// ─── DFA MINIMIZATION (HOPCROFT) ─────────────────────────────
export const minimizeDFA = (dfa) => {
  const steps = [];

  // Step 1: Remove unreachable states
  const reachable = getReachableStates(dfa);
  const unreachable = dfa.states.filter(s => !reachable.has(s));
  steps.push({ phase: 'reachability', reachable: [...reachable], unreachable });

  const states = [...reachable];
  const finals = new Set(dfa.final_states.filter(s => reachable.has(s)));
  const DEAD = '__dead__';
  let useDead = false;

  // Build complete transition function
  const trans = {};
  states.forEach(s => {
    trans[s] = {};
    dfa.alphabet.forEach(sym => {
      const t = (dfa.transitions[s] || {})[sym];
      if (t && reachable.has(t)) trans[s][sym] = t;
      else { trans[s][sym] = DEAD; useDead = true; }
    });
  });
  if (useDead) {
    states.push(DEAD);
    trans[DEAD] = {};
    dfa.alphabet.forEach(sym => { trans[DEAD][sym] = DEAD; });
  }

  // Step 2: Initial partition
  let P = [];
  const F = states.filter(s => finals.has(s));
  const NF = states.filter(s => !finals.has(s));
  if (F.length) P.push(new Set(F));
  if (NF.length) P.push(new Set(NF));

  steps.push({ phase: 'partition', iteration: 0, partitions: P.map(p => [...p]) });

  // Step 3: Refine
  let changed = true;
  let iter = 1;
  while (changed) {
    changed = false;
    const newP = [];
    for (const group of P) {
      const groupArr = [...group];
      const subgroups = [];
      for (const s of groupArr) {
        let placed = false;
        for (const sg of subgroups) {
          const rep = sg[0];
          const same = dfa.alphabet.every(sym => {
            const findGroup = (st) => P.findIndex(g => g.has(st));
            return findGroup(trans[s][sym]) === findGroup(trans[rep][sym]);
          });
          if (same) { sg.push(s); placed = true; break; }
        }
        if (!placed) subgroups.push([s]);
      }
      subgroups.forEach(sg => newP.push(new Set(sg)));
      if (subgroups.length > 1) changed = true;
    }
    if (changed) {
      P = newP;
      steps.push({ phase: 'partition', iteration: iter++, partitions: P.map(p => [...p]) });
    }
  }

  // Step 4: Build minimized DFA
  const groupOf = (s) => P.find(g => g.has(s));
  const groupName = (s) => {
    const g = groupOf(s);
    return g ? '{' + [...g].filter(x => x !== DEAD).sort().join(',') + '}' : DEAD;
  };

  const minStates = [...new Set(states.map(s => groupName(s)).filter(n => n !== DEAD && n !== '{}'))];
  const minStart = groupName(dfa.start_state);
  const minFinals = [...new Set([...finals].map(s => groupName(s)))];
  const minTrans = {};
  states.forEach(s => {
    const src = groupName(s);
    if (src === DEAD || src === '{}') return;
    if (!minTrans[src]) minTrans[src] = {};
    dfa.alphabet.forEach(sym => {
      const tgt = groupName(trans[s][sym]);
      if (tgt !== DEAD && tgt !== '{}') minTrans[src][sym] = tgt;
    });
  });

  const minDFA = {
    type: 'DFA',
    states: minStates,
    alphabet: dfa.alphabet,
    start_state: minStart,
    final_states: minFinals,
    transitions: minTrans,
  };

  steps.push({ phase: 'result', minDFA });
  return { minDFA, steps };
};

// ─── STRING SIMULATION ───────────────────────────────────────
export const simulateString = (auto, inputStr) => {
  const steps = [];

  if (auto.type === 'DFA') {
    let cur = auto.start_state;
    steps.push({ step: 0, symbol: '—', currentStates: [cur], nextStates: [cur], status: 'Start' });

    for (let i = 0; i < inputStr.length; i++) {
      const sym = inputStr[i];
      if (!auto.alphabet.includes(sym)) {
        steps.push({ step: i+1, symbol: sym, currentStates: [cur], nextStates: [], status: `Rejected — invalid symbol '${sym}'` });
        return { accepted: false, steps };
      }
      const next = (auto.transitions[cur] || {})[sym];
      if (!next) {
        steps.push({ step: i+1, symbol: sym, currentStates: [cur], nextStates: [], status: 'Rejected — missing transition' });
        return { accepted: false, steps };
      }
      steps.push({ step: i+1, symbol: sym, currentStates: [cur], nextStates: [next], status: 'Continue' });
      cur = next;
    }
    const accepted = auto.final_states.includes(cur);
    steps[steps.length-1].status = accepted ? 'Accepted ✓' : 'Rejected ✗';
    return { accepted, steps };

  } else {
    let curSet = getEpsilonClosure([auto.start_state], auto.transitions);
    steps.push({ step: 0, symbol: '—', currentStates: [...curSet], nextStates: [...curSet], status: 'Start (ε-closure)' });

    for (let i = 0; i < inputStr.length; i++) {
      const sym = inputStr[i];
      const moved = move(curSet, sym, auto.transitions);
      const closure = getEpsilonClosure([...moved], auto.transitions);
      steps.push({ step: i+1, symbol: sym, currentStates: [...curSet], nextStates: [...closure], status: closure.size ? 'Continue' : 'Dead end' });
      curSet = closure;
      if (!curSet.size) { steps[steps.length-1].status = 'Rejected — no valid paths'; return { accepted: false, steps }; }
    }
    const accepted = [...curSet].some(s => auto.final_states.includes(s));
    steps[steps.length-1].status = accepted ? 'Accepted ✓' : 'Rejected ✗';
    return { accepted, steps };
  }
};

// ─── DFA → REGEX (STATE ELIMINATION / GNFA) ─────────────────
const regexConcat = (a, b) => {
  if (a === '∅' || b === '∅') return '∅';
  if (a === 'ε') return b;
  if (b === 'ε') return a;
  const wrap = r => (r.includes('|') && r.length > 1) ? `(${r})` : r;
  return `${wrap(a)}${wrap(b)}`;
};
const regexUnion = (a, b) => {
  if (a === '∅') return b;
  if (b === '∅') return a;
  if (a === b) return a;
  return `${a}|${b}`;
};
const regexStar = (r) => {
  if (r === '∅' || r === 'ε') return 'ε';
  const wrap = r.length > 1 ? `(${r})` : r;
  return `${wrap}*`;
};

export const dfaToRegex = (dfa) => {
  const steps = [];
  // Build GNFA: add new start S and final F
  const S = '__S__', F = '__F__';
  let gnfa = {}; // gnfa[from][to] = regex

  const set = (f, t, r) => {
    if (!gnfa[f]) gnfa[f] = {};
    gnfa[f][t] = gnfa[f][t] !== undefined ? regexUnion(gnfa[f][t], r) : r;
  };

  // New start → original start
  set(S, dfa.start_state, 'ε');
  // Original finals → new final
  dfa.final_states.forEach(s => set(s, F, 'ε'));
  // Original transitions
  dfa.states.forEach(s => {
    Object.entries(dfa.transitions[s] || {}).forEach(([sym, tgt]) => set(s, tgt, sym));
  });

  steps.push({ description: 'Initial GNFA', gnfa: JSON.parse(JSON.stringify(gnfa)) });

  // Eliminate each original state
  const toEliminate = [...dfa.states];
  for (const q of toEliminate) {
    const inStates = Object.keys(gnfa).filter(s => s !== q && gnfa[s]?.[q] !== undefined);
    const outStates = Object.keys(gnfa[q] || {}).filter(t => t !== q);
    const loop = gnfa[q]?.[q];
    const loopStr = loop !== undefined ? regexStar(loop) : 'ε';

    for (const i of inStates) {
      for (const o of outStates) {
        const ri = gnfa[i][q];
        const ro = gnfa[q][o];
        const newR = regexConcat(regexConcat(ri, loopStr), ro);
        set(i, o, newR);
      }
      delete gnfa[i][q];
    }
    delete gnfa[q];
    steps.push({ description: `Eliminated state: ${q}`, gnfa: JSON.parse(JSON.stringify(gnfa)) });
  }

  const regex = gnfa[S]?.[F] ?? '∅';
  return { regex, steps };
};

// ─── EQUIVALENCE CHECKING ────────────────────────────────────
export const checkEquivalence = (dfa1, dfa2) => {
  const alphabet = [...new Set([...dfa1.alphabet, ...dfa2.alphabet])];
  const queue = [[dfa1.start_state, dfa2.start_state, '']];
  const visited = new Set();

  while (queue.length) {
    const [q1, q2, path] = queue.shift();
    const key = `${q1}||${q2}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const f1 = q1 ? dfa1.final_states.includes(q1) : false;
    const f2 = q2 ? dfa2.final_states.includes(q2) : false;
    if (f1 !== f2) return { equivalent: false, counterexample: path || 'ε', accept1: f1, accept2: f2 };

    for (const sym of alphabet) {
      const n1 = q1 ? (dfa1.transitions[q1] || {})[sym] || null : null;
      const n2 = q2 ? (dfa2.transitions[q2] || {})[sym] || null : null;
      queue.push([n1, n2, path + sym]);
    }
  }
  return { equivalent: true };
};

// ─── TRANSITION TABLE ─────────────────────────────────────────
export const buildTransitionTable = (auto) => {
  const symbols = auto.type === 'NFA'
    ? [...auto.alphabet, 'ε']
    : auto.alphabet;

  return auto.states.map(state => {
    const row = { state, isStart: state === auto.start_state, isFinal: auto.final_states.includes(state) };
    symbols.forEach(sym => {
      const t = (auto.transitions[state] || {})[sym];
      if (t === undefined || t === null) row[sym] = '∅';
      else if (Array.isArray(t)) row[sym] = t.length ? '{' + t.join(',') + '}' : '∅';
      else row[sym] = t;
    });
    return row;
  });
};

// ─── DETECT DEAD STATES ───────────────────────────────────────
export const getDeadStates = (dfa) => {
  // A dead state can reach no final state
  const finals = new Set(dfa.final_states);
  const canReachFinal = new Set(finals);
  let changed = true;
  while (changed) {
    changed = false;
    dfa.states.forEach(s => {
      if (canReachFinal.has(s)) return;
      const reachesAccepting = Object.values(dfa.transitions[s] || {}).some(t => canReachFinal.has(t));
      if (reachesAccepting) { canReachFinal.add(s); changed = true; }
    });
  }
  return dfa.states.filter(s => !canReachFinal.has(s));
};
