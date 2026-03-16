import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, Timestamp, updateDoc, getRedirectResult } from './firebase';
import { UserProfile } from './types';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import VisitorLog from './components/VisitorLog';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StaffDashboard from './components/StaffDashboard';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Library, User, ShieldCheck } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'admin' | 'faculty' | 'student' | 'staff'>('admin');

  useEffect(() => {
    // Handle redirect result for mobile auth
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast.success('Successfully signed in!');
        }
      } catch (error: any) {
        if (error.code !== 'auth/no-current-user') {
          console.error("Redirect Auth Error:", error);
          toast.error(`Auth Error: ${error.message}`);
        }
      }
    };
    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const email = firebaseUser.email;
        const isSuperAdmin = email === 'alexzagayle.ignacio@neu.edu.ph' || email === 'jcesperanza@neu.edu.ph';

        if (email && !email.endsWith('@neu.edu.ph') && !isSuperAdmin) {
          await auth.signOut();
          toast.error('Please use your @neu.edu.ph institutional email.');
          setLoading(false);
          return;
        }

        setUser(firebaseUser);
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const profileDoc = await getDoc(userRef);
          
          if (profileDoc.exists()) {
            const data = profileDoc.data() as UserProfile;
            
            if (data.isBlocked) {
              toast.error('Access Denied: Your account is blocked.');
              await auth.signOut();
              setProfile(null);
              setUser(null);
              setLoading(false);
              return;
            }

            // Auto-upgrade alex to admin if not already
            if (isSuperAdmin && data.role !== 'admin') {
              await updateDoc(userRef, { role: 'admin' });
              data.role = 'admin';
            }
            
            await updateDoc(userRef, { lastLogin: Timestamp.now() });
            const updatedProfile = { ...data, lastLogin: Timestamp.now() };
            setProfile(updatedProfile);
            
            // Set initial view mode based on role
            if (data.role === 'admin') setViewMode('admin');
            else if (data.classification === 'Faculty') setViewMode('faculty');
            else if (data.classification === 'Staff') setViewMode('staff');
            else setViewMode('student');
          } else {
            const isInitialAdmin = isSuperAdmin;
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous',
              role: isInitialAdmin ? 'admin' : 'user',
              isBlocked: false,
              lastLogin: Timestamp.now(),
              createdAt: Timestamp.now(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
            setViewMode(isInitialAdmin ? 'admin' : 'student');
            toast.success('Welcome! Please complete your profile.');
          }
        } catch (error: any) {
          console.error("Profile Error:", error);
          toast.error(`Error loading profile: ${error.message}`);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" />
      
      {!user ? (
        <Login />
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* Blue Navigation Frame */}
          <header className="sticky top-0 z-50 bg-navy-900 px-4 sm:px-6 lg:px-8 py-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-2xl text-navy-900 shadow-xl ring-1 ring-white/10">
                  <Library size={24} />
                </div>
                <div className="hidden xs:block">
                  <h1 className="text-lg font-black tracking-tight text-white leading-tight">NEU LIBRARY</h1>
                  <p className="text-[10px] text-blue-100 font-black uppercase tracking-[0.2em]">Institutional Access</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {profile?.role === 'admin' && (
                  <div className="flex bg-navy-800/50 p-1 rounded-xl border border-white/10">
                    {(['admin', 'faculty', 'staff', 'student'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          viewMode === mode 
                            ? 'bg-white text-navy-900 shadow-lg' 
                            : 'text-blue-100 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pl-6 border-l border-white/20">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white">{profile?.displayName}</p>
                    <div className="flex flex-col items-end">
                      <p className="text-[9px] text-blue-100 font-black uppercase tracking-widest flex items-center justify-end gap-1.5">
                        {profile?.role === 'admin' ? <ShieldCheck size={10} className="text-white" /> : <User size={10} />}
                        {profile?.classification || profile?.role}
                      </p>
                      <p className="text-[8px] text-blue-200/80 font-medium mt-0.5">
                        Institutional Email: <span className="text-blue-100 font-bold">{profile?.role === 'admin' ? 'admin' : (profile?.classification?.toLowerCase() || 'student')}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 bg-navy-800 hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all text-blue-100 border border-white/10"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full bg-navy-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <AnimatePresence mode="wait">
                {profile?.isBlocked ? (
                  <motion.div 
                    key="blocked"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-navy-800 p-16 rounded-[40px] shadow-2xl text-center border border-white/10 ring-1 ring-white/5"
                  >
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-400">
                      <ShieldCheck size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Access Denied</h2>
                    <p className="text-blue-100 max-w-md mx-auto leading-relaxed">Your account has been restricted from accessing the library portal. Please contact the University Administration for resolution.</p>
                  </motion.div>
                ) : (viewMode === 'admin' && profile?.role === 'admin') ? (
                  <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <AdminDashboard profile={profile} />
                  </motion.div>
                ) : !profile?.college_office || !profile?.classification ? (
                  <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <ProfileSetup profile={profile} onUpdate={(updated) => setProfile(updated)} />
                  </motion.div>
                ) : viewMode === 'faculty' ? (
                  <motion.div key="faculty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <FacultyDashboard profile={profile} />
                  </motion.div>
                ) : viewMode === 'staff' ? (
                  <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <StaffDashboard profile={profile} />
                  </motion.div>
                ) : (
                  <motion.div key="student" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <VisitorLog profile={profile} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
          
          {/* Blue Footer Frame */}
          <footer className="bg-navy-900 border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 text-blue-100">
                <Library size={16} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">NEU Library System © 2026</span>
              </div>
              <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-blue-200">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
