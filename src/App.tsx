import { TodoProvider } from './context/TodoContext';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';

function App() {
  return (
    <TodoProvider>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Task Master
            </h1>
            <p className="mt-2 text-lg text-white/80 font-medium">
              Stay organized, stay productive.
            </p>
          </div>
          
          <div className="space-y-6">
            <TodoInput />
            <div className="mt-8">
              <TodoList />
            </div>
          </div>
        </div>
      </div>
    </TodoProvider>
  );
}

export default App;
