import streamlit as st
from utils.json_handler import load_automaton_from_json
from modules.dfa_to_regex import dfa_to_regex
from utils.history import add_history_event

def render():
    st.title("🔤 DFA to Regular Expression")
    st.write("Convert DFA to Regex using the State Elimination method.")
    
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
        
    if st.button("Generate Regex", type="primary"):
        regex, steps = dfa_to_regex(auto)
        st.session_state['regex_result'] = {
            'regex': regex,
            'steps': steps
        }
        add_history_event("Generated Regex from DFA")
        
    if 'regex_result' in st.session_state:
        res = st.session_state['regex_result']
        
        st.success("Regex generation complete!")
        st.markdown("### Final Regular Expression:")
        st.code(res['regex'], language='text')
        
        with st.expander("Show Step-by-Step State Elimination"):
            for step in res['steps']:
                st.markdown(f"#### {step['description']}")
                gnfa = step['gnfa']
                st.write(f"**Remaining States:** {', '.join(gnfa['states'])}")
                
                for src, trans in gnfa['transitions'].items():
                    for target, regex in trans.items():
                        st.write(f"- {src} ➔ {target} : `{regex}`")
