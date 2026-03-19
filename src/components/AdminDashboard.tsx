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
  ShieldCheck,
  Shield,
  BookOpen
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, startOfMonth, subDays, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

interface Props {
  profile: UserProfile;
  totalEngagement: number;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

type Tab = 'stats' | 'logs' | 'users' | 'approvals' | 'simulation';

export default function AdminDashboard({ profile, totalEngagement, activeTab, setActiveTab }: Props) {
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'weekly' | 'monthly' | 'all' | 'custom'>('today');
  const [simulatedRole, setSimulatedRole] = useState<'admin' | 'faculty' | 'student' | 'staff'>('admin');
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
    if (dateRange === 'all') return logs;

    let start = startOfDay(new Date());
    let end = endOfDay(new Date());

    if (dateRange === 'weekly') start = startOfWeek(new Date());
    if (dateRange === 'monthly') start = startOfMonth(new Date());
    if (dateRange === 'custom') {
      start = startOfDay(new Date(customStart));
      end = endOfDay(new Date(customEnd));
    }

    return logs.filter(log => {
      if (!log.timestamp) return false;
      try {
        const date = log.timestamp.toDate();
        return isWithinInterval(date, { start, end });
      } catch (e) {
        return false;
      }
    });
  }, [logs, dateRange, customStart, customEnd]);

  const statsData = useMemo(() => {
    const counts: Record<string, number> = {
      'Reading Area': 0,
      'Research Section': 0,
      'Computer Lab': 0,
      'General Study': 0,
      'NEU Museum': 0,
      'Multimedia Room': 0,
      'Group Study': 0,
      'Periodicals': 0,
      'Archives': 0,
      'Technical Services': 0,
      'Reference Section': 0,
      'Circulation Desk': 0
    };
    filteredLogs.forEach(log => {
      if (log.destination && typeof log.destination === 'string' && counts[log.destination] !== undefined) {
        counts[log.destination]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value 
    }));
  }, [filteredLogs]);

  const classificationData = useMemo(() => {
    const counts: Record<string, number> = {
      student: 0,
      faculty: 0,
      staff: 0
    };
    filteredLogs.forEach(log => {
      if (log.classification && typeof log.classification === 'string' && counts[log.classification.toLowerCase()] !== undefined) {
        counts[log.classification.toLowerCase()]++;
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

  const topDestination = useMemo(() => {
    if (statsData.length === 0) return 'N/A';
    const sorted = [...statsData].sort((a, b) => b.value - a.value);
    return sorted[0]?.value > 0 ? sorted[0].name : 'N/A';
  }, [statsData]);

  const filteredUsers = users.filter(u => 
    (u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    u.status === 'approved'
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="space-y-10">
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
                {(['today', 'weekly', 'monthly', 'all', 'custom'] as const).map((r) => (
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
                  <p className="text-blue-100 text-[11px] uppercase tracking-[0.2em] font-black mb-2">Total Engagement</p>
                  <h3 className="text-6xl font-black tracking-tighter text-white">{totalEngagement.toLocaleString()}</h3>
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
                  <p className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-black mb-2">Top Destination</p>
                  <h3 className="text-4xl font-black tracking-tight text-navy-900">
                    {topDestination}
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-navy-900/10">
                <h3 className="text-xl font-black mb-10 flex items-center gap-4 text-navy-900">
                  <div className="bg-navy-900 p-3 rounded-xl text-white shadow-lg">
                    <BarChart3 size={20} />
                  </div>
                  Visitor Destinations
                </h3>
                <div className="h-[350px] w-full">
                  {filteredLogs.length > 0 ? (
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
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest text-xs italic">No data available</div>
                  )}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-navy-900/10">
                <h3 className="text-xl font-black mb-10 flex items-center gap-4 text-navy-900">
                  <div className="bg-orange-brown p-3 rounded-xl text-white shadow-lg shadow-orange-brown/20">
                    <Users size={20} />
                  </div>
                  Visitor Distribution
                </h3>
                <div className="h-[350px] w-full">
                  {filteredLogs.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classificationData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '16px' }}
                          itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={48}>
                          {classificationData.map((entry, index) => (
                            <Cell key={`cell-class-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest text-xs italic">No data available</div>
                  )}
                </div>
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
                    <th className="p-8">Destination</th>
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
                            {log.destination}
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
        {activeTab === 'simulation' && (
          <motion.div 
            key="simulation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-10 rounded-[40px] border border-navy-900/5 shadow-sm max-w-2xl">
              <h3 className="text-2xl font-black text-navy-900 mb-4">Admin POV Simulation</h3>
              <p className="text-navy-900/60 mb-8 font-medium">Select a role to view the system from their perspective. This allows you to verify the user interface and functionality for different user types.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {(['student', 'staff', 'faculty'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSimulatedRole(role)}
                    className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center gap-4 ${
                      simulatedRole === role 
                        ? 'border-orange-600 bg-orange-50' 
                        : 'border-navy-900/5 hover:border-navy-900/20'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${
                      simulatedRole === role ? 'bg-orange-600 text-white' : 'bg-navy-900/5 text-navy-900'
                    }`}>
                      {role === 'student' && <Users size={20} />}
                      {role === 'staff' && <Shield size={20} />}
                      {role === 'faculty' && <BookOpen size={20} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-navy-900/40">Simulate</p>
                      <p className="font-black text-navy-900 capitalize">{role}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    // This will be handled in App.tsx by listening to a custom event or using a shared state
                    window.dispatchEvent(new CustomEvent('simulate-role', { detail: simulatedRole }));
                    toast.success(`Simulating ${simulatedRole} perspective`);
                  }}
                  className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all shadow-lg shadow-orange-600/20"
                >
                  Launch Simulation
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('simulate-role', { detail: 'admin' }));
                    setSimulatedRole('admin');
                    toast.success('Returned to Admin view');
                  }}
                  className="px-8 py-4 bg-navy-900 hover:bg-navy-800 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
