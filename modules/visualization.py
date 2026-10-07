import graphviz
from modules.automaton import Automaton

def generate_automaton_graph(auto: Automaton, highlight_states: list = None) -> graphviz.Digraph:
    """Generates a graphviz Digraph for the given automaton."""
    if highlight_states is None:
        highlight_states = []
    
    dot = graphviz.Digraph(engine='dot')
    dot.attr(rankdir='LR', size='8,5')

    # Start state arrow
    dot.node('start', shape='point')
    
    # Add states
    for state in auto.states:
        shape = 'doublecircle' if state in auto.final_states else 'circle'
        color = 'red' if state in highlight_states else 'black'
        penwidth = '2' if state in highlight_states else '1'
        
        dot.node(state, shape=shape, color=color, penwidth=penwidth)

    # Transition from start point to actual start state
    if auto.start_state in auto.states:
        dot.edge('start', auto.start_state)

    # Add transitions
    for src, trans in auto.transitions.items():
        for symbol, targets in trans.items():
            if not isinstance(targets, list):
                targets = [targets]
            for target in targets:
                # Use html encoding for epsilon if it's the symbol
                label = 'ε' if symbol == 'ε' else str(symbol)
                dot.edge(src, target, label=label)

    return dot
