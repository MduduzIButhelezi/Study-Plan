import { useState } from 'react';
import { Plus, Filter, Search, MoreHorizontal, CheckCircle2, Circle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Tasks() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Lab Report Draft', subject: 'Biology', priority: 'High', status: 'In Progress', dueDate: '2026-05-07', progress: 75 },
    { id: 2, title: 'Literature Review', subject: 'English', priority: 'Medium', status: 'To Do', dueDate: '2026-05-08', progress: 0 },
    { id: 3, title: 'Calculus Assignment', subject: 'Mathematics', priority: 'High', status: 'Completed', dueDate: '2026-05-06', progress: 100 },
    { id: 4, title: 'Chemistry Quiz Prep', subject: 'Chemistry', priority: 'Low', status: 'To Do', dueDate: '2026-05-10', progress: 10 },
  ]);

  const priorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'text-red-500 bg-red-500/10';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'Low': return 'text-teal-500 bg-teal-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Academic Tasks</h2>
          <p className="text-gray-400 text-sm">Managing {tasks.filter(t => t.status !== 'Completed').length} active assignments</p>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-[#252528] rounded-xl border border-white/10 p-1 flex gap-1">
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-[#6750A4] text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
            >
              List
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-[#6750A4] text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
            >
              Board
            </button>
          </div>
          <button className="bg-[#6750A4] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-purple-500/10">
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-3 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search tasks, subjects, or notes..." 
            className="w-full bg-[#252528] rounded-2xl py-2.5 px-12 border border-white/10 text-sm focus:outline-none focus:border-[#6750A4] transition-all"
          />
        </div>
        <button className="bg-[#252528] border border-white/10 p-2.5 rounded-xl text-gray-400 hover:text-white transition-all">
          <Filter size={20} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {tasks.map(task => (
              <div key={task.id} className="bg-[#252528] rounded-2xl border border-white/10 p-4 flex items-center gap-4 hover:border-white/20 transition-all cursor-pointer group">
                <button className="text-gray-500 hover:text-[#6750A4] transition-colors">
                  {task.status === 'Completed' ? <CheckCircle2 size={24} className="text-[#008080]" /> : <Circle size={24} />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`font-bold text-sm ${task.status === 'Completed' ? 'line-through text-gray-500 decoration-2' : ''}`}>{task.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityColor(task.priority)}`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><BookOpen size={12} /> {task.subject}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {task.dueDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-500">{task.progress}%</span>
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#6750A4]" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-white"><MoreHorizontal size={20} /></button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {['To Do', 'In Progress', 'Completed'].map(status => (
              <div key={status} className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'To Do' ? 'bg-gray-400' : status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    {status}
                  </h3>
                  <span className="text-xs bg-white/5 px-2 py-0.5 rounded-lg text-gray-400 font-bold">{tasks.filter(t => t.status === status).length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} className="bg-[#252528] rounded-2xl border border-white/10 p-4 shadow-xl hover:border-[#6750A4] transition-all cursor-move">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${priorityColor(task.priority)}`}>{task.priority}</span>
                        <div className="text-[10px] text-gray-500 font-bold">{task.subject}</div>
                      </div>
                      <h4 className="font-bold text-sm mb-4 leading-tight">{task.title}</h4>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Clock size={12} /> {task.dueDate.split('-')[2]} May
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">JD</div>
                      </div>
                    </div>
                  ))}
                  <button className="py-3 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all text-xs font-bold">+ New Task</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
