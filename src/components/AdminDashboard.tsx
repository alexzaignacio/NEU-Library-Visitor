import React, { useState, useEffect, useMemo } from 'react';
import { db, collection, query, onSnapshot, orderBy, where, Timestamp, doc, updateDoc, getDocs } from '../firebase';
import { UserProfile, VisitLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  History, 
  BarChart3, 
  Search, 
  Ban, 
  CheckCircle, 
  Calendar, 
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, startOfMonth, subDays, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

interface Props {
  profile: UserProfile;
}

type Tab = 'stats' | 'logs' | 'users' | 'approvals';

export default function AdminDashboard({ profile }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'weekly' | 'monthly' | 'custom'>('today');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const logsQuery = query(collection(db, 'logs'), orderBy('timestamp', 'desc'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VisitLog));
      setLogs(logsData);
    });

    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      setUsers(usersData);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeUsers();
    };
  }, []);

  const filteredLogs = useMemo(() => {
    let start = startOfDay(new Date());
    let end = endOfDay(new Date());

    if (dateRange === 'weekly') start = startOfWeek(new Date());
    if (dateRange === 'monthly') start = startOfMonth(new Date());
    if (dateRange === 'custom') {
      start = startOfDay(new Date(customStart));
      end = endOfDay(new Date(customEnd));
    }

    return logs.filter(log => {
      const date = log.timestamp.toDate();
      return isWithinInterval(date, { start, end });
    });
  }, [logs, dateRange, customStart, customEnd]);

  const statsData = useMemo(() => {
    const counts: Record<string, number> = {
      reading: 0,
      research: 0,
      computer: 0,
      studying: 0
    };
    filteredLogs.forEach(log => {
      if (counts[log.reason] !== undefined) {
        counts[log.reason]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));
  }, [filteredLogs]);

  const handleApproveUser = async (userUid: string) => {
    try {
      await updateDoc(doc(db, 'users', userUid), {
        status: 'approved'
      });
      toast.success('User account approved');
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleBlockUser = async (userUid: string, currentlyBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userUid), {
        isBlocked: !currentlyBlocked
      });
      toast.success(currentlyBlocked ? 'User unblocked' : 'User blocked');
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending_approval');

  const filteredUsers = users.filter(u => 
    (u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    u.status === 'approved'
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="space-y-10">
      {/* Navigation Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-navy-900/10 w-fit mx-auto">
        {(['stats', 'logs', 'users', 'approvals'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab 
                ? 'bg-orange-brown text-white shadow-xl shadow-orange-brown/20' 
                : 'text-slate-400 hover:text-navy-900 hover:bg-slate-50'
            }`}
          >
            {tab}
            {tab === 'approvals' && pendingUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                {pendingUsers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Filter Controls */}
            <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-navy-900/10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-navy-900 p-3 rounded-xl text-white shadow-lg">
                  <Filter size={20} />
                </div>
                <span className="font-black uppercase tracking-[0.2em] text-[11px] text-navy-900">Analytics Filter</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {(['today', 'weekly', 'monthly', 'custom'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      dateRange === r 
                        ? 'bg-orange-brown text-white shadow-xl shadow-orange-brown/20' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-navy-900 border border-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {dateRange === 'custom' && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="date" 
                    value={customStart} 
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-brown/20 text-navy-900 shadow-sm"
                  />
                  <span className="text-slate-400 font-black text-[10px]">TO</span>
                  <input 
                    type="date" 
                    value={customEnd} 
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-brown/20 text-navy-900 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-navy-900 p-10 rounded-[40px] shadow-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-125 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-white p-4 rounded-2xl text-navy-900 shadow-lg">
                      <Users size={28} />
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2 uppercase tracking-[0.2em]">
                      <TrendingUp size={12} /> Live
                    </span>
                  </div>
                  <p className="text-blue-100 text-[11px] uppercase tracking-[0.2em] font-black mb-2">Total Visitors</p>
                  <h3 className="text-6xl font-black tracking-tighter text-white">{filteredLogs.length}</h3>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-navy-900/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-brown/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-125 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-orange-brown p-4 rounded-2xl text-white shadow-lg shadow-orange-brown/30">
                      <BarChart3 size={28} />
                    </div>
                  </div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-black mb-2">Top Reason</p>
                  <h3 className="text-4xl font-black tracking-tight text-navy-900">
                    {statsData.sort((a, b) => b.value - a.value)[0]?.value > 0 
                      ? statsData.sort((a, b) => b.value - a.value)[0]?.name 
                      : 'N/A'}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-navy-900/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-100 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-125 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-navy-900 p-4 rounded-2xl text-white shadow-lg">
                      <Clock size={28} />
                    </div>
                  </div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-black mb-2">Peak Time</p>
                  <h3 className="text-4xl font-black tracking-tight text-navy-900">10:00 AM</h3>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-navy-900/10">
              <h3 className="text-xl font-black mb-10 flex items-center gap-4 text-navy-900">
                <div className="bg-navy-900 p-3 rounded-xl text-white shadow-lg">
                  <BarChart3 size={20} />
                </div>
                Visitor Distribution
              </h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '16px' }}
                      itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={48}>
                      {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div 
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[40px] shadow-2xl border border-navy-900/10 overflow-hidden"
          >
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-navy-900">
              <h3 className="text-xl font-black flex items-center gap-4 text-white">
                <div className="bg-white/10 p-3 rounded-xl text-white border border-white/10">
                  <History size={20} />
                </div>
                Recent Activity
              </h3>
              <span className="text-[10px] font-black text-blue-100 bg-white/10 border border-white/10 px-4 py-2 rounded-xl uppercase tracking-[0.2em]">
                {filteredLogs.length} Records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="p-8 pl-10">Visitor</th>
                    <th className="p-8">Classification</th>
                    <th className="p-8">College/Office</th>
                    <th className="p-8">Reason</th>
                    <th className="p-8 pr-10">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic">No records found for this period.</td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-8 pl-10">
                          <p className="font-bold text-navy-900 group-hover:text-orange-brown transition-colors">{log.displayName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.email}</p>
                        </td>
                        <td className="p-8">
                          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                            {log.classification || 'N/A'}
                          </span>
                        </td>
                        <td className="p-8 text-xs text-slate-500 font-bold uppercase tracking-widest">{log.college}</td>
                        <td className="p-8">
                          <span className="text-[9px] font-black px-4 py-2 rounded-xl bg-orange-brown/5 text-orange-brown uppercase tracking-[0.2em] border border-orange-brown/10">
                            {log.reason}
                          </span>
                        </td>
                        <td className="p-8 pr-10 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          {format(log.timestamp.toDate(), 'MMM d, h:mm a')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'approvals' && (
          <motion.div 
            key="approvals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-navy-900/10">
              <h3 className="text-xl font-black mb-10 flex items-center gap-4 text-navy-900">
                <div className="bg-navy-900 p-3 rounded-xl text-white shadow-lg">
                  <ShieldCheck size={20} />
                </div>
                Pending Approvals
              </h3>
              
              {pendingUsers.length === 0 ? (
                <div className="text-center py-20 text-slate-300 font-black uppercase tracking-widest text-xs italic">
                  No pending approval requests.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {pendingUsers.map((u) => (
                    <div key={u.uid} className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex justify-between items-center group hover:border-orange-brown/50 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-navy-900 flex items-center justify-center text-white font-black text-3xl shadow-lg">
                          {u.displayName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-navy-900 text-lg">{u.displayName}</h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">{u.email}</p>
                          <div className="flex gap-3">
                            <span className="text-[9px] font-black text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em]">{u.classification}</span>
                            <span className="text-[9px] font-black text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em]">{u.college_office}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApproveUser(u.uid)}
                          className="px-8 py-3 bg-orange-brown hover:bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-orange-brown/20"
                        >
                          Approve Account
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-3 rounded-2xl shadow-2xl border border-navy-900/10 flex items-center gap-5 px-8">
              <Search size={24} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm py-5 font-bold text-navy-900 placeholder:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredUsers.map((u) => (
                <div key={u.uid} className="bg-white p-8 rounded-[40px] shadow-2xl border border-navy-900/10 flex justify-between items-center group hover:border-orange-brown/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg ${u.isBlocked ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-navy-900 text-white shadow-navy-900/20'}`}>
                      {u.displayName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-navy-900 text-lg flex items-center gap-3">
                        {u.displayName}
                        {u.isBlocked && <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-3 py-1 rounded-xl uppercase font-black tracking-[0.2em]">Blocked</span>}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">{u.email}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em]">{u.classification || 'User'}</span>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em]">{u.college_office || 'No College'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleBlockUser(u.uid, u.isBlocked)}
                      className={`p-5 rounded-2xl transition-all shadow-sm ${
                        u.isBlocked 
                          ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100 border border-emerald-100' 
                          : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                      }`}
                      title={u.isBlocked ? 'Unblock User' : 'Block User'}
                    >
                      {u.isBlocked ? <CheckCircle size={24} /> : <Ban size={24} />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
