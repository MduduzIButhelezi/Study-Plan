import { useState } from 'react';
import { loginWithEmail, signupWithEmail } from '../lib/firebase';
import { GraduationCap, Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = 'An error occurred. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      sendNotification('Authentication Error', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#1A1A1D] text-white p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#6750A4] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">StudyPlan Pro</h1>
          <p className="text-gray-400 text-center">
            {isLogin ? 'Welcome back to your workspace' : 'Create your academic account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#6750A4] transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#6750A4] transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#6750A4] text-white py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#6750A4] font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

        <p className="mt-12 text-[10px] text-gray-600 uppercase tracking-widest font-bold text-center">Your focused journey starts here</p>
      </div>
    </div>
  );
}
