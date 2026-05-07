import { LayoutDashboard, Calendar, CheckSquare, BookOpen, User } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'timetable', label: 'Plans', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'profile', label: 'Me', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#252528]/80 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-full flex gap-2 shadow-2xl z-50">
      {menuItems.map((item) => (
        <button 
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex items-center justify-center p-3 rounded-full transition-all ${
            activeTab === item.id 
              ? 'bg-[#6750A4] text-white shadow-lg' 
              : 'text-gray-400'
          }`}
        >
          <item.icon size={22} />
        </button>
      ))}
    </nav>
  );
}
