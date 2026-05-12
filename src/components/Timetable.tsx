import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, MapPin, Clock, X, Trash2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Timetable() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [sessions, setSessions] = useState<any[]>([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    loc: '',
    day: 'Monday',
    start: 9,
    end: 11
  });
  
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 12 AM (23:00)

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'timetable'),
      where('user_id', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'timetable');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddSession = async () => {
    if (!newSession.title || !user) return;
    
    try {
      await addDoc(collection(db, 'timetable'), {
        title: newSession.title,
        loc: newSession.loc,
        day_of_week: newSession.day,
        start_time: `${newSession.start}:00`,
        end_time: `${newSession.end}:00`,
        start: newSession.start,
        end: newSession.end,
        user_id: user.uid,
        timestamp: serverTimestamp()
      });
      setIsAddingSession(false);
      setNewSession({ title: '', loc: '', day: 'Monday', start: 9, end: 11 });
      sendNotification('Session Added', `"${newSession.title}" added to your timetable.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'timetable');
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'timetable', id));
      sendNotification('Session Removed', 'Timetable slot deleted.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'timetable');
    }
  };

  const getPosition = (time: number) => {
    return (time - 6) * 60; // 1px per minute
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Weekly Timetable</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddingSession(true)}
            className="bg-[#6750A4] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110"
          >
            <Plus size={18} /> Add Session
          </button>
        </div>
      </div>

      {/* Days Switcher */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-6 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedDay === day ? 'bg-[#6750A4] text-white shadow-lg' : 'bg-[#252528] text-gray-500 hover:text-white border border-white/10'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-[#252528] rounded-3xl border border-white/10 overflow-hidden flex flex-col">
        <div className="flex border-b border-white/10">
          <div className="w-16 p-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Time</div>
          <div className="flex-1 p-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Schedule for {selectedDay}</div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide relative p-4">
          <div className="relative h-[1080px]"> {/* 18 hours * 60px */}
            {/* Hour Grid Lines */}
            {timeSlots.map((hour) => (
              <div key={hour} className="absolute w-full border-t border-white/5 flex items-start" style={{ top: `${(hour - 6) * 60}px` }}>
                <span className="w-12 text-[10px] text-gray-500 -mt-2.5 text-right pr-4">{hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}</span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>
            ))}

            {/* Sessions */}
            {sessions.filter(s => s.day_of_week === selectedDay).map((session, i) => (
              <div 
                key={i}
                className="absolute left-16 right-0 rounded-2xl p-4 flex flex-col gap-1 border shadow-xl transition-all hover:scale-[1.01] hover:brightness-110 group cursor-pointer"
                style={{ 
                  top: `${getPosition(session.start)}px`, 
                  height: `${(session.end - session.start) * 60}px`,
                  backgroundColor: `#6750A420`,
                  borderColor: `#6750A440`,
                  color: '#6750A4'
                }}
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm tracking-tight">{session.title}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    className="opacity-0 group-hover:opacity-100 text-red-500/60 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="flex items-center gap-1 text-[10px] opacity-80">
                    <Clock size={12} /> {session.start_time} - {session.end_time}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] opacity-80">
                    <MapPin size={12} /> {session.loc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Session Modal */}
      {isAddingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A1A1D] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Timetable Session</h3>
              <button onClick={() => setIsAddingSession(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Title / Subject</label>
                <input 
                  type="text" 
                  value={newSession.title}
                  onChange={e => setNewSession({...newSession, title: e.target.value})}
                  placeholder="e.g. Advanced Calculus"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6750A4]"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Location</label>
                <input 
                  type="text" 
                  value={newSession.loc}
                  onChange={e => setNewSession({...newSession, loc: e.target.value})}
                  placeholder="e.g. Room 402 or Zoom"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6750A4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Day</label>
                  <select 
                    value={newSession.day}
                    onChange={e => setNewSession({...newSession, day: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Start (H)</label>
                    <input 
                      type="number" 
                      min="6" max="22"
                      value={newSession.start}
                      onChange={e => setNewSession({...newSession, start: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">End (H)</label>
                    <input 
                      type="number" 
                      min="7" max="23"
                      value={newSession.end}
                      onChange={e => setNewSession({...newSession, end: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddSession}
                className="w-full bg-[#6750A4] text-white py-4 rounded-2xl font-bold hover:brightness-110 transition-all mt-4"
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
