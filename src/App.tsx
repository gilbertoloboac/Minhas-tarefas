/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Filter, ListTodo, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'pending' | 'completed';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'pending':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos(prev => [newTodo, ...prev]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const stats = {
    total: todos.length,
    pending: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500 rounded-xl text-white">
              <ListTodo size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Minhas Tarefas</h1>
          </div>
          <p className="text-stone-500 flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Todas', value: stats.total, color: 'bg-stone-100 text-stone-600' },
            { label: 'Pendentes', value: stats.pending, color: 'bg-amber-50 text-amber-600' },
            { label: 'Concluídas', value: stats.completed, color: 'bg-emerald-50 text-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className={cn("p-4 rounded-2xl border border-black/5", stat.color)}>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={addTodo} className="relative mb-8 group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 pr-16 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <Filter size={16} className="text-stone-400 mr-2" />
          {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                filter === f 
                  ? "bg-stone-900 text-white shadow-md" 
                  : "bg-white text-stone-500 hover:bg-stone-100 border border-black/5"
              )}
            >
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Concluídas'}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group flex items-center gap-4 p-4 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all",
                    todo.completed && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={cn(
                      "transition-colors",
                      todo.completed ? "text-emerald-500" : "text-stone-300 hover:text-stone-400"
                    )}
                  >
                    {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  
                  <span className={cn(
                    "flex-1 text-lg transition-all",
                    todo.completed && "line-through text-stone-400"
                  )}>
                    {todo.text}
                  </span>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-stone-400 italic"
              >
                Nenhuma tarefa encontrada.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <footer className="mt-12 pt-8 border-t border-stone-200 flex justify-between items-center text-sm text-stone-400">
            <span>{stats.pending} tarefas restantes</span>
            <button 
              onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
              className="hover:text-stone-600 transition-colors"
            >
              Limpar concluídas
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
