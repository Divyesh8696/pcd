from dataclasses import dataclass, field
from typing import Dict, List, Set, Optional, Union

@dataclass
class Automaton:
    """Base class for finite automata (DFA and NFA)."""
    type: str
    states: List[str]
    alphabet: List[str]
    start_state: str
    final_states: List[str]
    # transitions can be mapped to a single state (str) or a list of states (List[str]) depending on DFA/NFA
    transitions: Dict[str, Dict[str, Union[str, List[str]]]]

    def validate(self):
        """Basic validation to ensure correct structure."""
        if self.start_state not in self.states:
            raise ValueError(f"Start state '{self.start_state}' is not in the set of states.")
        for state in self.final_states:
            if state not in self.states:
                raise ValueError(f"Final state '{state}' is not in the set of states.")
        for state, trans in self.transitions.items():
            if state not in self.states:
                raise ValueError(f"State '{state}' in transitions is not in the set of states.")
            for symbol, targets in trans.items():
                if symbol not in self.alphabet and symbol != 'ε':
                    raise ValueError(f"Symbol '{symbol}' in transition from '{state}' is not in alphabet.")

@dataclass
class DFA(Automaton):
    def __init__(self, states, alphabet, start_state, final_states, transitions):
        super().__init__(type="DFA", states=states, alphabet=alphabet, start_state=start_state, final_states=final_states, transitions=transitions)

    def validate(self):
        super().validate()
        for state, trans in self.transitions.items():
            for symbol, target in trans.items():
                if isinstance(target, list):
                    raise ValueError(f"DFA transition for '{state}' on '{symbol}' must be a single state, not a list.")
                if target not in self.states:
                    raise ValueError(f"Target state '{target}' for transition from '{state}' on '{symbol}' is not in states.")

@dataclass
class NFA(Automaton):
    def __init__(self, states, alphabet, start_state, final_states, transitions):
        super().__init__(type="NFA", states=states, alphabet=alphabet, start_state=start_state, final_states=final_states, transitions=transitions)

    def validate(self):
        super().validate()
        for state, trans in self.transitions.items():
            for symbol, targets in trans.items():
                if not isinstance(targets, list):
                    raise ValueError(f"NFA transition for '{state}' on '{symbol}' must be a list of states.")
                for target in targets:
                    if target not in self.states:
                        raise ValueError(f"Target state '{target}' for transition from '{state}' on '{symbol}' is not in states.")
