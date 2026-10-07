from typing import List, Dict, Set, Tuple
from modules.automaton import DFA

def get_reachable_states(dfa: DFA) -> Set[str]:
    reachable = set()
    stack = [dfa.start_state]
    while stack:
        state = stack.pop()
        if state not in reachable:
            reachable.add(state)
            if state in dfa.transitions:
                for symbol, target in dfa.transitions[state].items():
                    if target not in reachable:
                        stack.append(target)
    return reachable

def minimize_dfa(dfa: DFA) -> Tuple[DFA, List[Dict]]:
    steps = []
    
    # Step 1: Reachability
    reachable = get_reachable_states(dfa)
    unreachable = set(dfa.states) - reachable
    steps.append({
        "type": "reachability",
        "reachable": list(reachable),
        "unreachable": list(unreachable)
    })
    
    # Filter states and transitions
    states = list(reachable)
    final_states = [s for s in dfa.final_states if s in reachable]
    
    # Create total transition function for partitioning (target dead state if missing)
    # Actually, standard minimization assumes complete DFA. Let's add a dead state if needed.
    needs_dead = False
    for state in states:
        trans = dfa.transitions.get(state, {})
        for symbol in dfa.alphabet:
            if symbol not in trans:
                needs_dead = True
                break
    
    dead_state_name = "Dead"
    if needs_dead:
        states.append(dead_state_name)
        # We don't add to final_states because a dead state is not final
        
    transitions = {}
    for state in states:
        transitions[state] = {}
        if state == dead_state_name:
            for symbol in dfa.alphabet:
                transitions[state][symbol] = dead_state_name
        else:
            trans = dfa.transitions.get(state, {})
            for symbol in dfa.alphabet:
                transitions[state][symbol] = trans.get(symbol, dead_state_name)

    # Step 2: Initial Partition
    P = []
    finals = set(final_states)
    non_finals = set(states) - finals
    if finals:
        P.append(frozenset(finals))
    if non_finals:
        P.append(frozenset(non_finals))
        
    steps.append({
        "type": "partition",
        "iteration": 0,
        "partitions": [list(p) for p in P]
    })
    
    W = list(P)
    iteration = 1
    
    while W:
        A = W.pop(0)
        for c in dfa.alphabet:
            # X is set of states for which a transition on c leads to a state in A
            X = set([s for s in states if transitions[s][c] in A])
            
            new_P = []
            for Y in P:
                inter = Y.intersection(X)
                diff = Y - X
                
                if inter and diff:
                    new_P.append(frozenset(inter))
                    new_P.append(frozenset(diff))
                    
                    if Y in W:
                        W.remove(Y)
                        W.append(frozenset(inter))
                        W.append(frozenset(diff))
                    else:
                        if len(inter) <= len(diff):
                            W.append(frozenset(inter))
                        else:
                            W.append(frozenset(diff))
                else:
                    new_P.append(Y)
            if P != new_P:
                P = new_P
                steps.append({
                    "type": "partition",
                    "iteration": iteration,
                    "partitions": [list(p) for p in P]
                })
                iteration += 1

    # Step 3: Construct Minimized DFA
    # Mapping each state to its partition group representative
    group_map = {}
    for p in P:
        rep = sorted(list(p))[0] # Choose deterministic representative name (e.g. combination of sorted names)
        # Actually better to name it by joining states, except for dead state
        name = "{" + ",".join(sorted(list(p))) + "}"
        for s in p:
            group_map[s] = name
            
    min_states = list(set(group_map.values()))
    min_start_state = group_map[dfa.start_state]
    min_final_states = list(set([group_map[s] for s in final_states]))
    
    min_transitions = {}
    for s in states:
        src = group_map[s]
        if src not in min_transitions:
            min_transitions[src] = {}
        for c in dfa.alphabet:
            min_transitions[src][c] = group_map[transitions[s][c]]
            
    # Remove dead state if it was created and is a separate partition that's not final
    # Wait, the dead state might be grouped with other non-finals. It's valid to keep it.
    
    minimized_dfa = DFA(
        states=min_states,
        alphabet=dfa.alphabet,
        start_state=min_start_state,
        final_states=min_final_states,
        transitions=min_transitions
    )
    
    return minimized_dfa, steps
