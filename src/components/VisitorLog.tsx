import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, Timestamp, query, where, orderBy, onSnapshot } from '../firebase';
import { UserProfile, VisitLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Monitor, GraduationCap, CheckCircle2, History, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  profile: UserProfile;
}

const REASONS = [
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'computer', label: 'Use of Computer', icon: Monitor },
  { id: 'studying', label: 'Studying', icon: GraduationCap },
];

export default function VisitorLog({ profile }: Props) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<VisitLog[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    if (!profile.uid) return;

    const q = query(
      collection(db, 'logs'),
      where('userUid', '==', profile.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisitLog[];
      setHistory(logs);
      setTotalEntries(logs.length);
    });

    return () => unsubscribe();
  }, [profile.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for your visit');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'logs'), {
        userUid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        classification: profile.classification,
        college: profile.college_office,
        reason: REASONS.find(r => r.id === reason)?.label || reason,
        timestamp: Timestamp.now()
      });
      setSubmitted(true);
      toast.success('Visit recorded!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to record visit');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-16 rounded-[40px] shadow-2xl text-center border border-slate-100"
        >
          <div className="bg-emerald-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight text-navy-900">Welcome to NEU Library!</h2>
          <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">Your visit has been successfully recorded. Enjoy your time in the library!</p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-orange-brown text-white py-5 px-12 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-brown/20 uppercase tracking-widest active:scale-[0.98]"
          >
            Record Another Entry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Entry Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100"
        >
          <div className="mb-12 text-center">
            <div className="inline-block px-4 py-1.5 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 mb-6">
              Daily Attendance
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-3 text-navy-900">Library Entry Log</h2>
            <p className="text-slate-500 font-medium">Please select your primary reason for visiting today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-2 gap-6">
              {REASONS.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReason(r.id)}
                    className={`flex flex-col items-center justify-center p-10 rounded-[32px] border-2 transition-all gap-5 group relative overflow-hidden ${
                      reason === r.id 
                        ? 'border-orange-brown bg-orange-brown/5 text-orange-brown shadow-xl shadow-orange-brown/10' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:border-slate-200 hover:text-navy-900'
                    }`}
                  >
                    <div className={`p-5 rounded-2xl transition-all ${reason === r.id ? 'bg-orange-brown text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 group-hover:bg-slate-50 group-hover:border-slate-200 group-hover:text-navy-900'}`}>
                      <Icon size={36} />
                    </div>
                    <span className="font-black uppercase tracking-[0.15em] text-[11px]">{r.label}</span>
                    {reason === r.id && (
                      <motion.div 
                        layoutId="active-reason"
                        className="absolute inset-0 border-2 border-orange-brown rounded-[32px] pointer-events-none"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={loading || !reason}
              className="w-full bg-orange-brown hover:bg-orange-600 text-white py-5 px-8 rounded-2xl font-black transition-all shadow-xl shadow-orange-brown/20 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-xs active:scale-[0.98]"
            >
              {loading ? 'Recording...' : 'Confirm Entry'}
            </button>
          </form>
        </motion.div>

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Total Entry Count Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-navy-900 p-8 rounded-[40px] shadow-2xl border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Library Engagement</span>
              </div>
              <p className="text-blue-100/60 text-[11px] uppercase tracking-widest font-black mb-1">Total Entry Count</p>
              <h3 className="text-6xl font-black tracking-tighter text-white">{totalEntries}</h3>
              <p className="text-blue-100/80 text-xs mt-4 font-medium">Recorded visits across all sessions</p>
            </div>
          </motion.div>

          {/* History Log */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl flex flex-col h-[500px]"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-navy-900 flex items-center gap-3">
                <div className="bg-slate-50 p-2 rounded-xl text-navy-900 border border-slate-100">
                  <History size={20} />
                </div>
                Visit History
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-sm">
                  <Clock size={40} className="mb-4 opacity-20" />
                  No entries recorded yet.
                </div>
              ) : (
                history.map((log) => (
                  <div key={log.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-slate-200 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-white text-navy-900 uppercase tracking-widest border border-slate-200">
                        {log.reason}
                      </span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {format(log.timestamp.toDate(), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Recorded entry at NEU Library Main Branch.
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
