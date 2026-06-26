import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  User,
  Mail,
  MapPin,
  Shield,
  Trophy,
  Star,
  Edit3,
  Save,
  CheckCircle,
  BadgeCheck,
  Bell,
  Home,
  LockKeyhole,
  Sparkles
} from 'lucide-react';

const Profile = () => {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    location: 'Loading...',
  });

  useEffect(() => {
    if (user && isLoaded) {
      setFormData({
        username: user.fullName || user.firstName || 'Citizen',
        location: 'Local Resident',
      });
    }
  }, [user, isLoaded]);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 900);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-20 dark:bg-slate-950">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400" />
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress || 'N/A';

  return (
    <div className="min-h-screen bg-[#f7f8f5] px-4 pb-12 pt-24 text-slate-900 transition-colors duration-300 dark:bg-[#080d12] dark:text-slate-100 sm:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-8rem] top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-24 left-[-10rem] h-80 w-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/10" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
          <div className="relative min-h-44 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.34),transparent_26%),linear-gradient(135deg,#064e3b,#0f766e_55%,#0f172a)]">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.12),transparent)]" />
            <div className="absolute bottom-5 left-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5" />
              Resident profile
            </div>
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-16 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="relative w-max">
                  <div className="h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-xl dark:border-slate-900 dark:bg-slate-950">
                    <img
                      src={user?.imageUrl || `https://ui-avatars.com/api/?name=${formData.username}`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 shadow-sm dark:border-slate-900">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="pb-1">
                  <h1 className="font-outfit text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                    {formData.username}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <MapPin className="h-4 w-4" />
                      {formData.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <CheckCircle className="h-4 w-4" />
                      Verified account
                    </span>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-emerald-700 disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="h-4 w-4" /> Save changes</>}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit profile
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-outfit text-2xl font-black text-slate-950 dark:text-white">Account details</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your public civic identity simple and accurate.</p>
              </div>
              <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">Full name</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                  disabled={!isEditing}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                    isEditing
                      ? 'border-emerald-300 bg-white text-slate-900 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-800 dark:bg-slate-950 dark:text-white'
                      : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300'
                  }`}
                />
              </label>

              <div>
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">Email address</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                  <Mail className="h-5 w-5 text-slate-400" />
                  {email}
                </div>
                <p className="ml-1 mt-2 text-xs text-slate-400 dark:text-slate-500">Email changes stay with your account provider.</p>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">Neighborhood</span>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                  disabled={!isEditing}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                    isEditing
                      ? 'border-emerald-300 bg-white text-slate-900 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-800 dark:bg-slate-950 dark:text-white'
                      : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300'
                  }`}
                />
              </label>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-emerald-200 bg-emerald-600 p-6 text-white shadow-xl shadow-emerald-900/10 dark:border-emerald-800 dark:bg-emerald-500 dark:text-slate-950">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-black">Civic impact</h2>
                <Trophy className="h-6 w-6" />
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur dark:bg-slate-950/10">
                  <div className="text-sm font-bold opacity-75">Points earned</div>
                  <div className="mt-1 text-4xl font-black">150</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur dark:bg-slate-950/10">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-75">Reported</div>
                    <div className="mt-1 text-2xl font-black">3</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur dark:bg-slate-950/10">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-75">Verified</div>
                    <div className="mt-1 text-2xl font-black">12</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
              <h3 className="mb-4 font-outfit text-xl font-black text-slate-950 dark:text-white">Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Pioneer', icon: Star, className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
                  { label: 'Verifier', icon: Shield, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
                  { label: 'Neighbor', icon: Home, className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
                  { label: 'Trusted', icon: LockKeyhole, className: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' },
                ].map(({ label, icon: Icon, className }) => (
                  <div key={label} className={`rounded-2xl p-4 text-center ${className}`}>
                    <Icon className="mx-auto mb-2 h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
              <h3 className="mb-4 font-outfit text-xl font-black text-slate-950 dark:text-white">Preferences</h3>
              <div className="space-y-3">
                {[
                  { label: 'Status alerts', icon: Bell },
                  { label: 'Weekly civic digest', icon: Sparkles },
                  { label: 'Public verification badge', icon: CheckCircle },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      {label}
                    </div>
                    <span className="h-5 w-9 rounded-full bg-emerald-500 p-0.5">
                      <span className="block h-4 w-4 translate-x-4 rounded-full bg-white" />
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Profile;
