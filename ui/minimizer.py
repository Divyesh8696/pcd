import streamlit as st
from utils.json_handler import load_automaton_from_json, export_automaton_to_json
from modules.dfa_minimizer import minimize_dfa
from modules.visualization import generate_automaton_graph
from utils.history import add_history_event

def render():
    st.title("📉 DFA Minimizer")
    st.write("Minimize a DFA using Hopcroft's partition refinement algorithm.")
    
    if 'active_automaton' not in st.session_state:
        st.warning("Please set an active automaton in the Automaton Designer first.")
        return
        
    try:
        auto = load_automaton_from_json(st.session_state['active_automaton'])
    except Exception as e:
        st.error(f"Error loading active automaton: {e}")
        return
        
    if auto.type != 'DFA':
        st.error("The active automaton is an NFA. Please convert it to DFA first.")
        return
        
    if st.button("Minimize DFA", type="primary"):
        min_dfa, steps = minimize_dfa(auto)
        st.session_state['min_dfa_result'] = {
            'dfa': min_dfa,
            'steps': steps
        }
        add_history_event("Minimized DFA")
        
    if 'min_dfa_result' in st.session_state:
        min_dfa = st.session_state['min_dfa_result']['dfa']
        steps = st.session_state['min_dfa_result']['steps']
        
        tab1, tab2, tab3 = st.tabs(["Minimization Steps", "Resulting DFA", "Comparison"])
        
        with tab1:
            st.subheader("Algorithm Derivation")
            for step in steps:
                if step['type'] == 'reachability':
                    st.markdown("#### Reachability Analysis")
                    st.write(f"**Reachable states:** {', '.join(step['reachable'])}")
                    if step['unreachable']:
                        st.write(f"**Unreachable states (removed):** {', '.join(step['unreachable'])}")
                    else:
                        st.write("All states are reachable.")
                elif step['type'] == 'partition':
                    st.markdown(f"#### Partition Iteration {step['iteration']}")
                    parts = []
                    for p in step['partitions']:
                        parts.append("{" + ", ".join(p) + "}")
                    st.write("Current Partitions:")
                    st.code(" | ".join(parts))
                    
        with tab2:
            st.subheader("Minimized DFA Graph")
            dot = generate_automaton_graph(min_dfa)
            st.graphviz_chart(dot)
            
            if st.button("Set as Active Automaton"):
                st.session_state['active_automaton'] = export_automaton_to_json(min_dfa)
                add_history_event("Set Minimized DFA as Active")
                st.success("Set as active!")
                
        with tab3:
            st.subheader("Optimization Metrics")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Original States", len(auto.states))
                st.metric("Original Transitions", sum(len(t) for t in auto.transitions.values()))
            with col2:
                st.metric("Minimized States", len(min_dfa.states))
                st.metric("Minimized Transitions", sum(len(t) for t in min_dfa.transitions.values()))
            with col3:
                saved = len(auto.states) - len(min_dfa.states)
                pct = (saved / len(auto.states) * 100) if len(auto.states) > 0 else 0
                st.metric("States Reduced", f"{saved} ({pct:.1f}%)")
