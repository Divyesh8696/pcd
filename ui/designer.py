import streamlit as st
import json
from modules.visualization import generate_automaton_graph
from utils.json_handler import load_automaton_from_json, export_automaton_to_json
from utils.history import add_history_event

def init_designer_state():
    if 'designer_auto' not in st.session_state:
        st.session_state['designer_auto'] = {
            "type": "DFA",
            "states": ["q0"],
            "alphabet": ["0", "1"],
            "start_state": "q0",
            "final_states": [],
            "transitions": {"q0": {}}
        }

def render():
    st.title("✏️ Automaton Designer")
    st.write("Construct an automaton interactively or using JSON.")
    
    init_designer_state()
    
    tab1, tab2 = st.tabs(["JSON Editor", "Visual Preview"])
    
    with tab1:
        st.subheader("Edit JSON")
        current_json = json.dumps(st.session_state['designer_auto'], indent=2)
        new_json = st.text_area("Automaton JSON", value=current_json, height=400)
        
        col1, col2 = st.columns([1, 1])
        with col1:
            if st.button("Apply JSON", type="primary"):
                try:
                    # Validate by trying to load it
                    auto = load_automaton_from_json(new_json)
                    st.session_state['designer_auto'] = json.loads(new_json)
                    add_history_event(f"Loaded {auto.type} from JSON in Designer")
                    st.success("JSON applied successfully!")
                except Exception as e:
                    st.error(f"Error applying JSON: {e}")
        with col2:
            if st.button("Set as Active Automaton"):
                try:
                    auto = load_automaton_from_json(new_json)
                    st.session_state['active_automaton'] = new_json
                    add_history_event(f"Set {auto.type} as Active Automaton")
                    st.success("Active automaton set! You can now use other modules.")
                except Exception as e:
                    st.error(f"Error setting active automaton: {e}")
                    
        st.markdown("### Example Templates")
        col_dfa, col_nfa = st.columns(2)
        with col_dfa:
            if st.button("Load Example DFA"):
                st.session_state['designer_auto'] = {
                    "type": "DFA", "states": ["q0", "q1", "q2"], "alphabet": ["0", "1"],
                    "start_state": "q0", "final_states": ["q2"],
                    "transitions": {
                        "q0": {"0": "q1", "1": "q0"},
                        "q1": {"0": "q1", "1": "q2"},
                        "q2": {"0": "q2", "1": "q2"}
                    }
                }
                st.rerun()
        with col_nfa:
            if st.button("Load Example NFA"):
                st.session_state['designer_auto'] = {
                    "type": "NFA", "states": ["q0", "q1", "q2"], "alphabet": ["0", "1"],
                    "start_state": "q0", "final_states": ["q2"],
                    "transitions": {
                        "q0": {"0": ["q0", "q1"], "1": ["q0"]},
                        "q1": {"1": ["q2"]},
                        "q2": {}
                    }
                }
                st.rerun()

    with tab2:
        st.subheader("Graph Visualization")
        try:
            auto = load_automaton_from_json(json.dumps(st.session_state['designer_auto']))
            dot = generate_automaton_graph(auto)
            st.graphviz_chart(dot)
            
            st.metric("Total States", len(auto.states))
            st.metric("Alphabet Size", len(auto.alphabet))
        except Exception as e:
            st.error(f"Cannot visualize invalid automaton: {e}")
