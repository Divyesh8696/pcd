import streamlit as st
import datetime

def add_history_event(message: str):
    if 'history' not in st.session_state:
        st.session_state['history'] = []
    
    timestamp = datetime.datetime.now().strftime("%I:%M %p")
    st.session_state['history'].insert(0, f"{timestamp} - {message}")

def get_history():
    return st.session_state.get('history', [])

def clear_history():
    st.session_state['history'] = []
