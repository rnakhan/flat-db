import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    fetch('/api/priorities')
      .then(res => res.json())
      .then(data => setPriorities(data))
      .catch(err => console.error('Failed to fetch priorities', err));
  }, []);

  const addPriority = (name: string, color: string, level: number) => {
    const newPriority = { id: crypto.randomUUID(), name, color, level };
    fetch('/api/priorities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPriority)
    })
      .then(res => res.json())
      .then(savedPriority => {
        setPriorities(prev => [...prev, savedPriority].sort((a, b) => a.level - b.level));
      })
      .catch(err => console.error('Failed to add priority', err));
  };

  const deletePriority = (id: string) => {
    fetch(`/api/priorities/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setPriorities(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => console.error('Failed to delete priority', err));
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
