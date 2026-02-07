import { useTodo } from '../context/TodoContext';

export const TodoList = () => {
  const { todos, toggleTodo, deleteTodo } = useTodo();

  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No todos yet. Add one above!
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
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
            <span
              className={`text-lg truncate transition-all ${
                todo.completed ? 'text-white/30 line-through' : 'text-white font-medium'
              }`}
            >
              {todo.text}
            </span>
          </div>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="ml-4 text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Delete todo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
};
