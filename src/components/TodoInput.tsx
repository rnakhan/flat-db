import { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { useUser } from '../context/UserContext';

export const TodoInput = () => {
  const [text, setText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const { addTodo } = useTodo();
  const { users } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text.trim(), selectedUserId);
      setText('');
      // Keep selected user or reset? Let's keep it for rapid entry
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-5 py-4 bg-white/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all shadow-inner backdrop-blur-sm"
          />
        </div>
        
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="px-4 py-4 bg-white/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all backdrop-blur-sm appearance-none cursor-pointer"
          style={{ maxWidth: '150px' }}
        >
          <option value="" className="text-gray-800">Assign to...</option>
          {users.map(user => (
            <option key={user.id} value={user.id} className="text-gray-800">
              {user.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!text.trim()}
          className="px-6 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </form>
  );
};
