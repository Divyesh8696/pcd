from typing import Tuple, List, Optional
from modules.automaton import DFA

def check_equivalence(dfa1: DFA, dfa2: DFA) -> Tuple[bool, Optional[str]]:
    """
    Checks if two DFAs are equivalent.
    Returns (True, None) if equivalent.
    Returns (False, counterexample_string) if not equivalent.
    """
    if set(dfa1.alphabet) != set(dfa2.alphabet):
        # To be completely robust, we should consider union of alphabets,
        # but for typical student exercises, they should match.
        pass
        
    alphabet = list(set(dfa1.alphabet).union(set(dfa2.alphabet)))
    
    # BFS to find reachable states in the product automaton
    # State in product automaton is a pair (q1, q2)
    start_pair = (dfa1.start_state, dfa2.start_state)
    
    queue = [(start_pair, "")]
    visited = set([start_pair])
    
    while queue:
        (q1, q2), path = queue.pop(0)
        
        # Check if one is final and the other is not
        is_q1_final = q1 in dfa1.final_states
        is_q2_final = q2 in dfa2.final_states
        
        if is_q1_final != is_q2_final:
            return False, path
            
        for symbol in alphabet:
            # If transition missing, assume goes to a dead state 'None'
            next_q1 = dfa1.transitions.get(q1, {}).get(symbol) if q1 else None
            next_q2 = dfa2.transitions.get(q2, {}).get(symbol) if q2 else None
            
            next_pair = (next_q1, next_q2)
            if next_pair not in visited:
                visited.add(next_pair)
                queue.append((next_pair, path + symbol))
                
    return True, None
