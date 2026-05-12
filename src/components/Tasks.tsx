import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreHorizontal, CheckCircle2, Circle, Clock, AlertCircle, BookOpen, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Tasks() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newTask, setNewTask] = useState({
    title: '',
    subject: 'General',
    priority: 'Medium',
    status: 'To Do',
    dueDate: ''
  });

  useEffect(() => {
    if (!user) return;

    // Fetch Tasks
    const qTasks = query(
      collection(db, 'tasks'),
      where('user_id', '==', user.uid)
    );

    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(fetched);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    // Fetch Subjects
    const qSubjects = query(
      collection(db, 'subjects'),
      where('user_id', '==', user.uid)
    );

    const unsubscribeSubjects = onSnapshot(qSubjects, (snapshot) => {
      setSubjects(['General', ...snapshot.docs.map(d => d.data().name)]);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeSubjects();
    };
  }, [user]);

  const handleAddTask = async () => {
    if (!newTask.title || !user) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        user_id: user.uid,
        progress: 0,
        timestamp: serverTimestamp()
      });
      setIsAddingTask(false);
      setNewTask({ title: '', subject: 'General', priority: 'Medium', status: 'To Do', dueDate: '' });
      sendNotification('Task Added', `"${newTask.title}" added to your list.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: newStatus,
        progress: newStatus === 'Completed' ? 100 : 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      sendNotification('Task Removed', 'Task deleted successfully.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tasks');
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button 
            onClick={() => setIsAddingTask(true)}
            className="bg-[#6750A4] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-purple-500/10"
          >
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-3 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search tasks or subjects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#252528] rounded-2xl py-2.5 px-12 border border-white/10 text-sm focus:outline-none focus:border-[#6750A4] transition-all"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3 overflow-y-auto pr-2 scrollbar-hide pb-20 lg:pb-0"
          >
            {filteredTasks.length === 0 ? (
               <div className="py-20 text-center opacity-40">
                  <BookOpen size={48} className="mx-auto mb-4" />
                  <p>No tasks found</p>
               </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="bg-[#252528] rounded-2xl border border-white/10 p-4 flex items-center gap-4 hover:border-[#6750A4]/40 transition-all group">
                  <button 
                    onClick={() => toggleTaskStatus(task)}
                    className="text-gray-500 hover:text-[#6750A4] transition-colors"
                  >
                    {task.status === 'Completed' ? <CheckCircle2 size={24} className="text-[#008080]" /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`font-bold text-sm ${task.status === 'Completed' ? 'line-through text-gray-500 decoration-2' : ''}`}>{task.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityColor(task.priority)}`}>{task.priority}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><BookOpen size={12} /> {task.subject}</span>
                      {task.dueDate && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {task.dueDate}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-gray-500">{task.progress || 0}%</span>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#6750A4]" style={{ width: `${task.progress || 0}%` }}></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20 lg:pb-0 overflow-x-auto"
          >
            {['To Do', 'In Progress', 'Completed'].map(status => (
              <div key={status} className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'To Do' ? 'bg-gray-400' : status === 'In Progress' ? 'bg-yellow-500' : 'bg-[#008080]'}`}></div>
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
                          {task.dueDate && <><Clock size={12} /> {new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</>}
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setIsAddingTask(true)} className="py-3 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all text-xs font-bold">+ New Task</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A1A1D] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">New Academic Task</h3>
              <button onClick={() => setIsAddingTask(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Task Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g. Lab Report Draft"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6750A4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Subject</label>
                  <select 
                    value={newTask.subject}
                    onChange={e => setNewTask({...newTask, subject: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Due Date</label>
                <input 
                  type="date" 
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6750A4]"
                />
              </div>

              <button 
                onClick={handleAddTask}
                className="w-full bg-[#6750A4] text-white py-4 rounded-2xl font-bold hover:brightness-110 transition-all mt-4"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
