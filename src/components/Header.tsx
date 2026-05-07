import { Search, Bell, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll, permissionStatus, requestPermission } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <header className="flex justify-between items-center mb-8 relative">
      <div>
        <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}.</h1>
        <p className="text-gray-400 text-sm">Focus on your goals and achieve excellence today.</p>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="relative group hidden md:block">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-[#252528] rounded-full py-2 px-10 border border-white/10 text-sm w-64 focus:outline-none focus:border-[#6750A4] transition-all"
          />
          <Search size={16} className="absolute left-4 top-2.5 text-gray-500 group-focus-within:text-[#6750A4] transition-colors" />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#252528] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6750A4] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1C1C1E]">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                ></div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-4 w-80 bg-[#252528] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <div className="flex gap-2">
                       {permissionStatus === 'default' && (
                        <button 
                          onClick={requestPermission}
                          className="text-[10px] bg-[#6750A4] px-2 py-1 rounded-md font-bold"
                        >
                          Enable Push
                        </button>
                      )}
                      <button onClick={clearAll} className="text-[10px] text-gray-500 hover:text-white font-bold uppercase tracking-widest">Clear</button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto scrollbar-hide">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm italic">
                        No recent notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer group ${!n.read ? 'bg-purple-500/5' : ''}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</h4>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-[#6750A4]"></div>}
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{n.message}</p>
                          <p className="text-[10px] text-gray-600 italic">
                            {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6750A4] to-[#008080] border-2 border-white/10 cursor-pointer overflow-hidden p-[2px]">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-[#252528] flex items-center justify-center font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
