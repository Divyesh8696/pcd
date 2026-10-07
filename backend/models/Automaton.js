const mongoose = require('mongoose');

const AutomatonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['DFA', 'NFA'], required: true },
  states: [{ type: String }],
  alphabet: [{ type: String }],
  start_state: { type: String },
  final_states: [{ type: String }],
  transitions: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Automaton', AutomatonSchema);
