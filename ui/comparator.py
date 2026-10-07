import streamlit as st
import json
from utils.json_handler import load_automaton_from_json
from modules.equivalence import check_equivalence
from utils.history import add_history_event

def render():
    st.title("⚖️ Automata Equivalence & Comparator")
    st.write("Compare two DFAs and check for equivalence.")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("DFA A")
        dfa_a_json = st.text_area("JSON for DFA A", height=200, key="dfa_a_json")
        if 'active_automaton' in st.session_state and st.button("Use Active Automaton for A"):
            st.session_state['dfa_a_json'] = st.session_state['active_automaton']
            st.rerun()
            
    with col2:
        st.subheader("DFA B")
        dfa_b_json = st.text_area("JSON for DFA B", height=200, key="dfa_b_json")
        if 'active_automaton' in st.session_state and st.button("Use Active Automaton for B"):
            st.session_state['dfa_b_json'] = st.session_state['active_automaton']
            st.rerun()
            
    if st.button("Compare & Check Equivalence", type="primary"):
        try:
            dfa_a = load_automaton_from_json(dfa_a_json)
            dfa_b = load_automaton_from_json(dfa_b_json)
            
            if dfa_a.type != "DFA" or dfa_b.type != "DFA":
                st.error("Both automata must be DFAs for equivalence checking.")
                return
                
            st.markdown("### Metrics Comparison")
            metrics_col1, metrics_col2 = st.columns(2)
            with metrics_col1:
                st.markdown("**DFA A**")
                st.write(f"- States: {len(dfa_a.states)}")
                st.write(f"- Transitions: {sum(len(t) for t in dfa_a.transitions.values())}")
                st.write(f"- Final States: {len(dfa_a.final_states)}")
            with metrics_col2:
                st.markdown("**DFA B**")
                st.write(f"- States: {len(dfa_b.states)}")
                st.write(f"- Transitions: {sum(len(t) for t in dfa_b.transitions.values())}")
                st.write(f"- Final States: {len(dfa_b.final_states)}")
                
            st.markdown("### Equivalence Result")
            is_equivalent, counterexample = check_equivalence(dfa_a, dfa_b)
            
            if is_equivalent:
                st.success("✅ **DFA A and DFA B are EQUIVALENT.**")
            else:
                st.error("❌ **DFA A and DFA B are NOT EQUIVALENT.**")
                st.warning(f"**Counterexample String:** `{counterexample}` (Empty string represents 'ε')")
                st.write("One automaton accepts this string, while the other rejects it.")
                
            add_history_event("Compared DFA A and DFA B for equivalence")
            
        except Exception as e:
            st.error(f"Error parsing/comparing automata: {e}")
