import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  color: string;
}

interface UserContextType {
  users: User[];
  addUser: (name: string, color: string) => void;
  deleteUser: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users', err));
  }, []);

  const addUser = (name: string, color: string) => {
    const newUser = { id: crypto.randomUUID(), name, color };
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
      .then(res => res.json())
      .then(savedUser => setUsers(prev => [...prev, savedUser]))
      .catch(err => console.error('Failed to add user', err));
  };

  const deleteUser = (id: string) => {
    fetch(`/api/users/${id}`, {
      method: 'DELETE'
    })
      .then(() => setUsers(prev => prev.filter(u => u.id !== id)))
      .catch(err => console.error('Failed to delete user', err));
  };

  return (
    <UserContext.Provider value={{ users, addUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};
