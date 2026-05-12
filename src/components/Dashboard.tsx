import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain, Clock, ChevronRight, TrendingUp, Calendar, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';

export default function Dashboard() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'study' | 'break'>('study');
  const { sendNotification } = useNotifications();

  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    const qTimetable = query(
      collection(db, 'timetable'),
      where('user_id', '==', user.uid),
      where('day_of_week', '==', currentDay)
    );

    const unsubscribeTimetable = onSnapshot(qTimetable, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodaySessions(fetched);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'timetable'));

    const qTasks = query(
      collection(db, 'tasks'),
      where('user_id', '==', user.uid),
      where('status', '!=', 'Completed'),
      limit(5)
    );

    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingTasks(fetched);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    return () => {
      unsubscribeTimetable();
      unsubscribeTasks();
    };
  }, [user]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      
      const title = sessionType === 'study' ? 'Study Session Complete!' : 'Break Over!';
      const message = sessionType === 'study' 
        ? "Great job! Time for a 5-minute break." 
        : "Hope you're refreshed! Ready for another study block?";
      
      sendNotification(title, message, sessionType === 'study' ? 'success' : 'info');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType, sendNotification]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionType === 'study' ? 25 * 60 : 5 * 60) - timeLeft) / (sessionType === 'study' ? 25 * 60 : 5 * 60);

  return (
    <div className="grid grid-cols-12 gap-6 pb-20 lg:pb-0">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        {/* AI Insight Hero */}
        <div className="h-40 bg-gradient-to-r from-[#6750A4] to-[#453472] rounded-3xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={18} className="text-purple-300" />
              <h2 className="text-xl font-bold">Your Academic Journey 🌟</h2>
            </div>
            <p className="text-purple-100 max-w-md text-sm leading-relaxed mb-4">
              Welcome to your personal dashboard. Track your growth, manage your time, and achieve your peak performance.
            </p>
            <button className="flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full transition-all">
              View Insights <ChevronRight size={14} />
            </button>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10 text-[120px] group-hover:scale-110 transition-transform duration-700">⚡</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-[#252528] rounded-3xl p-6 border border-white/10 flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Calendar size={18} className="text-[#008080]" />
                Today's Timetable
              </h3>
            </div>
            
            <div className="space-y-4 overflow-y-auto scrollbar-hide flex-1">
              {todaySessions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Calendar size={40} className="mb-2" />
                  <p className="text-xs">No sessions scheduled for today</p>
                </div>
              ) : (
                todaySessions.map((session, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-1 h-12 rounded-full bg-[#6750A4]"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{session.title}</p>
                      <p className="text-xs text-gray-500 italic">{session.start_time} - {session.end_time}</p>
                    </div>
                  </div>
                ) || [])
              )}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-[#252528] rounded-3xl p-6 border border-white/10 flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <CheckSquare size={18} className="text-[#6750A4]" />
                Pending Tasks
              </h3>
            </div>
            
            <div className="space-y-4 overflow-y-auto scrollbar-hide flex-1">
              {pendingTasks.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <CheckSquare size={40} className="mb-2" />
                    <p className="text-xs">All caught up! Time to relax.</p>
                 </div>
              ) : (
                pendingTasks.map((task, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-[#6750A4] transition-all group">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium group-hover:text-white transition-colors">{task.title}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-2">{task.subject} • {task.dueDate || 'No due date'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        {/* Study Timer - Pomodoro */}
        <div className="bg-[#252528] rounded-3xl p-8 border border-white/10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={16} className="text-gray-400" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Study Timer</h3>
          </div>
          
          <div className="relative flex items-center justify-center mb-8">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5"></circle>
              <motion.circle 
                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="6" fill="transparent" 
                strokeDasharray="553" 
                animate={{ strokeDashoffset: 553 - (553 * progress) }}
                className="text-[#6750A4]"
              ></motion.circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <div className="text-4xl font-bold tracking-tight">{formatTime(timeLeft)}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{sessionType} session</div>
            </div>
          </div>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg transition-all active:scale-95 ${isActive ? 'bg-white/10 text-white' : 'bg-[#6750A4] text-white hover:brightness-110'}`}
            >
              {isActive ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
              {isActive ? 'Pause Focus' : 'Start Focus'}
            </button>
            <button 
              onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Stats & Countdown */}
        <div className="bg-[#252528] rounded-3xl p-6 border border-white/10 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-[#008080]" />
            <h3 className="font-bold">Exam Countdown</h3>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="h-20 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-white/5 rounded-2xl">
              <TrendingUp size={24} className="mb-1" />
              <p className="text-[10px]">No upcoming exams tracked</p>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Weekly Goal Status</h3>
              <span className="text-xs font-bold text-[#6750A4]">0/25 hrs</span>
            </div>
            
            <div className="flex justify-between items-end gap-2 h-20">
              {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full rounded-t-lg bg-[#6750A4]/20"
                  ></motion.div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[8px] text-gray-500 uppercase font-bold">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
