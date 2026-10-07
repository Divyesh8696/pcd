const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Automaton = require('./models/Automaton');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/automatalab';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/automata', async (req, res) => {
  try {
    const automata = await Automaton.find().sort({ createdAt: -1 });
    res.json(automata);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/automata', async (req, res) => {
  try {
    const newAuto = new Automaton(req.body);
    await newAuto.save();
    res.status(201).json(newAuto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/automata/:id', async (req, res) => {
  try {
    await Automaton.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Automata logic endpoints (to be called by frontend or done in frontend)
// It's often better to do algorithms in the frontend in React for interactivity,
// but we can also serve them from backend. We will do it in frontend for the "Interactive" part!

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
