import streamlit as st
import pandas as pd
from utils.json_handler import load_automaton_from_json

def render():
    st.title("📊 Transition Table Generator")
    st.write("View and export the transition table for the active automaton.")
    
    if 'active_automaton' not in st.session_state:
        st.warning("Please set an active automaton in the Automaton Designer first.")
        return
        
    try:
        auto = load_automaton_from_json(st.session_state['active_automaton'])
    except Exception as e:
        st.error(f"Error loading active automaton: {e}")
        return
        
    st.subheader(f"Transition Table for {auto.type}")
    
    df_data = {}
    df_data['State'] = []
    
    symbols = list(auto.alphabet)
    if auto.type == 'NFA' and 'ε' not in symbols:
        symbols.append('ε')
        
    for symbol in symbols:
        df_data[symbol] = []
        
    for state in auto.states:
        # Add a marker for start/final
        prefix = ""
        if state == auto.start_state: prefix += "→"
        if state in auto.final_states: prefix += "*"
        df_data['State'].append(f"{prefix} {state}".strip())
        
        for symbol in symbols:
            trans = auto.transitions.get(state, {})
            if symbol in trans:
                target = trans[symbol]
                if isinstance(target, list):
                    df_data[symbol].append("{" + ",".join(target) + "}")
                else:
                    df_data[symbol].append(target)
            else:
                df_data[symbol].append("∅")
                
    df = pd.DataFrame(df_data)
    st.dataframe(df, use_container_width=True)
    
    csv = df.to_csv(index=False).encode('utf-8')
    st.download_button("Export as CSV", data=csv, file_name="transition_table.csv", mime="text/csv")
