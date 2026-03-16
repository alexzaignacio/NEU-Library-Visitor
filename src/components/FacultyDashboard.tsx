import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Users, 
  ArrowRight, 
  Bookmark,
  GraduationCap,
  MessageSquare,
  ArrowLeft,
  Send,
  Plus,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  profile: UserProfile;
}

type FacultyModule = 'main' | 'reservation' | 'resource' | 'curriculum' | 'assistance';

const FACULTY_FEATURES = [
  {
    id: 'reservation',
    title: 'Room Reservation',
    description: 'Book a private study room or conference area for your classes.',
    icon: Calendar,
    color: 'bg-navy-900',
    shadow: 'shadow-navy-900/20'
  },
  {
    id: 'resource',
    title: 'Resource Request',
    description: 'Request new books, journals, or digital assets for your department.',
    icon: BookOpen,
    color: 'bg-emerald-500',
    shadow: 'shadow-emerald-600/20'
  },
  {
    id: 'curriculum',
    title: 'Curriculum Support',
    description: 'Access specialized databases and research tools for faculty.',
    icon: GraduationCap,
    color: 'bg-amber-500',
    shadow: 'shadow-amber-600/20'
  },
  {
    id: 'assistance',
    title: 'Library Assistance',
    description: 'Get direct support from our librarians for your research projects.',
    icon: MessageSquare,
    color: 'bg-purple-500',
    shadow: 'shadow-purple-600/20'
  }
];

export default function FacultyDashboard({ profile }: Props) {
  const [activeModule, setActiveModule] = useState<FacultyModule>('main');
  const [loading, setLoading] = useState(false);

  const handleAction = (moduleId: string) => {
    setActiveModule(moduleId as FacultyModule);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'reservation':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveModule('main')} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <h2 className="text-2xl font-black text-white">Room Reservation</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Study Room A', 'Conference Hall B', 'Multimedia Room C'].map((room) => (
                <div key={room} className="bg-navy-800 p-8 rounded-[32px] border border-white/10 shadow-sm space-y-6">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{room}</h3>
                  <p className="text-blue-100 text-sm">Available for booking today from 1 PM to 5 PM.</p>
                  <button 
                    onClick={() => {
                      toast.success(`Reservation request sent for ${room}`);
                      setActiveModule('main');
                    }}
                    className="w-full py-3 bg-white hover:bg-blue-50 text-navy-900 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'resource':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveModule('main')} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <h2 className="text-2xl font-black text-white">Resource Request</h2>
            </div>
            
            <div className="bg-navy-800 p-10 rounded-[40px] border border-white/10 shadow-sm max-w-2xl">
              <form onSubmit={(e) => {
                e.preventDefault();
                toast.success('Resource request submitted to acquisition team.');
                setActiveModule('main');
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 ml-1">Resource Title</label>
                  <input type="text" required placeholder="Enter book or journal title..." className="w-full bg-navy-900 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 ml-1">Justification</label>
                  <textarea required placeholder="Briefly explain the academic need..." className="w-full bg-navy-900 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-white/20 h-32" />
                </div>
                <button type="submit" className="w-full py-4 bg-white hover:bg-blue-50 text-navy-900 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg flex items-center justify-center gap-2">
                  <Send size={16} /> Submit Request
                </button>
              </form>
            </div>
          </motion.div>
        );

      case 'curriculum':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveModule('main')} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <h2 className="text-2xl font-black text-white">Curriculum Support</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'IEEE Xplore Digital Library', type: 'Database' },
                { name: 'ScienceDirect Journals', type: 'Database' },
                { name: 'Academic Search Complete', type: 'Tool' },
                { name: 'Turnitin Plagiarism Checker', type: 'Tool' }
              ].map((tool) => (
                <div key={tool.name} className="bg-navy-800 p-8 rounded-[32px] border border-white/10 shadow-sm flex items-center justify-between group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{tool.name}</h4>
                      <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">{tool.type}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success(`Accessing ${tool.name}...`)}
                    className="p-3 bg-white/5 rounded-xl text-blue-200 group-hover:text-white transition-colors border border-white/10"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'assistance':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveModule('main')} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <h2 className="text-2xl font-black text-white">Library Assistance</h2>
            </div>
            
            <div className="bg-navy-800 p-10 rounded-[40px] border border-white/10 shadow-sm max-w-2xl">
              <div className="space-y-8">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <p className="text-sm text-blue-100 leading-relaxed font-medium">Connect with our specialized librarians for research guidance, citation support, or database navigation.</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { name: 'Live Chat Support', status: 'Online', icon: MessageSquare },
                    { name: 'Schedule Consultation', status: 'Available', icon: Calendar },
                    { name: 'Research Guide Request', status: '24h Response', icon: FileText }
                  ].map((option) => (
                    <button 
                      key={option.name}
                      onClick={() => {
                        toast.success(`${option.name} initiated.`);
                        setActiveModule('main');
                      }}
                      className="w-full flex items-center justify-between p-6 bg-navy-900 rounded-2xl border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                          <option.icon size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">{option.name}</p>
                          <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest">{option.status}</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-blue-300 group-hover:text-white transition-colors" />
                    </button>
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
                    Faculty Portal
                  </span>
                </div>
                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome back, Prof. {profile.displayName.split(' ')[0]}</h2>
                <p className="text-blue-100 max-w-xl font-medium">Manage your academic resources and library services from your dedicated faculty dashboard.</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FACULTY_FEATURES.map((feature, idx) => (
                <motion.button
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleAction(feature.id)}
                  className="group bg-navy-800 p-8 rounded-[32px] border border-white/10 shadow-sm hover:border-white/30 hover:shadow-lg hover:shadow-white/5 transition-all text-left"
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6">{feature.description}</p>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:translate-x-1 transition-transform">
                    Access Service <ArrowRight size={12} />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Secondary Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-navy-800 p-8 rounded-[40px] border border-white/10 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded-xl text-white border border-white/10">
                      <FileText size={20} />
                    </div>
                    Recent Activity
                  </h3>
                  <button className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors">View All</button>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-navy-900 rounded-2xl border border-white/10 hover:bg-white/5 hover:border-white/20 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                          <Bookmark size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Advanced Research Methods Vol. {i}</p>
                          <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Borrowed • 2 days ago</p>
                        </div>
                      </div>
                      <button className="p-2 bg-navy-800 rounded-lg text-blue-200 group-hover:text-white transition-colors border border-white/10">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Stats */}
              <div className="bg-navy-800 p-8 rounded-[40px] border border-white/10 shadow-sm">
                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-xl text-white border border-white/10">
                    <Users size={20} />
                  </div>
                  Dept. Usage
                </h3>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-blue-200">Student Engagement</span>
                      <span className="text-white font-black">84%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[84%] rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-blue-200">Resource Utilization</span>
                      <span className="text-emerald-400 font-black">62%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[62%] rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                      <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Librarian's Note</p>
                      <p className="text-sm text-blue-100 leading-relaxed italic">"New digital journals for the Engineering department are now available for access."</p>
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
