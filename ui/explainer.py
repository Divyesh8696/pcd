import streamlit as st

def render():
    st.title("📖 Algorithm Explainer")
    st.write("Learn the theory behind finite automata transformations.")
    
    with st.expander("NFA to DFA Conversion (Subset Construction)"):
        st.markdown("""
        ### What is Subset Construction?
        The subset construction algorithm converts a Nondeterministic Finite Automaton (NFA) into an equivalent Deterministic Finite Automaton (DFA).
        Because an NFA can be in multiple states simultaneously, the equivalent DFA must track **sets of NFA states**. Each state in the DFA represents a particular subset of NFA states.
        
        #### Key Concepts:
        - **Epsilon (ε) Closure**: The set of all states reachable from a given state without consuming any input symbols (following only ε-transitions).
        - **Move**: The set of states reachable from a set of states by consuming exactly one specific input symbol.
        
        #### The Algorithm:
        1. Calculate the ε-closure of the NFA's start state. This set of NFA states becomes the start state of the DFA.
        2. For the new DFA state and each input symbol:
           - Calculate the `move()` operation to find the reachable NFA states.
           - Calculate the ε-closure of the result.
           - If this set of states forms a new DFA state, add it to the list of DFA states to process.
        3. Repeat until all DFA states have transitions defined for all symbols.
        4. Any DFA state that contains at least one NFA final state becomes a final state in the DFA.
        """)
        
    with st.expander("DFA Minimization (Hopcroft's Partition Refinement)"):
        st.markdown("""
        ### Why Minimize?
        A minimal DFA has the fewest possible states needed to recognize a regular language. This optimizes processing and storage.
        
        #### The Pipeline:
        1. **Reachability Analysis**: Perform a search (DFS/BFS) from the start state. Remove any states that cannot be reached.
        2. **Initial Partition**: Separate the remaining states into two groups (partitions): Final states and Non-final states.
        3. **Partition Refinement**: 
           - For each group and each input symbol, check if the states in the group transition to the same target group.
           - If they transition to different groups, split the group.
           - Repeat until no more groups can be split.
        4. **Merge**: Combine all states in the same group into a single new state.
        """)
        
    with st.expander("DFA to Regular Expression (State Elimination)"):
        st.markdown("""
        ### State Elimination (GNFA Method)
        We can convert a DFA to a Regular Expression by iteratively removing states while updating the transition labels to be regular expressions.
        
        #### The Steps:
        1. Add a **new start state** with an ε-transition to the original start state.
        2. Add a **new final state** with ε-transitions from all original final states.
        3. Choose a state to eliminate (not the new start or final state).
        4. For every pair of states `(in, out)` going through the eliminated state:
           - Update their direct transition regex to: `R_direct + R_in * (R_loop)* * R_out`
        5. Remove the state.
        6. Repeat until only the new start and final states remain. The transition between them is the final Regular Expression!
        """)
