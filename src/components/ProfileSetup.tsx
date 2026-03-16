import React, { useState } from 'react';
import { db, doc, updateDoc } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Building2, ArrowRight } from 'lucide-react';
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

const CLASSIFICATIONS = ['Student', 'Faculty', 'Staff'];

export default function ProfileSetup({ profile, onUpdate }: Props) {
  const [college, setCollege] = useState(profile.college_office || '');
  const [classification, setClassification] = useState(profile.classification || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !classification) {
      toast.error('Please select both your college and classification');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        college_office: college,
        classification: classification
      };
      await updateDoc(doc(db, 'users', profile.uid), updates);
      onUpdate({ ...profile, ...updates });
      toast.success('Profile updated!');
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
      className="max-w-2xl mx-auto bg-navy-800 p-12 rounded-[40px] shadow-2xl border border-white/10"
    >
      <div className="flex items-center gap-8 mb-12">
        <div className="bg-white p-5 rounded-[24px] text-navy-900 shadow-2xl shadow-navy-900/30">
          <Building2 size={36} />
        </div>
        <div>
          <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-300 border border-white/10 mb-3">
            Onboarding
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">First Time Visit?</h2>
          <p className="text-blue-100 font-medium">Please tell us which college or office you belong to.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] ml-1">
              Classification
            </label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="w-full p-5 bg-navy-900 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/20 outline-none transition-all appearance-none cursor-pointer font-bold text-white shadow-sm"
            >
              <option value="" className="bg-navy-800">-- Select One --</option>
              {CLASSIFICATIONS.map((c) => (
                <option key={c} value={c} className="bg-navy-800">{c}</option>
              ))}
              {profile.role === 'admin' && <option value="Admin" className="bg-navy-800">Admin</option>}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] ml-1">
              College / Office
            </label>
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full p-5 bg-navy-900 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/20 outline-none transition-all appearance-none cursor-pointer font-bold text-white shadow-sm"
            >
              <option value="" className="bg-navy-800">-- Select One --</option>
              {COLLEGES.map((c) => (
                <option key={c} value={c} className="bg-navy-800">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 bg-white hover:bg-blue-50 text-navy-900 py-5 px-8 rounded-2xl font-black transition-all shadow-xl disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-xs"
        >
          {loading ? 'Saving Profile...' : 'Continue to Library Log'}
          <ArrowRight size={20} />
        </button>
      </form>
    </motion.div>
  );
}
