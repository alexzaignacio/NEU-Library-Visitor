import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, Timestamp, updateDoc, getRedirectResult, query, collection, onSnapshot, where } from './firebase';
import { UserProfile } from './types';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import VisitorLog from './components/VisitorLog';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StaffDashboard from './components/StaffDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Library, User, ShieldCheck, BarChart3, History, Users, CheckCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'admin' | 'faculty' | 'student' | 'staff'>('student');
  const [adminTab, setAdminTab] = useState<'stats' | 'logs' | 'users' | 'approvals' | 'simulation'>('stats');
  const [isSimulating, setIsSimulating] = useState(false);
  const [totalEngagement, setTotalEngagement] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Global Engagement Counter Listener
    const q = query(collection(db, 'logs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTotalEngagement(snapshot.size);
    });

    // Pending Approvals Listener
    const pendingQuery = query(collection(db, 'users'), where('status', '==', 'pending_approval'));
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      setPendingCount(snapshot.size);
    });

    return () => {
      unsubscribe();
      unsubscribePending();
    };
  }, []);

  useEffect(() => {
    const handleSimulation = (e: any) => {
      const role = e.detail;
      if (profile?.role === 'admin') {
        setViewMode(role);
        setIsSimulating(role !== 'admin');
      }
    };

    window.addEventListener('simulate-role', handleSimulation);
    return () => window.removeEventListener('simulate-role', handleSimulation);
  }, [profile]);

  useEffect(() => {
    // Handle redirect result for mobile auth
    const initAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Successfully handled redirect sign-in");
          // The onAuthStateChanged listener will pick up the user
        }
      } catch (error: any) {
        if (error.code !== 'auth/no-current-user') {
          console.error("Redirect Auth Error:", error);
          toast.error(`Authentication Error: ${error.message}`);
        }
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

            // Auto-upgrade admins if not already
            if (isSuperAdmin && data.role !== 'admin') {
              await updateDoc(userRef, { role: 'admin', status: 'approved' });
              data.role = 'admin';
              data.status = 'approved';
            }
            
            await updateDoc(userRef, { lastLogin: Timestamp.now() });
            const updatedProfile = { ...data, lastLogin: Timestamp.now() };
            setProfile(updatedProfile);
            
            // Set initial view mode based on role
            if (!isSimulating) {
              if (data.role === 'admin') setViewMode('admin');
              else if (data.classification === 'Faculty') setViewMode('faculty');
              else if (data.classification === 'Staff') setViewMode('staff');
              else setViewMode('student');
            }
          } else {
            const isInitialAdmin = isSuperAdmin;
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous',
              role: isInitialAdmin ? 'admin' : 'student',
              status: 'approved',
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
  }, [isSimulating]);

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
    <div className="min-h-screen bg-white text-navy-900 font-sans selection:bg-orange-brown/30 flex overflow-hidden">
      <Toaster position="top-right" />
      
      {!user ? (
        <Login />
      ) : (
        <>
          {/* Sidebar */}
          <aside className="hidden lg:flex w-72 bg-navy-900 flex-col shrink-0 border-r border-white/5">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-12">
                <div className="bg-white p-2 rounded-xl shadow-xl ring-1 ring-white/10">
                  <img 
                    src="https://neu.edu.ph/main/img/neu.png" 
                    alt="NEU Logo" 
                    className="w-10 h-10 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-sm font-black tracking-tight text-white leading-tight">NEU LIBRARY</h1>
                  <p className="text-[9px] text-blue-200 font-black uppercase tracking-[0.2em]">Visitor Portal</p>
                </div>
              </div>

              <nav className="space-y-2">
                {profile?.role !== 'admin' ? (
                  <button
                    onClick={() => setViewMode(profile?.classification?.toLowerCase() as any || 'student')}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      viewMode !== 'admin'
                        ? 'bg-orange-brown text-white shadow-lg shadow-orange-brown/20'
                        : 'text-blue-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Library size={18} />
                    Dashboard
                  </button>
                ) : (
                  <>
                    <div className="px-6 py-4">
                      <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mb-4">Main Menu</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setViewMode(profile?.classification?.toLowerCase() as any || 'student');
                            setIsSimulating(false);
                          }}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            viewMode !== 'admin'
                              ? 'bg-orange-brown text-white shadow-lg shadow-orange-brown/20'
                              : 'text-blue-200 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Library size={18} />
                          Visitor View
                        </button>
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mb-4">Admin Controls</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setViewMode('admin');
                            setAdminTab('stats');
                          }}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            viewMode === 'admin' && adminTab === 'stats'
                              ? 'bg-orange-brown text-white shadow-lg shadow-orange-brown/20'
                              : 'text-blue-200 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <BarChart3 size={18} />
                          Analytics
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('admin');
                            setAdminTab('logs');
                          }}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            viewMode === 'admin' && adminTab === 'logs'
                              ? 'bg-orange-brown text-white shadow-lg shadow-orange-brown/20'
                              : 'text-blue-200 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <History size={18} />
                          Logs
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('admin');
                            setAdminTab('users');
                          }}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            viewMode === 'admin' && adminTab === 'users'
                              ? 'bg-orange-brown text-white shadow-lg shadow-orange-brown/20'
                              : 'text-blue-200 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Users size={18} />
                          Users
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('admin');
                            setAdminTab('approvals');
                          }}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
                            viewMode === 'admin' && adminTab === 'approvals'
                              ? 'bg-orange-brown text-white shadow-lg shadow-orange-brown/20'
                              : 'text-blue-200 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <ShieldCheck size={18} />
                          Approvals
                          {pendingCount > 0 && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center border-2 border-navy-900">
                              {pendingCount}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </nav>
            </div>

            <div className="mt-auto p-8 border-t border-white/5">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            {/* Header */}
            <header className="bg-navy-900 px-8 py-5 shadow-lg relative z-20 border-b border-white/5">
              <div className="max-w-full mx-auto flex justify-between items-center">
                <div className="lg:hidden flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl text-navy-900 shadow-xl">
                    <Library size={20} />
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-4">
                  <h2 className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em]">
                    {viewMode === 'admin' ? 'Administrative Dashboard' : 
                     isSimulating ? `POV Simulation: ${viewMode.toUpperCase()}` :
                     'Library Visitor System'}
                  </h2>
                  {isSimulating && (
                    <button 
                      onClick={() => {
                        setViewMode('admin');
                        setIsSimulating(false);
                      }}
                      className="px-3 py-1 bg-orange-brown text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-orange-brown/20"
                    >
                      Exit POV
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 pl-6 border-l border-white/20">
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{profile?.displayName}</p>
                      <div className="flex flex-col items-end">
                        <p className="text-[9px] text-blue-200 font-black uppercase tracking-widest flex items-center justify-end gap-1.5">
                          {profile?.role === 'admin' ? <ShieldCheck size={10} className="text-orange-brown" /> : <User size={10} />}
                          {profile?.classification || profile?.role}
                        </p>
                        <p className="text-[8px] text-blue-300 font-bold mt-0.5">
                          Institutional Email: <span className="text-blue-100">{profile?.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black">
                      {profile?.displayName?.charAt(0)}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
              <div className="p-8 lg:p-12">
                <ErrorBoundary>
                  <AnimatePresence mode="wait">
                    {profile?.isBlocked ? (
                      <motion.div 
                        key="blocked"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-16 rounded-[40px] shadow-2xl text-center border border-slate-100 max-w-2xl mx-auto mt-10"
                      >
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 shadow-inner">
                          <ShieldCheck size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-navy-900 mb-4 tracking-tight">Access Denied</h2>
                        <p className="text-slate-500 max-w-md mx-auto leading-relaxed font-medium">Your account has been restricted from accessing the library portal. Please contact the University Administration for resolution.</p>
                      </motion.div>
                    ) : (profile?.status === 'pending_approval' && profile?.role !== 'admin') ? (
                      <motion.div 
                        key="pending"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-16 rounded-[40px] shadow-2xl text-center border border-slate-100 max-w-2xl mx-auto mt-10"
                      >
                        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-orange-brown shadow-inner">
                          <ShieldCheck size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-navy-900 mb-4 tracking-tight">Pending Approval</h2>
                        <p className="text-slate-500 max-w-md mx-auto leading-relaxed font-medium">Your account is currently awaiting administrative approval. Please check back later or contact your department head.</p>
                        <button 
                          onClick={handleLogout}
                          className="mt-8 px-10 py-4 bg-navy-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/20"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    ) : (viewMode === 'admin' && profile?.role === 'admin') ? (
                      <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <AdminDashboard 
                          profile={profile} 
                          totalEngagement={totalEngagement} 
                          activeTab={adminTab}
                          setActiveTab={setAdminTab}
                        />
                      </motion.div>
                    ) : !profile?.college_office || !profile?.classification ? (
                      <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <ProfileSetup profile={profile} onUpdate={(updated) => setProfile(updated)} />
                      </motion.div>
                    ) : viewMode === 'faculty' ? (
                      <motion.div key="faculty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <FacultyDashboard profile={profile} totalEngagement={totalEngagement} />
                      </motion.div>
                    ) : viewMode === 'staff' ? (
                      <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <StaffDashboard profile={profile} totalEngagement={totalEngagement} />
                      </motion.div>
                    ) : (
                      <motion.div key="student" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <VisitorLog profile={profile!} totalEngagement={totalEngagement} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
