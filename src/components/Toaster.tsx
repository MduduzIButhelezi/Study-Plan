import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Toaster() {
  const { notifications, markAsRead } = useNotifications();

  // Auto-hide unread notifications after 5 seconds
  useEffect(() => {
    const timers = notifications
      .filter(n => !n.read)
      .map(n => setTimeout(() => markAsRead(n.id), 5000));
    
    return () => timers.forEach(t => clearTimeout(t));
  }, [notifications, markAsRead]);

  // Only show the 5 most recent unread notifications
  const activeNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 5);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'error': return <AlertCircle className="text-red-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {activeNotifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="w-80 bg-[#1A1A1D] border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto flex gap-3 items-start backdrop-blur-md"
          >
            <div className="mt-0.5">{getIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{n.title}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.message}</p>
            </div>
            <button 
              onClick={() => markAsRead(n.id)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
