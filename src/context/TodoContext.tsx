import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error('Failed to fetch todos', err));
  }, []);

  const addTodo = (text: string) => {
    const newTodo = { id: crypto.randomUUID(), text, completed: false };
    fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo)
    })
      .then(res => res.json())
      .then(savedTodo => setTodos(prev => [...prev, savedTodo]))
      .catch(err => console.error('Failed to add todo', err));
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed })
    })
      .then(res => res.json())
      .then(updatedTodo => {
        setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      })
      .catch(err => console.error('Failed to toggle todo', err));
  };

  const deleteTodo = (id: string) => {
    fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    })
      .then(() => setTodos(prev => prev.filter(t => t.id !== id)))
      .catch(err => console.error('Failed to delete todo', err));
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
};
