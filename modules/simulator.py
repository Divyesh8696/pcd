from typing import List, Dict, Set, Tuple
from modules.automaton import Automaton, DFA, NFA
from modules.nfa_to_dfa import epsilon_closure

def simulate_string(auto: Automaton, input_string: str) -> Tuple[bool, List[Dict]]:
    """
    Simulates processing of input_string on the automaton.
    Returns boolean acceptance and step-by-step history.
    """
    steps = []
    
    if auto.type == "DFA":
        current_state = auto.start_state
        
        steps.append({
            "step": 0,
            "symbol": "-",
            "current_states": [current_state],
            "next_states": [current_state],
            "status": "Start"
        })
        
        for i, symbol in enumerate(input_string):
            if symbol not in auto.alphabet:
                steps.append({
                    "step": i+1,
                    "symbol": symbol,
                    "current_states": [current_state],
                    "next_states": [],
                    "status": f"Rejected (Invalid Symbol '{symbol}')"
                })
                return False, steps
                
            trans = auto.transitions.get(current_state, {})
            if symbol not in trans:
                steps.append({
                    "step": i+1,
                    "symbol": symbol,
                    "current_states": [current_state],
                    "next_states": [],
                    "status": "Rejected (Missing Transition)"
                })
                return False, steps
                
            next_state = trans[symbol]
            steps.append({
                "step": i+1,
                "symbol": symbol,
                "current_states": [current_state],
                "next_states": [next_state],
                "status": "Continue"
            })
            current_state = next_state
            
        accepted = current_state in auto.final_states
        steps[-1]["status"] = "Accepted ✓" if accepted else "Rejected ✗"
        return accepted, steps
        
    elif auto.type == "NFA":
        current_states = epsilon_closure(auto, {auto.start_state})
        
        steps.append({
            "step": 0,
            "symbol": "-",
            "current_states": list(current_states),
            "next_states": list(current_states),
            "status": "Start (ε-Closure)"
        })
        
        for i, symbol in enumerate(input_string):
            if symbol not in auto.alphabet:
                steps.append({
                    "step": i+1,
                    "symbol": symbol,
                    "current_states": list(current_states),
                    "next_states": [],
                    "status": f"Rejected (Invalid Symbol '{symbol}')"
                })
                return False, steps
                
            next_states = set()
            for s in current_states:
                trans = auto.transitions.get(s, {})
                if symbol in trans:
                    next_states.update(trans[symbol])
            
            closure = epsilon_closure(auto, next_states)
            
            steps.append({
                "step": i+1,
                "symbol": symbol,
                "current_states": list(current_states),
                "next_states": list(closure),
                "status": "Continue" if closure else "Dead End"
            })
            
            current_states = closure
            
            if not current_states:
                steps[-1]["status"] = "Rejected (No valid paths)"
                return False, steps
                
        accepted = any(s in auto.final_states for s in current_states)
        steps[-1]["status"] = "Accepted ✓" if accepted else "Rejected ✗"
        return accepted, steps
