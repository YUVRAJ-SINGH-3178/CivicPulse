import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../utils/apiConfig';
import {
  ArrowUpCircle,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Search,
  Image as ImageIcon,
  MessageSquareText,
  Radio,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const getStatusClasses = (status) => {
  switch (status) {
    case 'Resolved':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60';
    case 'Under Review':
      return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
  }
};

const getSeverityClasses = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    case 'high':
      return 'text-orange-600 dark:text-orange-400';
    case 'medium':
      return 'text-amber-600 dark:text-amber-400';
    default:
      return 'text-emerald-600 dark:text-emerald-400';
  }
};

const getMediaUrl = (fileUrl) => {
  if (!fileUrl) return null;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${API_BASE_URL}${fileUrl}`;
};

export default function CommunityFeed() {
  const { userId, isSignedIn } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [communityPoints, setCommunityPoints] = useState(0);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/issues`);
      const data = await res.json();
      setIssues(data);
    } catch (error) {
      toast.error("Failed to load issues");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId, hasUpvoted) => {
    if (!isSignedIn) {
      toast.error("Please sign in to verify issues!");
      return;
    }

    if (hasUpvoted) {
      toast.error("You have already verified this issue!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/issues/${issueId}/upvote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkUserId: userId })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upvote");
      }

      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Issue Verified!</span>
          <span className="text-sm">+10 Community Points awarded</span>
        </div>
      );

      setCommunityPoints(prev => prev + 10);
      setIssues(prevIssues =>
        prevIssues.map(issue => {
          if (issue._id === issueId) {
            return {
              ...issue,
              upvotes: (issue.upvotes || 0) + 1,
              upvotedBy: [...(issue.upvotedBy || []), userId]
            };
          }
          return issue;
        })
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredIssues = issues.filter(issue =>
    issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resolvedCount = issues.filter(issue => issue.status === 'Resolved').length;
  const verifiedCount = issues.reduce((total, issue) => total + (issue.upvotes || 0), 0);

  return (
    <div className="min-h-screen bg-[#f7faf7] px-4 py-20 text-slate-900 transition-colors duration-300 dark:bg-[#080d12] dark:text-slate-100 sm:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-20 right-[-6%] h-80 w-80 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/10" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
          <div className="grid gap-6 p-6 md:grid-cols-[1.5fr_1fr] md:p-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Radio className="h-3.5 w-3.5" />
                Live civic desk
              </div>
              <h1 className="font-outfit text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Community feed, without the noise.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Browse neighborhood reports, add a verification when you can personally confirm one, and help the most urgent work surface faster.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              {[
                { label: 'Your points', value: communityPoints, icon: CheckCircle },
                { label: 'Verified by residents', value: verifiedCount, icon: ShieldCheck },
                { label: 'Resolved reports', value: resolvedCount, icon: Sparkles },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <Icon className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-2xl font-black text-slate-950 dark:text-white">{value}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="sticky top-20 z-20 rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={19} />
            <input
              type="text"
              placeholder="Search title, details, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-slate-100/80 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-600 dark:focus:bg-slate-950"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="flex justify-center rounded-3xl border border-slate-200 bg-white/70 py-16 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No matching reports yet.</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">Try a broader search or check back after new reports arrive.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const hasUpvoted = userId && issue.upvotedBy?.includes(userId);
              const mediaUrl = getMediaUrl(issue.fileUrl);
              const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(issue.fileUrl || "");

              return (
                <article key={issue._id} className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5 dark:border-slate-800 dark:bg-slate-900/75 dark:hover:border-emerald-800/70 dark:hover:shadow-black/20">
                  <div className="grid md:grid-cols-[280px_1fr]">
                    <div className="relative min-h-56 bg-slate-100 dark:bg-slate-950 md:min-h-full">
                      {mediaUrl ? (
                        isVideo ? (
                          <video src={mediaUrl} className="absolute inset-0 h-full w-full object-cover" controls muted />
                        ) : (
                          <img src={mediaUrl} alt={issue.title} className="absolute inset-0 h-full w-full object-cover" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,_#eef2f0,_#ffffff)] text-slate-400 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_35%),linear-gradient(135deg,_#0f172a,_#020617)] dark:text-slate-600">
                          <ImageIcon size={42} />
                          <span className="mt-2 text-xs font-bold uppercase tracking-wider">No photo attached</span>
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90 dark:text-emerald-300">
                        {issue.category || 'General'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-5 p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{issue.title}</h2>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{issue.description}</p>
                        </div>
                        <span className={`w-max rounded-full border px-3 py-1 text-xs font-black ${getStatusClasses(issue.status)}`}>
                          {issue.status || 'Pending'}
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-3">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                          <MapPin size={15} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate">{issue.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                          <Clock size={15} className="text-blue-600 dark:text-blue-400" />
                          {new Date(issue.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                          <AlertTriangle size={15} className={getSeverityClasses(issue.severity)} />
                          {issue.severity || 'Low'} priority
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-black text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {issue.upvotes || 0}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Resident verifications</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">Only verify what you have seen.</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUpvote(issue._id, hasUpvoted)}
                          disabled={hasUpvoted || issue.status === 'Resolved'}
                          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                            hasUpvoted
                              ? 'cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : issue.status === 'Resolved'
                                ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                : 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400'
                          }`}
                        >
                          <ArrowUpCircle size={18} />
                          {hasUpvoted ? 'Verified' : 'Verify report'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
