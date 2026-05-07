import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';

export default function Timetable() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 12 AM (23:00)

  const sessions = [
    { day: 'Monday', start: 9, end: 10.5, title: 'Calculus', loc: 'Room 402', color: '#6750A4' },
    { day: 'Monday', start: 11, end: 12.5, title: 'Chemistry', loc: 'Lab A', color: '#008080' },
    { day: 'Monday', start: 14, end: 15.5, title: 'AI Ethics', loc: 'Online', color: '#f59e0b' },
  ];

  const getPosition = (time: number) => {
    return (time - 6) * 60; // 1px per minute
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Weekly Timetable</h2>
        <div className="flex gap-2">
          <button className="bg-[#6750A4] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110">
            <Plus size={18} /> Add Session
          </button>
          <button className="bg-[#252528] border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/5 transition-all">
            Export JSON
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
            {sessions.filter(s => s.day === selectedDay).map((session, i) => (
              <div 
                key={i}
                className="absolute left-16 right-0 rounded-2xl p-4 flex flex-col gap-1 border shadow-xl transition-all hover:scale-[1.01] hover:brightness-110 cursor-pointer"
                style={{ 
                  top: `${getPosition(session.start)}px`, 
                  height: `${(session.end - session.start) * 60}px`,
                  backgroundColor: `${session.color}20`,
                  borderColor: `${session.color}40`,
                  color: session.color
                }}
              >
                <p className="font-bold text-sm tracking-tight">{session.title}</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="flex items-center gap-1 text-[10px] opacity-80">
                    <Clock size={12} /> {session.start}:00 - {session.end}:00
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
    </div>
  );
}
