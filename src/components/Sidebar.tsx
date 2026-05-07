import { LayoutDashboard, Calendar, CheckSquare, BookOpen, User, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-[#252528] border-r border-white/10 p-6 flex-col justify-between">
      <nav className="space-y-6">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-10 h-10 bg-[#6750A4] rounded-xl flex items-center justify-center font-bold text-xl">S</div>
          <span className="font-bold text-lg tracking-tight">StudyPlan Pro</span>
        </div>
        
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                activeTab === item.id 
                  ? 'bg-[#6750A4] text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'opacity-100' : 'opacity-60'} />
              <span className={activeTab === item.id ? 'font-medium' : ''}>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 bg-[#252528] rounded-2xl border border-white/10 mt-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Status</span>
        </div>
        <p className="text-sm font-medium">Cloud Synced</p>
      </div>
    </aside>
  );
}
