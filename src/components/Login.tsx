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
        <div className="absolute inset-0">
          <img 
            src="https://media.licdn.com/dms/image/v2/C4E1BAQF0X2-Pil2iag/company-background_10000/company-background_10000/0/1645461279672/new_era_university_qc_main_cover?e=2147483647&v=beta&t=W6qIZJWlKZS6mWA4ozpu_7zSMtSnOtt9Myf64qdMYUA" 
            alt="NEU Campus" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/60 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white p-4 w-24 h-24 rounded-full flex items-center justify-center mb-10 shadow-2xl ring-4 ring-orange-brown/20">
              <img 
                src="https://neu.edu.ph/main/img/neu.png" 
                alt="NEU Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
              NEU Library <br />
              <span className="text-orange-brown">Visitor Portal</span>
            </h1>
            <p className="text-lg text-blue-50 mb-12 max-w-lg leading-relaxed font-medium">
              Welcome to the New Era University Library. Please sign in with your institutional account to access our services.
            </p>

            <div className="space-y-6">
              {[
                'Secure Institutional Login',
                'Real-time Visitor Management',
                'Automated Approval System'
              ].map((feature, i) => (
                <motion.div 
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-4 text-blue-50"
                >
                  <div className="bg-orange-brown p-1 rounded-full shadow-lg">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-bold tracking-wide">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-navy-900 md:bg-[#f8fafc]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 md:p-14 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-navy-900/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-brown"></div>
          
          <div className="text-center mb-10">
            <div className="md:hidden bg-white p-3 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-2 ring-slate-100">
              <img 
                src="https://neu.edu.ph/main/img/neu.png" 
                alt="NEU Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-3xl font-black text-navy-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-sm font-medium">Sign in to your university account</p>
          </div>
          
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-navy-800 hover:bg-navy-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-navy-900/20 active:scale-[0.98]"
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
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-brown/20 focus:border-orange-brown outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <input
                  type="email"
                  placeholder="Institutional Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-brown/20 focus:border-orange-brown outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-brown/20 focus:border-orange-brown outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-brown hover:bg-orange-brown/90 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-orange-brown/20 disabled:opacity-50 mt-2 uppercase tracking-widest"
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
