import streamlit as st
import pandas as pd
from utils.json_handler import load_automaton_from_json
from modules.nfa_to_dfa import convert_nfa_to_dfa
from modules.visualization import generate_automaton_graph
from utils.history import add_history_event
import json

def render():
    st.title("🔄 NFA to DFA Converter")
    st.write("Convert NFA to DFA using the Subset Construction algorithm.")
    
    if 'active_automaton' not in st.session_state:
        st.warning("Please set an active automaton in the Automaton Designer first.")
        return
        
    try:
        auto = load_automaton_from_json(st.session_state['active_automaton'])
    except Exception as e:
        st.error(f"Error loading active automaton: {e}")
        return
        
    if auto.type == 'DFA':
        st.info("The active automaton is already a DFA.")
        return
        
    if st.button("Convert to DFA", type="primary"):
        dfa, steps = convert_nfa_to_dfa(auto)
        st.session_state['dfa_result'] = {
            'dfa': dfa,
            'steps': steps
        }
        add_history_event("Converted NFA to DFA")
        
    if 'dfa_result' in st.session_state:
        dfa = st.session_state['dfa_result']['dfa']
        steps = st.session_state['dfa_result']['steps']
        
        tab1, tab2, tab3 = st.tabs(["Step-by-Step Derivation", "Resulting DFA", "Export"])
        
        with tab1:
            st.subheader("Subset Construction Steps")
            
            # Format steps for dataframe
            df_data = []
            for step in steps:
                df_data.append({
                    "DFA State": step['dfa_state'],
                    "NFA States": "{" + ",".join(sorted(step['nfa_states'])) + "}",
                    "Input": step['symbol'],
                    "Move": "{" + ",".join(sorted(step['move'])) + "}",
                    "ε-Closure": "{" + ",".join(sorted(step['closure'])) + "}",
                    "Next DFA State": step['next_dfa_state']
                })
                
            df = pd.DataFrame(df_data)
            st.dataframe(df, use_container_width=True)
            
            st.info("Each row represents the evaluation of a new DFA state on an input symbol.")
            
        with tab2:
            st.subheader("Final DFA Graph")
            dot = generate_automaton_graph(dfa)
            st.graphviz_chart(dot)
            
        with tab3:
            st.subheader("DFA JSON")
            from utils.json_handler import export_automaton_to_json
            dfa_json = export_automaton_to_json(dfa)
            st.code(dfa_json, language='json')
            
            if st.button("Set as Active Automaton"):
                st.session_state['active_automaton'] = dfa_json
                add_history_event("Set converted DFA as Active Automaton")
                st.success("Set as active!")
