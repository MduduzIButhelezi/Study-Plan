import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Dashboard from './components/Dashboard';
import Timetable from './components/Timetable';
import Tasks from './components/Tasks';
import Notes from './components/Notes';
import Profile from './components/Profile';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toaster from './components/Toaster';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1C1C1E]">
        <div className="animate-pulse text-[#6750A4] text-xl font-bold">Loading StudyPlan Pro...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'timetable': return <Timetable />;
      case 'tasks': return <Tasks />;
      case 'notes': return <Notes />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#1C1C1E] text-white overflow-hidden">
      <Toaster />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col p-8 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
          {renderTab()}
        </div>
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
