import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Trash2 } from 'lucide-react';

export function UserManagement() {
  const { users, addUser, deleteUser } = useUser();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6'); // Default blue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addUser(name.trim(), color);
      setName('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New user name..."
          className="flex-1 rounded-lg border-gray-300 bg-white/50 border border-white/20 p-4 text-white placeholder-white/50 focus:border-white focus:ring-0 transition-all font-medium backdrop-blur-sm"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-14 w-14 rounded-lg cursor-pointer border-0 bg-transparent p-0"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-6 py-4 bg-white text-indigo-600 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Add User
        </button>
      </form>

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            No users yet. Add one above!
          </div>
        ) : (
          users.map(user => (
            <div
              key={user.id}
              className="group flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm transition-all hover:bg-white/60"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-lg font-medium text-white group-hover:text-white/90 transition-colors">
                  {user.name}
                </span>
              </div>
              
              <button
                onClick={() => deleteUser(user.id)}
                aria-label="Delete user"
                className="p-2 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
