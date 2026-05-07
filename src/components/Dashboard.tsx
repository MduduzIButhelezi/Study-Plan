import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain, Clock, ChevronRight, TrendingUp, Calendar, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'study' | 'break'>('study');
  const { sendNotification } = useNotifications();

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

      // Simple sound effect could go here
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
              <h2 className="text-xl font-bold">AI Performance Insight 🧠</h2>
            </div>
            <p className="text-purple-100 max-w-md text-sm leading-relaxed mb-4">
              Your Math performance drops when you study less than 3 hours/week. We've adjusted your tomorrow's block to focus on Algebra.
            </p>
            <button className="flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full transition-all">
              See detailed report <ChevronRight size={14} />
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
              <span className="text-xs text-[#008080] font-bold uppercase cursor-pointer hover:underline">View All</span>
            </div>
            
            <div className="space-y-4 overflow-y-auto scrollbar-hide flex-1">
              {[
                { title: 'Advanced Calculus', time: '09:00 AM - 10:30 AM', loc: 'Room 402', color: '#6750A4', type: 'Class' },
                { title: 'Organic Chemistry', time: '11:00 AM - 12:30 PM', loc: 'Library', color: '#008080', type: 'Study', opacity: 0.6 },
                { title: 'AI Ethics Seminar', time: '02:00 PM - 03:30 PM', loc: 'Zoom', color: '#f59e0b', type: 'Workshop' },
                { title: 'Literature Review', time: '04:00 PM - 05:30 PM', loc: 'Home', color: '#ec4899', type: 'Tasks' },
              ].map((session, i) => (
                <div key={i} className={`flex gap-4 items-center ${session.opacity ? 'opacity-60' : ''}`}>
                  <div className="w-1 h-12 rounded-full" style={{ backgroundColor: session.color }}></div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{session.title}</p>
                    <p className="text-xs text-gray-500 italic">{session.time} • {session.loc}</p>
                  </div>
                  <div className={`text-[10px] px-2 py-1 rounded-full border ${
                    session.type === 'Class' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    session.type === 'Study' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                    'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {session.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-[#252528] rounded-3xl p-6 border border-white/10 flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <CheckSquare size={18} className="text-[#6750A4]" />
                Pending Tasks
              </h3>
              <button className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">+</button>
            </div>
            
            <div className="space-y-4 overflow-y-auto scrollbar-hide flex-1">
              {[
                { title: 'Lab Report Draft', subject: 'Biology', date: 'Due in 4 hours', progress: 75, color: '#ef4444' },
                { title: 'Lit Review: Post-modernism', subject: 'Eng Literature', date: 'Tomorrow', progress: 25, color: '#eab308' },
                { title: 'Algebra Problem Set', subject: 'Mathematics', date: 'Friday', progress: 0, color: '#6750A4' },
              ].map((task, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-[#6750A4] transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium group-hover:text-white transition-colors">{task.title}</p>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }}></div>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2">{task.subject} • {task.date}</p>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      className="h-full bg-[#6750A4]"
                    ></motion.div>
                  </div>
                </div>
              ))}
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
            {[
              { title: 'Physics Finals', date: 'May 18, 09:00 AM', days: '02', color: '#ef4444' },
              { title: 'History Quiz', date: 'May 25, 01:30 PM', days: '09', color: '#f59e0b' },
            ].map((exam, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all group-hover:scale-105" style={{ backgroundColor: `${exam.color}20`, color: exam.color }}>
                  <span className="text-lg font-bold">{exam.days}</span>
                  <span className="text-[8px] uppercase font-bold">Days</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{exam.title}</p>
                  <p className="text-[10px] text-gray-500">{exam.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Weekly Goal Status</h3>
              <span className="text-xs font-bold text-[#6750A4]">18/25 hrs</span>
            </div>
            
            <div className="flex justify-between items-end gap-2 h-20">
              {[60, 80, 100, 40, 70, 50, 20].map((h, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={`w-full rounded-t-lg transition-shadow duration-500 ${h === 100 ? 'bg-[#6750A4] shadow-[0_0_15px_rgba(103,80,164,0.4)]' : 'bg-[#6750A4]/20'}`}
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
