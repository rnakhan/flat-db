import { useState } from 'react';
import { TodoProvider } from './context/TodoContext';
import { UserProvider } from './context/UserContext';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { UserManagement } from './components/UserManagement';

function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'users'>('tasks');

  return (
    <UserProvider>
      <TodoProvider>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Task List
              </h1>
              <p className="mt-2 text-lg text-white/80 font-medium">
                Stay organized, stay productive.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1 bg-black/20 rounded-xl">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'tasks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/60 hover:text-white'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/60 hover:text-white'
                }`}
              >
                Users
              </button>
            </div>
            
            <div className="space-y-6">
              {activeTab === 'tasks' ? (
                <>
                  <TodoInput />
                  <div className="mt-8">
                    <TodoList />
                  </div>
                </>
              ) : (
                <UserManagement />
              )}
            </div>
          </div>
        </div>
      </TodoProvider>
    </UserProvider>
  );
}

export default App;
