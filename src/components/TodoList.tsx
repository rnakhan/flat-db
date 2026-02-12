import { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { useUser } from '../context/UserContext';

export const TodoList = () => {
  const { todos, toggleTodo, deleteTodo, updateTodoUser, updateTodoText } = useTodo();
  const { users } = useUser();
  const [filterUserId, setFilterUserId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const filteredTodos = todos.filter(todo => {
    if (filterUserId === 'all') return true;
    if (filterUserId === 'unassigned') return !todo.userId;
    return todo.userId === filterUserId;
  });

  const startEditing = (todo: { id: string, text: string }) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateTodoText(editingId, editText.trim());
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  if (todos.length === 0) {
    return (
      <div className="text-center text-white/60 py-8">
        No todos yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex justify-end">
        <select
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
        >
          <option value="all" className="text-gray-800">All Tasks</option>
          <option value="unassigned" className="text-gray-800">Unassigned</option>
          {users.map(user => (
            <option key={user.id} value={user.id} className="text-gray-800">
              {user.name}'s Tasks
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-4">
        {filteredTodos.map((todo) => {
          const assignedUser = users.find(u => u.id === todo.userId);
          const isEditing = editingId === todo.id;
          
          return (
            <li
              key={todo.id}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-green-400 border-green-400'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full bg-transparent text-lg text-white border-b border-white/50 focus:outline-none focus:border-white"
                    />
                  ) : (
                    <span
                      onClick={() => startEditing(todo)}
                      className={`text-lg truncate block transition-all cursor-text hover:text-white/80 ${
                        todo.completed ? 'text-white/30 line-through' : 'text-white font-medium'
                      }`}
                      title="Click to edit"
                    >
                      {todo.text}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* User Assignment Dropdown */}
                <div className="relative group/user">
                  <select
                    value={todo.userId || ''}
                    onChange={(e) => updateTodoUser(todo.id, e.target.value)}
                    className="appearance-none bg-transparent text-xs text-white/50 hover:text-white border border-transparent hover:border-white/20 rounded px-2 py-1 pr-6 cursor-pointer focus:outline-none focus:bg-white/10 transition-all"
                    style={{ maxWidth: '120px' }}
                  >
                    <option value="" className="text-gray-800">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id} className="text-gray-800">
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: assignedUser?.color || 'transparent' }} 
                    />
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete todo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
