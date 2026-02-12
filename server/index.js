import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.csv');
const USERS_DB_PATH = path.join(__dirname, 'users.csv');

app.use(cors());
app.use(express.json());

// Generic CSV Helper functions
const initializeDB = async (filePath, headers) => {
  if (!fs.existsSync(filePath)) {
    const csvWriter = createCsvWriter({
      path: filePath,
      header: headers,
    });
    await csvWriter.writeRecords([]);
    console.log(`Initialized DB at ${filePath}`);
  }
};

const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Simple type inference
        if (data.completed) data.completed = data.completed === 'true';
        if (!data.id && !data.text && !data.name) return; // Skip empty rows
        results.push(data);
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const writeCSV = async (filePath, headers, records) => {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: headers,
    append: false
  });
  await csvWriter.writeRecords(records);
};

// Initialize DBs
const TODO_HEADERS = [
  { id: 'id', title: 'id' },
  { id: 'text', title: 'text' },
  { id: 'completed', title: 'completed' },
  { id: 'userId', title: 'userId' }
];

const USER_HEADERS = [
  { id: 'id', title: 'id' },
  { id: 'name', title: 'name' },
  { id: 'color', title: 'color' }
];

initializeDB(DB_PATH, TODO_HEADERS);
initializeDB(USERS_DB_PATH, USER_HEADERS);

// --- TODOS API ---

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await readCSV(DB_PATH);
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const todos = await readCSV(DB_PATH);
    const newTodo = {
      id: req.body.id,
      text: req.body.text,
      completed: req.body.completed,
      userId: req.body.userId || ''
    };
    todos.push(newTodo);
    await writeCSV(DB_PATH, TODO_HEADERS, todos);
    res.json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const todos = await readCSV(DB_PATH);
    const index = todos.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...req.body };
      await writeCSV(DB_PATH, TODO_HEADERS, todos);
      res.json(todos[index]);
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todos = await readCSV(DB_PATH);
    const newTodos = todos.filter(t => t.id !== req.params.id);
    await writeCSV(DB_PATH, TODO_HEADERS, newTodos);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USERS API ---

app.get('/api/users', async (req, res) => {
  try {
    const users = await readCSV(USERS_DB_PATH);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const users = await readCSV(USERS_DB_PATH);
    const newUser = {
      id: req.body.id,
      name: req.body.name,
      color: req.body.color
    };
    users.push(newUser);
    await writeCSV(USERS_DB_PATH, USER_HEADERS, users);
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const users = await readCSV(USERS_DB_PATH);
    const newUsers = users.filter(u => u.id !== req.params.id);
    await writeCSV(USERS_DB_PATH, USER_HEADERS, newUsers);
    
    // Optional: Unassign tasks attached to this user? 
    // For now, let's keep it simple and leave them as is (or handle in frontend)
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
