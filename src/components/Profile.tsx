import { logout, auth } from '../lib/firebase';
import { LogOut, User, Shield, Bell, Moon, CreditCard, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tasks'), where('user_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTaskCount(snapshot.size);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));
    return () => unsubscribe();
  }, [user]);
  
  const sections = [
    { label: 'Academic Settings', icon: Shield, color: '#6750A4' },
    { label: 'Notifications', icon: Bell, color: '#008080' },
    { label: 'Appearance & Dark Mode', icon: Moon, color: '#f59e0b' },
    { label: 'Subscription & Billing', icon: CreditCard, color: '#ec4899' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="bg-[#252528] rounded-3xl border border-white/10 p-8 flex flex-col items-center mb-6 shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#6750A4] to-[#008080] opacity-10"></div>
        
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6750A4] to-[#008080] p-1 shadow-xl">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-[#252528]" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#252528] flex items-center justify-center text-3xl font-bold border-4 border-[#252528]">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#6750A4] border-4 border-[#252528] flex items-center justify-center text-white scale-90 hover:scale-100 transition-transform shadow-lg">
            <Settings size={14} />
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-1 tracking-tight">{user?.displayName || 'Student User'}</h2>
        <p className="text-gray-500 text-sm mb-6">{user?.email}</p>
        
        <div className="flex gap-4 w-full">
          <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-lg font-bold text-white">-</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Current GPA</p>
          </div>
          <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-lg font-bold text-white">{taskCount}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Total Tasks</p>
          </div>
          <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-lg font-bold text-white">0</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Exams Tracked</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((item, i) => (
          <button key={i} className="w-full bg-[#252528] hover:bg-[#2c2c2f] rounded-2xl border border-white/10 p-5 flex items-center justify-between transition-all group active:scale-[0.99]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: item.color }}>
                <item.icon size={20} />
              </div>
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-600 group-hover:text-[#6750A4] group-hover:translate-x-1 transition-all" />
          </button>
        ))}
        
        <button 
          onClick={logout}
          className="w-full mt-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl p-5 border border-red-500/20 flex items-center justify-center gap-3 font-bold transition-all active:scale-[0.99]"
        >
          <LogOut size={20} />
          Sign Out Account
        </button>
      </div>

      <p className="mt-10 text-center text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">StudyPlan Pro v1.0.4 • Beta Access</p>
    </div>
  );
}
