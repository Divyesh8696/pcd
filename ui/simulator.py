import streamlit as st
import pandas as pd
from utils.json_handler import load_automaton_from_json
from modules.simulator import simulate_string
from modules.visualization import generate_automaton_graph
from utils.history import add_history_event
import time

def render():
    st.title("▶️ String Simulator")
    st.write("Step-by-step string simulation.")
    
    if 'active_automaton' not in st.session_state:
        st.warning("Please set an active automaton in the Automaton Designer first.")
        return
        
    try:
        auto = load_automaton_from_json(st.session_state['active_automaton'])
    except Exception as e:
        st.error(f"Error loading active automaton: {e}")
        return
        
    col1, col2 = st.columns([3, 1])
    with col1:
        input_string = st.text_input("Enter String to Simulate:", value="")
    with col2:
        st.write("") # Spacer
        st.write("") # Spacer
        if st.button("Simulate", type="primary", use_container_width=True):
            accepted, steps = simulate_string(auto, input_string)
            st.session_state['sim_result'] = {
                'string': input_string,
                'accepted': accepted,
                'steps': steps,
                'current_step': 0
            }
            add_history_event(f"Simulated string '{input_string}' on {auto.type}")
            
    if 'sim_result' in st.session_state:
        res = st.session_state['sim_result']
        steps = res['steps']
        
        st.markdown(f"### Results for '{res['string']}'")
        if res['accepted']:
            st.success(f"**ACCEPTED ✓**")
        else:
            st.error(f"**REJECTED ✗**")
            
        col_ctrl1, col_ctrl2, col_ctrl3 = st.columns(3)
        with col_ctrl1:
            if st.button("Previous Step") and res['current_step'] > 0:
                st.session_state['sim_result']['current_step'] -= 1
        with col_ctrl2:
            st.write(f"Step {res['current_step']} / {len(steps)-1}")
        with col_ctrl3:
            if st.button("Next Step") and res['current_step'] < len(steps)-1:
                st.session_state['sim_result']['current_step'] += 1
                
        current_step_data = steps[res['current_step']]
        highlight_states = current_step_data['next_states']
        
        # Display table
        df_data = []
        for s in steps:
            df_data.append({
                "Step": s['step'],
                "Symbol": s['symbol'],
                "Current State(s)": "{" + ",".join(s['current_states']) + "}",
                "Next State(s)": "{" + ",".join(s['next_states']) + "}",
                "Status": s['status']
            })
            
        st.dataframe(pd.DataFrame(df_data), use_container_width=True)
        
        # Graph Visualization
        st.subheader("Execution Path Graph")
        # Just highlighting one state in the graph if it's DFA, or multiple if it's NFA (but graphviz helper only supports one right now, let's update it in visualization.py if needed, or just pass the first one for simplicity, or we can update visualization to take a list)
        
        # Let's pass a list to generate_automaton_graph
        from modules.visualization import generate_automaton_graph
        dot = generate_automaton_graph(auto, highlight_states)
        st.graphviz_chart(dot)
