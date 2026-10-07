import streamlit as st
from utils.history import get_history, clear_history

def render():
    st.title("📜 Project History")
    
    col1, col2 = st.columns([4, 1])
    with col1:
        st.write("View the session history of your automaton transformations and actions.")
    with col2:
        if st.button("Clear History"):
            clear_history()
            st.rerun()
            
    history = get_history()
    
    if not history:
        st.info("No history events recorded in this session.")
    else:
        for event in history:
            st.markdown(f"- **{event}**")
