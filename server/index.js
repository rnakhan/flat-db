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

app.use(cors());
app.use(express.json());

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  const csvWriter = createCsvWriter({
    path: DB_PATH,
    header: [
      { id: 'id', title: 'id' },
      { id: 'text', title: 'text' },
      { id: 'completed', title: 'completed' }
    ]
  });
  csvWriter.writeRecords([]).then(() => console.log('DB initialized'));
}

const readTodos = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(DB_PATH)
      .pipe(csv())
      .on('data', (data) => {
        // Filter out empty rows
        if (!data.id && !data.text) return;
        
        // Convert string 'true'/'false' to boolean
        data.completed = data.completed === 'true';
        results.push(data);
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const writeTodos = async (todos) => {
  const csvWriter = createCsvWriter({
    path: DB_PATH,
    header: [
      { id: 'id', title: 'id' },
      { id: 'text', title: 'text' },
      { id: 'completed', title: 'completed' }
    ],
    append: false
  });
  await csvWriter.writeRecords(todos);
};

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await readTodos();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const todos = await readTodos();
    const newTodo = {
      id: req.body.id,
      text: req.body.text,
      completed: req.body.completed
    };
    todos.push(newTodo);
    await writeTodos(todos);
    res.json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const index = todos.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...req.body };
      await writeTodos(todos);
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
    const todos = await readTodos();
    const newTodos = todos.filter(t => t.id !== req.params.id);
    await writeTodos(newTodos);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
