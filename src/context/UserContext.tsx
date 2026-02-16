import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(parsed);
    }, (error) => {
      console.error('Failed to fetch users', error);
    });
    
    return () => unsubscribe();
  }, []);

  const addUser = async (name: string, color: string) => {
    try {
      await addDoc(collection(db, 'users'), { name, color });
    } catch (err) {
      console.error('Failed to add user', err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  return (
    <UserContext.Provider value={{ users, addUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};
