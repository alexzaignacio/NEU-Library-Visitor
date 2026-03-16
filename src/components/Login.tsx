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
    <div className="h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side - Hero (50% on desktop, top on mobile) */}
      <div className="w-full md:w-1/2 h-[35vh] md:h-full relative overflow-hidden shrink-0">
        <div className="absolute inset-0">
          <img 
            src="https://media.licdn.com/dms/image/v2/C4E1BAQF0X2-Pil2iag/company-background_10000/company-background_10000/0/1645461279672/new_era_university_qc_main_cover?e=2147483647&v=beta&t=W6qIZJWlKZS6mWA4ozpu_7zSMtSnOtt9Myf64qdMYUA" 
            alt="NEU Campus" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full px-10 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="bg-orange-brown w-16 h-1 mb-6 md:mb-8"></div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white mb-4 md:mb-6 tracking-tight leading-[1.1]">
              NEU Library <br />
              <span className="text-orange-brown text-2xl md:text-4xl lg:text-6xl">Visitor Portal</span>
            </h1>
            <p className="hidden md:block text-base lg:text-lg text-blue-50/80 mb-8 lg:mb-10 max-w-md leading-relaxed font-medium border-l-2 border-white/20 pl-6">
              Empowering the university community with a modern, secure, and streamlined library entry monitoring system.
            </p>

            <div className="hidden md:flex flex-col gap-4 lg:gap-5">
              {[
                { label: 'Secure Role-Based Access', icon: CheckCircle2 },
                { label: 'Real-time Visitor Tracking', icon: CheckCircle2 },
                { label: 'Automated Entry Logs', icon: CheckCircle2 }
              ].map((item, i) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-4 text-white/90"
                >
                  <div className="bg-white/10 p-1 rounded-full backdrop-blur-sm">
                    <item.icon size={14} className="text-orange-brown" />
                  </div>
                  <span className="text-xs lg:text-sm font-bold tracking-wide">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form (50% on desktop, bottom on mobile) */}
      <div className="w-full md:w-1/2 h-[65vh] md:h-full flex items-center justify-center p-6 md:p-8 lg:p-12 bg-[#fcfcfc] overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md w-full bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 relative flex flex-col max-h-[90vh]"
        >
          <div className="text-center mb-6 md:mb-8 shrink-0">
            <div className="bg-white p-3 md:p-4 w-20 h-20 md:w-24 md:h-24 rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto mb-4 md:mb-5 shadow-xl border border-slate-50">
              <img 
                src="https://neu.edu.ph/main/img/neu.png" 
                alt="NEU Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-navy-900 mb-1 tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium">Sign in with your university account</p>
          </div>
          
          <div className="space-y-4 md:space-y-5">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-navy-800 hover:bg-navy-900 text-white py-3.5 md:py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] text-xs md:text-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
              Sign in with Google
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase tracking-widest font-bold">or</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-3 md:space-y-4">
              {isSignUp && (
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-brown/20 focus:border-orange-brown outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                  />
                </div>
              )}
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Institutional Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-brown/20 focus:border-orange-brown outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                />
              </div>
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-brown/20 focus:border-orange-brown outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-brown hover:bg-orange-brown/90 text-white py-3.5 md:py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-brown/20 disabled:opacity-50 mt-1 uppercase tracking-widest text-xs md:text-sm"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign in with Email'}
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-slate-500 text-[11px] font-semibold hover:text-blue-600 transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>

            <p className="text-[9px] md:text-[10px] text-slate-400 text-center leading-relaxed mt-4 md:mt-6">
              By signing in, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
