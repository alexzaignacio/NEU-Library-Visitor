import React, { useState } from 'react';
import { signInWithGoogle, auth, signInWithEmailAndPassword } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion } from 'motion/react';
import { GraduationCap, LogIn, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      
      // If it's a popup, we get a result. If it's a redirect, the page will reload.
      if (result) {
        const userEmail = result.user.email;
        const isSuperAdmin = userEmail === 'alexzagayle.ignacio@neu.edu.ph' || userEmail === 'jcesperanza@neu.edu.ph';
        
        if (userEmail && !userEmail.endsWith('@neu.edu.ph') && !isSuperAdmin) {
          await auth.signOut();
          toast.error('Please use your @neu.edu.ph institutional email.');
          return;
        }
        
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      if (error.code !== 'auth/no-current-user') {
        toast.error(`Sign-in failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !displayName)) {
      toast.error('Please fill in all fields');
      return;
    }

    const isSuperAdmin = email === 'alexzagayle.ignacio@neu.edu.ph' || email === 'jcesperanza@neu.edu.ph';
    if (!email.endsWith('@neu.edu.ph') && !isSuperAdmin) {
      toast.error('Please use an @neu.edu.ph email address.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        toast.success('Account created! Welcome.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully');
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Left Side - Hero */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0 opacity-50">
          <img 
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
            alt="Library" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-navy-900/80"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/10 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border border-white/20">
              <GraduationCap size={32} className="text-[#a78bfa]" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
              NEU Library <br />
              Portal
            </h1>
            <p className="text-lg text-slate-300 mb-12 max-w-lg leading-relaxed">
              Empowering the university community with a modern, secure, and streamlined library visitor management system.
            </p>

            <div className="space-y-6">
              {[
                'Secure Role-Based Access',
                'Real-time Visitor Tracking',
                'Audit Trail & Analytics'
              ].map((feature, i) => (
                <motion.div 
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-4 text-slate-300"
                >
                  <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 md:p-14 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100"
        >
          <div className="text-center mb-10">
            <div className="bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/20">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in with your university account</p>
          </div>
          
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
              Sign in with Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase tracking-widest font-bold">or</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <input
                  type="email"
                  placeholder="Institutional Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign in with Email'}
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-slate-500 text-xs font-semibold hover:text-blue-600 transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-8">
              By signing in, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
