import React, { useState } from 'react';
import { db, doc, updateDoc } from '../firebase';
import { UserProfile, UserRole, UserStatus } from '../types';
import { motion } from 'motion/react';
import { Building2, ArrowRight, GraduationCap, Briefcase, UserCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const COLLEGES = [
  'College of Arts and Sciences',
  'College of Business Administration',
  'College of Communication',
  'College of Computer Studies',
  'College of Criminology',
  'College of Education',
  'College of Engineering and Architecture',
  'College of International Relations',
  'College of Law',
  'College of Medical Technology',
  'College of Music',
  'College of Nursing',
  'College of Physical Therapy',
  'College of Respiratory Therapy',
  'Graduate School',
  'Integrated School (Elementary/High School)',
  'University Office / Administration'
];

const CLASSIFICATIONS = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'bg-blue-500' },
  { id: 'faculty', label: 'Faculty', icon: Briefcase, color: 'bg-orange-brown' },
  { id: 'staff', label: 'Staff', icon: UserCircle, color: 'bg-navy-700' }
];

export default function ProfileSetup({ profile, onUpdate }: Props) {
  const [college, setCollege] = useState(profile.college_office || '');
  const [role, setRole] = useState<UserRole | ''>(profile.role === 'admin' ? 'admin' : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !role) {
      toast.error('Please select both your college and classification');
      return;
    }

    setLoading(true);
    try {
      const status: UserStatus = (role === 'student' || role === 'admin') ? 'approved' : 'pending_approval';
      const classification = role.charAt(0).toUpperCase() + role.slice(1) as any;

      const updates = {
        college_office: college,
        role: role as UserRole,
        classification: classification,
        status: status
      };
      
      await updateDoc(doc(db, 'users', profile.uid), updates);
      onUpdate({ ...profile, ...updates });
      
      if (status === 'pending_approval') {
        toast.success('Profile submitted! Awaiting administrative approval.');
      } else {
        toast.success('Profile updated!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-100"
    >
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="bg-navy-900 p-5 rounded-[24px] text-white shadow-2xl shadow-navy-900/10">
          <Building2 size={36} />
        </div>
        <div className="text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 mb-3">
            Onboarding
          </div>
          <h2 className="text-4xl font-black tracking-tight text-navy-900 mb-2">Complete Your Profile</h2>
          <p className="text-slate-500 font-medium">Select your classification and college to continue.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-6">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            I am a...
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLASSIFICATIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setRole(c.id as UserRole)}
                className={`flex flex-col items-center p-8 rounded-[32px] border-2 transition-all duration-300 group relative overflow-hidden ${
                  role === c.id 
                    ? `border-orange-brown bg-orange-brown/5 shadow-2xl shadow-orange-brown/10 scale-[1.02]` 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${
                  role === c.id ? 'bg-orange-brown text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
                }`}>
                  <c.icon size={32} />
                </div>
                <span className={`text-lg font-black uppercase tracking-widest ${
                  role === c.id ? 'text-navy-900' : 'text-slate-400'
                }`}>
                  {c.label}
                </span>
                {role === c.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute bottom-0 left-0 w-full h-1 bg-orange-brown"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            College / Office
          </label>
          <div className="relative">
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-brown/20 outline-none transition-all appearance-none cursor-pointer font-bold text-navy-900 shadow-inner"
            >
              <option value="" className="bg-white">-- Select Your College or Office --</option>
              {COLLEGES.map((c) => (
                <option key={c} value={c} className="bg-white">{c}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Building2 size={20} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 bg-orange-brown hover:bg-orange-600 text-white py-6 px-8 rounded-2xl font-black transition-all shadow-2xl shadow-orange-brown/30 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-sm active:scale-[0.98]"
        >
          {loading ? 'Processing...' : 'Complete Registration'}
          <ArrowRight size={20} />
        </button>
      </form>
    </motion.div>
  );
}
