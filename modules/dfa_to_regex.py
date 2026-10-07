from typing import List, Dict, Tuple
from modules.automaton import DFA

def dfa_to_regex(dfa: DFA) -> Tuple[str, List[Dict]]:
    """
    Converts a DFA to a Regular Expression using the GNFA state elimination method.
    Returns the final regex and a list of step histories.
    """
    steps = []
    
    # 1. Create initial GNFA
    states = list(dfa.states)
    start_state = "S_start"
    final_state = "S_final"
    
    # transitions map: src -> target -> regex
    transitions = {s: {} for s in states}
    transitions[start_state] = {dfa.start_state: "ε"}
    transitions[final_state] = {}
    
    for s in states:
        if s in dfa.final_states:
            transitions[s][final_state] = "ε"
            
        trans = dfa.transitions.get(s, {})
        for symbol, target in trans.items():
            if target not in transitions[s]:
                transitions[s][target] = symbol
            else:
                transitions[s][target] = f"({transitions[s][target]}+{symbol})"
                
    states.append(start_state)
    states.append(final_state)
    
    def get_gnfa_snapshot():
        return {
            "states": list(states),
            "transitions": {s: {t: r for t, r in trans.items()} for s, trans in transitions.items() if trans}
        }
        
    steps.append({
        "description": "Initial GNFA with new Start and Final states",
        "gnfa": get_gnfa_snapshot()
    })
    
    # 2. State elimination
    eliminate_order = [s for s in dfa.states]
    
    for state_to_eliminate in eliminate_order:
        in_edges = []
        out_edges = []
        loop = transitions[state_to_eliminate].get(state_to_eliminate, "")
        
        for s in states:
            if s != state_to_eliminate and state_to_eliminate in transitions[s]:
                in_edges.append((s, transitions[s][state_to_eliminate]))
                
        for t, regex in transitions[state_to_eliminate].items():
            if t != state_to_eliminate:
                out_edges.append((t, regex))
                
        for src, in_regex in in_edges:
            for target, out_regex in out_edges:
                # Build new regex: in (loop)* out
                part_loop = f"({loop})*" if loop else ""
                
                # Format properly (omit epsilon if concatenating)
                in_str = "" if in_regex == "ε" and (part_loop or out_regex != "ε") else in_regex
                out_str = "" if out_regex == "ε" and (part_loop or in_regex != "ε") else out_regex
                if in_str == "ε" and out_str == "ε" and not part_loop:
                    new_regex = "ε"
                else:
                    new_regex = f"{in_str}{part_loop}{out_str}"
                    if new_regex == "":
                        new_regex = "ε"
                        
                # Add parenthesis if necessary
                if len(in_str) > 1 and '+' in in_str: in_str = f"({in_str})"
                if len(out_str) > 1 and '+' in out_str: out_str = f"({out_str})"
                
                new_regex = f"{in_str}{part_loop}{out_str}"
                
                if target in transitions[src]:
                    existing = transitions[src][target]
                    transitions[src][target] = f"({existing}+{new_regex})"
                else:
                    transitions[src][target] = new_regex
                    
        # Remove state
        states.remove(state_to_eliminate)
        del transitions[state_to_eliminate]
        for s in states:
            if state_to_eliminate in transitions[s]:
                del transitions[s][state_to_eliminate]
                
        steps.append({
            "description": f"Eliminated state {state_to_eliminate}",
            "gnfa": get_gnfa_snapshot()
        })
        
    final_regex = transitions[start_state].get(final_state, "∅")
    return final_regex, steps
