import streamlit as st

def render():
    st.title("🏆 Challenge Mode")
    st.write("Test your knowledge of Finite Automata!")
    
    st.info("Interactive challenge system coming in a future update.")
    
    st.markdown("""
    ### Planned Challenges:
    1. **Convert NFA to DFA**: You'll be given an NFA and must construct the correct DFA visually.
    2. **Identify Unreachable States**: Click on the states that cannot be reached from the start state.
    3. **Minimize DFA**: Step through the partition refinement algorithm manually.
    4. **String Acceptance**: Trace a string's path and determine if it's accepted or rejected.
    5. **Find a Counterexample**: Given two non-equivalent DFAs, find a string that one accepts and the other rejects.
    
    Stay tuned!
    """)
