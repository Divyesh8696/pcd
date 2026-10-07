import streamlit as st

st.set_page_config(page_title="AUTOMATALAB PRO", layout="wide", page_icon="🤖")

# Try to import modules and UI components
try:
    from ui import (
        designer, converter, minimizer, simulator, regex, 
        comparator, table
    )
    ui_available = True
except ImportError:
    ui_available = False

def main():
    st.sidebar.title("🤖 AUTOMATALAB PRO")
    st.sidebar.caption("Interactive Finite Automata Platform")
    
    pages = {
        "🏠 Home": "home",
        "✏️ Automaton Designer": "designer",
        "🔄 NFA → DFA": "converter",
        "📉 DFA Minimizer": "minimizer",
        "▶️ String Simulator": "simulator",
        "🔤 DFA → Regex": "regex",
        "⚖️ Automata Comparator": "comparator",
        "📊 Transition Table": "table"
    }
    
    selection = st.sidebar.radio("Navigation", list(pages.keys()))
    page_id = pages[selection]
    
    if page_id == "home":
        st.title("Welcome to AUTOMATALAB PRO 🎓")
        st.markdown("""
        **AUTOMATALAB PRO** is an advanced interactive platform for designing, simulating, and optimizing finite automata.
        
        ### 🌟 Features
        - **Automaton Designer**: Build and edit NFAs/DFAs visually or via JSON.
        - **NFA → DFA Conversion**: Step-by-step subset construction.
        - **DFA Minimization**: See reachability and partition refinement in action.
        - **String Simulator**: Step-by-step execution path animation.
        - **DFA → Regex**: Generate regular expressions using state elimination.
        - **Equivalence & Comparator**: Test if two DFAs are equivalent and find counterexamples.
        - **Algorithm Explainer**: Learn the theory behind the transformations.
        
        Use the sidebar to navigate through the modules!
        """)
        if not ui_available:
            st.warning("⚠️ UI Modules are still being built. Stay tuned!")
            
    elif ui_available:
        if page_id == "designer":
            designer.render()
        elif page_id == "converter":
            converter.render()
        elif page_id == "minimizer":
            minimizer.render()
        elif page_id == "simulator":
            simulator.render()
        elif page_id == "regex":
            regex.render()
        elif page_id == "comparator":
            comparator.render()
        elif page_id == "table":
            table.render()
    else:
        st.info("Module under construction.")

if __name__ == "__main__":
    main()
