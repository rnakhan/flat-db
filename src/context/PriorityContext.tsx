import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Priority {
  id: string;
  name: string;
  color: string;
  level: number;
}

interface PriorityContextType {
  priorities: Priority[];
  addPriority: (name: string, color: string, level: number) => void;
  deletePriority: (id: string) => void;
}

const PriorityContext = createContext<PriorityContextType | undefined>(undefined);

export const PriorityProvider = ({ children }: { children: ReactNode }) => {
  const [priorities, setPriorities] = useState<Priority[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'priorities'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Priority[];
      parsed.sort((a, b) => a.level - b.level);
      setPriorities(parsed);
    }, (error) => {
      console.error('Failed to fetch priorities', error);
    });
    
    return () => unsubscribe();
  }, []);

  const addPriority = async (name: string, color: string, level: number) => {
    try {
      await addDoc(collection(db, 'priorities'), { name, color, level });
    } catch (err) {
      console.error('Failed to add priority', err);
    }
  };

  const deletePriority = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'priorities', id));
    } catch (err) {
      console.error('Failed to delete priority', err);
    }
  };

  return (
    <PriorityContext.Provider value={{ priorities, addPriority, deletePriority }}>
      {children}
    </PriorityContext.Provider>
  );
};

export const usePriority = () => {
  const context = useContext(PriorityContext);
  if (context === undefined) {
    throw new Error('usePriority must be used within a PriorityProvider');
  }
  return context;
};
