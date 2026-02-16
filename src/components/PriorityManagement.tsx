import { useState } from 'react';
import { usePriority } from '../context/PriorityContext';
import { Trash2 } from 'lucide-react';

export function PriorityManagement() {
  const { priorities, addPriority, deletePriority } = usePriority();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6'); // Default blue
  const [level, setLevel] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addPriority(name.trim(), color, Number(level));
      setName('');
      setLevel(prev => prev + 1); // Auto-increment level suggestion
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">Priority Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. High, Medium, Low"
            className="w-full px-4 py-3 bg-white/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all backdrop-blur-sm"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-white/80 text-sm font-medium mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-12 w-12 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
              />
              <span className="text-white/60 text-sm">{color}</span>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-white/80 text-sm font-medium mb-1">Rank (Lower = Higher)</label>
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              min="1"
              className="w-full px-4 py-3 bg-white/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Add Priority
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-white/80 font-bold text-lg">Existing Priorities</h3>
        {priorities.length === 0 ? (
          <p className="text-white/50 text-sm italic">No priorities defined yet.</p>
        ) : (
          <div className="grid gap-3">
            {priorities.map((priority) => (
              <div
                key={priority.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: priority.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{priority.name}</span>
                    <span className="text-white/40 text-xs">Rank: {priority.level}</span>
                  </div>
                </div>
                <button
                  onClick={() => deletePriority(priority.id)}
                  className="p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete priority"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
