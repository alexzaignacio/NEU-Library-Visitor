import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { db, collection, addDoc, Timestamp, onSnapshot, query, orderBy, updateDoc, doc } from '../firebase';
import { 
  Package, 
  ClipboardList, 
  Settings, 
  Shield, 
  ArrowRight,
  Truck,
  AlertCircle,
  ArrowLeft,
  Search,
  Plus,
  Save,
  RefreshCw,
  Lock,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  profile: UserProfile;
  totalEngagement: number;
}

type StaffModule = 'main' | 'inventory' | 'facility' | 'security' | 'config';

const STAFF_TASKS = [
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Track and update physical book stocks and equipment.',
    icon: Package,
    color: 'bg-navy-900',
    shadow: 'shadow-navy-900/20'
  },
  {
    id: 'facility',
    title: 'Facility Requests',
    description: 'Monitor maintenance and cleaning schedules for library areas.',
    icon: ClipboardList,
    color: 'bg-cyan-500',
    shadow: 'shadow-cyan-600/20'
  },
  {
    id: 'security',
    title: 'Security Logs',
    description: 'Review access logs and security reports for the facility.',
    icon: Shield,
    color: 'bg-rose-500',
    shadow: 'shadow-rose-600/20'
  },
  {
    id: 'config',
    title: 'System Config',
    description: 'Manage library kiosk settings and hardware status.',
    icon: Settings,
    color: 'bg-slate-600',
    shadow: 'shadow-slate-600/20'
  }
];

