import json
from modules.automaton import DFA, NFA

def load_automaton_from_json(json_str: str):
    data = json.loads(json_str)
    if data.get('type') == 'DFA':
        auto = DFA(
            states=data.get('states', []),
            alphabet=data.get('alphabet', []),
            start_state=data.get('start_state', ''),
            final_states=data.get('final_states', []),
            transitions=data.get('transitions', {})
        )
    else:
        auto = NFA(
            states=data.get('states', []),
            alphabet=data.get('alphabet', []),
            start_state=data.get('start_state', ''),
            final_states=data.get('final_states', []),
            transitions=data.get('transitions', {})
        )
    auto.validate()
    return auto

def export_automaton_to_json(auto) -> str:
    data = {
        "type": auto.type,
        "states": auto.states,
        "alphabet": auto.alphabet,
        "start_state": auto.start_state,
        "final_states": auto.final_states,
        "transitions": auto.transitions
    }
    return json.dumps(data, indent=2)
