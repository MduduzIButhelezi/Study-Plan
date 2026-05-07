import { signInWithGoogle } from '../lib/firebase';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#1C1C1E] text-white p-6">
      <div className="w-16 h-16 bg-[#6750A4] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
        <GraduationCap size={40} className="text-white" />
      </div>
      <h1 className="text-4xl font-bold mb-2 tracking-tight">StudyPlan Pro</h1>
      <p className="text-gray-400 mb-10 text-center max-w-xs">Organize your academic life with AI-powered schedules and smart insights.</p>
      
      <button 
        onClick={signInWithGoogle}
        className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-lg active:scale-95"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        Sign in with Google
      </button>
      
      <p className="mt-8 text-xs text-gray-500 uppercase tracking-widest font-semibold">Your focused journey starts here</p>
    </div>
  );
}
