import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId?: string;
  priorityId?: string;
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, userId?: string, priorityId?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodoUser: (id: string, userId: string) => void;
  updateTodoText: (id: string, text: string) => void;
  updateTodoPriority: (id: string, priorityId: string) => void;
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
    const unsubscribe = onSnapshot(collection(db, 'todos'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Todo[];
      setTodos(parsed);
    }, (error) => {
      console.error('Failed to fetch todos', error);
    });
    
    return () => unsubscribe();
  }, []);

  const addTodo = async (text: string, userId?: string, priorityId?: string) => {
    try {
      await addDoc(collection(db, 'todos'), { 
        text, 
        completed: false, 
        userId: userId || '', 
        priorityId: priorityId || '' 
      });
    } catch (err) {
      console.error('Failed to add todo', err);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      await updateDoc(doc(db, 'todos', id), { completed: !todo.completed });
    } catch (err) {
      console.error('Failed to toggle todo', err);
    }
  };

  const updateTodoUser = async (id: string, userId: string) => {
    try {
      await updateDoc(doc(db, 'todos', id), { userId });
    } catch (err) {
      console.error('Failed to update todo user', err);
    }
  };

  const updateTodoPriority = async (id: string, priorityId: string) => {
    try {
      await updateDoc(doc(db, 'todos', id), { priorityId });
    } catch (err) {
      console.error('Failed to update todo priority', err);
    }
  };

  const updateTodoText = async (id: string, text: string) => {
    try {
      await updateDoc(doc(db, 'todos', id), { text });
    } catch (err) {
      console.error('Failed to update todo text', err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (err) {
      console.error('Failed to delete todo', err);
    }
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo, updateTodoUser, updateTodoText, updateTodoPriority }}>
      {children}
    </TodoContext.Provider>
  );
};
