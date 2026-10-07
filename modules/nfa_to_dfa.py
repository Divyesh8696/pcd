from typing import List, Dict, Set, Tuple
from modules.automaton import NFA, DFA

def epsilon_closure(nfa: NFA, states: Set[str]) -> Set[str]:
    """Computes the epsilon closure of a set of states."""
    stack = list(states)
    closure = set(states)
    
    while stack:
        state = stack.pop()
        if state in nfa.transitions and 'ε' in nfa.transitions[state]:
            for next_state in nfa.transitions[state]['ε']:
                if next_state not in closure:
                    closure.add(next_state)
                    stack.append(next_state)
                    
    return closure

def move(nfa: NFA, states: Set[str], symbol: str) -> Set[str]:
    """Computes the move operation for a set of states on a given symbol."""
    result = set()
    for state in states:
        if state in nfa.transitions and symbol in nfa.transitions[state]:
            for next_state in nfa.transitions[state][symbol]:
                result.add(next_state)
    return result

def convert_nfa_to_dfa(nfa: NFA) -> Tuple[DFA, List[Dict]]:
    """
    Converts NFA to DFA using subset construction.
    Returns the resulting DFA and a list of steps for visualization.
    """
    alphabet = [sym for sym in nfa.alphabet if sym != 'ε']
    
    start_closure = epsilon_closure(nfa, {nfa.start_state})
    
    dfa_states_map = {} # Maps frozen set of NFA states to new DFA state name
    dfa_states_list = [] # List of new DFA states
    
    def get_dfa_state_name(nfa_states: Set[str]) -> str:
        fs = frozenset(nfa_states)
        if fs not in dfa_states_map:
            name = f"Q{len(dfa_states_map)}"
            dfa_states_map[fs] = name
            dfa_states_list.append(fs)
        return dfa_states_map[fs]
    
    start_dfa_state = get_dfa_state_name(start_closure)
    
    unmarked_states = [frozenset(start_closure)]
    marked_states = set()
    
    dfa_transitions = {}
    steps = []
    
    while unmarked_states:
        current_nfa_states = unmarked_states.pop(0)
        marked_states.add(current_nfa_states)
        
        current_dfa_name = get_dfa_state_name(current_nfa_states)
        if current_dfa_name not in dfa_transitions:
            dfa_transitions[current_dfa_name] = {}
            
        for symbol in alphabet:
            m = move(nfa, set(current_nfa_states), symbol)
            closure = epsilon_closure(nfa, m)
            
            if not closure:
                continue
                
            next_dfa_name = get_dfa_state_name(closure)
            dfa_transitions[current_dfa_name][symbol] = next_dfa_name
            
            if frozenset(closure) not in marked_states and frozenset(closure) not in unmarked_states:
                unmarked_states.append(frozenset(closure))
                
            steps.append({
                "dfa_state": current_dfa_name,
                "nfa_states": list(current_nfa_states),
                "symbol": symbol,
                "move": list(m),
                "closure": list(closure),
                "next_dfa_state": next_dfa_name
            })
            
    # Determine final states
    nfa_finals = set(nfa.final_states)
    dfa_finals = []
    for fs, name in dfa_states_map.items():
        if fs.intersection(nfa_finals):
            dfa_finals.append(name)
            
    dfa_states = list(dfa_states_map.values())
    
    dfa = DFA(
        states=dfa_states,
        alphabet=alphabet,
        start_state=start_dfa_state,
        final_states=dfa_finals,
        transitions=dfa_transitions
    )
    
    return dfa, steps