export default function StaffDashboard({ profile, totalEngagement }: Props) {
  const [activeModule, setActiveModule] = useState<StaffModule>('main');
  const [inventory, setInventory] = useState<any[]>([]);
  const [facilityRequests, setFacilityRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const invQuery = query(collection(db, 'inventory'), orderBy('name'));
    const unsubscribeInv = onSnapshot(invQuery, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const facQuery = query(collection(db, 'facility_requests'), orderBy('timestamp', 'desc'));
    const unsubscribeFac = onSnapshot(facQuery, (snapshot) => {
      setFacilityRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeInv();
      unsubscribeFac();
    };
  }, []);

  const handleAddInventory = async () => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'inventory'), {
        name: 'New Resource',
        sku: `SKU-${Math.floor(Math.random() * 1000)}`,
        stock: 10,
        status: 'Available'
      });
      toast.success('Inventory item added');
    } catch (error) {
      toast.error('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFacilityRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, 'facility_requests', id), {
        status: 'completed'
      });
      toast.success('Request marked as complete');
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'inventory':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveModule('main')} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">
                <ArrowLeft size={16} /> Back to Operations
              </button>
              <h2 className="text-2xl font-black text-white">Inventory Management</h2>
            </div>
            
            <div className="bg-navy-800 p-8 rounded-[40px] border border-white/10 shadow-sm space-y-8">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" size={18} />
                  <input type="text" placeholder="Search inventory by SKU or Title..." className="w-full bg-navy-900 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <button 
                  onClick={handleAddInventory} 
                  disabled={loading}
                  className="px-6 bg-white hover:bg-blue-50 text-navy-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
                >
                  <Plus size={16} /> {loading ? 'Adding...' : 'Add Item'}
                </button>
              </div>

              <div className="space-y-4">
                {inventory.length === 0 ? (
                  <div className="p-12 text-center text-blue-200 font-black uppercase tracking-widest text-[10px] bg-navy-900 rounded-2xl border border-white/5">
                    No inventory items found. Click "Add Item" to begin.
                  </div>
                ) : (
                  inventory.map((item) => (
                    <div key={item.id} className="p-6 bg-navy-900 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/5 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                          <Package size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{item.name}</h4>
                          <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">SKU: {item.sku} • Stock: {item.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          item.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          item.status === 'In Use' ? 'bg-white/10 text-white border border-white/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.status}
                        </span>
                        <button className="p-2 text-blue-300 hover:text-white transition-colors">
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        );

      case 'facility':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveModule('main')} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">
                <ArrowLeft size={16} /> Back to Operations
              </button>
              <h2 className="text-2xl font-black text-white">Facility Requests</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilityRequests.length === 0 ? (
                <div className="col-span-full p-12 text-center text-blue-200 font-black uppercase tracking-widest text-[10px] bg-navy-800 rounded-[40px] border border-white/5">
                  No facility requests found.
                </div>
              ) : (
                facilityRequests.map((req) => (
                  <div key={req.id} className="bg-navy-800 p-8 rounded-[32px] border border-white/10 shadow-sm space-y-6">
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 ${req.priority === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-white'} rounded-xl flex items-center justify-center border border-white/10`}>
                        <AlertCircle size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          req.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/10 text-white border border-white/20'
                        }`}>
                          {req.priority} Priority
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          req.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white">{req.title}</h3>
                    <p className="text-blue-100 text-sm">Requested: {format(req.timestamp.toDate(), 'MMM d, h:mm a')}</p>
                    <div className="flex gap-3">
                      {req.status !== 'completed' && (
                        <button onClick={() => handleCompleteFacilityRequest(req.id)} className="flex-1 py-3 bg-white hover:bg-blue-50 text-navy-900 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg">
                          Complete
                        </button>
                      )}
                      <button onClick={() => toast.success('Opening details...')} className="px-5 py-3 bg-navy-900 hover:bg-white/5 text-blue-200 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10">
                        Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveModule('main')} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">
                <ArrowLeft size={16} /> Back to Operations
              </button>
              <h2 className="text-2xl font-black text-white">Security Logs</h2>
            </div>
            
            <div className="bg-navy-800 p-8 rounded-[40px] border border-white/10 shadow-sm">
              <div className="space-y-4">
                {[
                  { event: 'Unauthorized Access Attempt', area: 'Server Room', time: '10:45 AM', severity: 'Critical' },
                  { event: 'Main Gate Opened', area: 'Entrance', time: '07:00 AM', severity: 'Info' },
                  { event: 'System Backup Complete', area: 'Cloud Storage', time: '03:00 AM', severity: 'Success' }
                ].map((log, i) => (
                  <div key={i} className="p-6 bg-navy-900 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 ${
                        log.severity === 'Critical' ? 'bg-rose-500/10 text-rose-400' : 
                        log.severity === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white'
                      } rounded-xl flex items-center justify-center border border-white/10`}>
                        <Shield size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{log.event}</h4>
                        <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">{log.area} • {log.time}</p>
                      </div>
                    </div>
                    <button className="p-3 bg-navy-800 border border-white/10 rounded-xl text-blue-300 hover:text-white transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'config':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveModule('main')} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">
                <ArrowLeft size={16} /> Back to Operations
              </button>
              <h2 className="text-2xl font-black text-white">System Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-navy-800 p-10 rounded-[40px] border border-white/10 shadow-sm space-y-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Settings size={20} className="text-white" /> Kiosk Settings
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Auto-Lock Idle Kiosks</p>
                      <p className="text-xs text-blue-200">Lock after 5 minutes of inactivity</p>
                    </div>
                    <div className="w-12 h-6 bg-white/20 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Guest Access Mode</p>
                      <p className="text-xs text-blue-200">Allow visitors to browse catalog</p>
                    </div>
                    <div className="w-12 h-6 bg-white/5 rounded-full relative cursor-pointer border border-white/10">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <button onClick={() => toast.success('Settings saved successfully')} className="w-full py-4 bg-white hover:bg-blue-50 text-navy-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg">
                  <Save size={16} /> Save Changes
                </button>
              </div>

              <div className="bg-navy-800 p-10 rounded-[40px] border border-white/10 shadow-sm space-y-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <RefreshCw size={20} className="text-white" /> Hardware Health
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Server Cluster A', status: 'Healthy', load: '24%' },
                    { name: 'Kiosk Terminal 04', status: 'Warning', load: '92%' },
                    { name: 'Network Gateway', status: 'Healthy', load: '12%' }
                  ].map((hw) => (
                    <div key={hw.name} className="p-5 bg-navy-900 rounded-2xl border border-white/10">
                      <div className="flex justify-between mb-3">
                        <p className="text-sm font-bold text-white">{hw.name}</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${hw.status === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {hw.status}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${hw.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full`} style={{ width: hw.load }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="space-y-10">
            {/* Welcome Section */}
            <div className="relative overflow-hidden bg-navy-900 p-10 rounded-[40px] shadow-lg border border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                    Staff Operations
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    {totalEngagement.toLocaleString()} Live Engagement
                  </span>
                </div>
                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Staff Portal: {profile.displayName}</h2>
                <p className="text-blue-100 max-w-xl font-medium">Oversee library logistics, inventory, and facility maintenance from your operations command center.</p>
              </div>
            </div>

            {/* Operations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STAFF_TASKS.map((task, idx) => (
                <motion.button
                  key={task.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setActiveModule(task.id as StaffModule)}
                  className="group bg-navy-800 p-8 rounded-[32px] border border-white/10 shadow-sm hover:border-white/30 hover:shadow-lg hover:shadow-white/5 transition-all text-left"
                >
                  <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-navy-900 mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <task.icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6">{task.description}</p>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:translate-x-1 transition-transform">
                    Open Module <ArrowRight size={12} />
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Logistics Feed */}
              <div className="lg:col-span-2 bg-navy-800 p-8 rounded-[40px] border border-white/10 shadow-sm">
                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-xl text-white border border-white/10">
                    <Truck size={20} />
                  </div>
                  Logistics Queue
                </h3>
                
                <div className="space-y-4">
                  {[
                    { item: 'New Acquisitions (Batch #402)', status: 'In Transit', time: 'Expected 2 PM' },
                    { item: 'Study Room A/C Maintenance', status: 'Scheduled', time: 'Tomorrow 9 AM' },
                    { item: 'IT Hardware Audit', status: 'Pending', time: 'Next Week' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-navy-900 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.item}</p>
                          <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">{item.status} • {item.time}</p>
                        </div>
                      </div>
                      <button onClick={() => toast.success('Opening details...')} className="px-4 py-2 bg-navy-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors">
                        Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-navy-800 p-8 rounded-[40px] border border-white/10 shadow-sm">
                <h3 className="text-xl font-black text-white mb-8">Facility Status</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-navy-900 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Active Kiosks</p>
                    <p className="text-3xl font-black text-white">12 / 14</p>
                    <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[85%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6 bg-navy-900 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Pending Requests</p>
                    <p className="text-3xl font-black text-white">08</p>
                    <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[40%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderModule()}
    </AnimatePresence>
  );
}
