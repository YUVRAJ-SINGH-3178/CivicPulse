import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  FileText,
  List,
  User,
  Map,
  Users,
  BookOpen,
  Trophy,
  Star,
  Activity,
  AlertTriangle,
  Brain
} from "lucide-react";
import { API_BASE_URL } from "../utils/apiConfig";

const UserDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [myIssues, setMyIssues] = useState([]);
  const [loadingMyIssues, setLoadingMyIssues] = useState(true);

  // Fetch this user's complaints
  useEffect(() => {
    if (!user) return;
    const fetchMyIssues = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/issues?clerkUserId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setMyIssues(data || []);
        }
      } catch (err) {
        console.warn("Could not fetch user issues in dashboard:", err);
      } finally {
        setLoadingMyIssues(false);
      }
    };
    fetchMyIssues();
  }, [user]);

  const dashboardItems = [
    {
      title: "Report an Issue",
      description: "Submit a new local street or infrastructure problem for municipal repair.",
      onClick: () => navigate("/report-issue"),
      icon: FileText,
      badge: "Core"
    },
    {
      title: "My Complaints",
      description: "Track all civic reports you have filed, upload photos, and view status history.",
      onClick: () => navigate("/complaints"),
      icon: List,
      badge: null
    },
    {
      title: "Community Feed",
      description: "Verify issues reported by neighbors, vote on priorities, and collect points.",
      onClick: () => navigate("/community-feed"),
      icon: Users,
      badge: "Verify & Earn"
    },
    {
      title: "Live Map",
      description: "Pinpoint active tickets in your residential sector on an interactive map.",
      onClick: () => navigate("/user-map"),
      icon: Map,
      badge: null
    },
    {
      title: "Predictive Insights",
      description: "Spot risk trends from active reports, severity, status, and resident verification.",
      onClick: () => navigate("/insights"),
      icon: Brain,
      badge: "New"
    },
    {
      title: "My Profile Settings",
      description: "Review your impact badges, current points total, and address details.",
      onClick: () => navigate("/profile"),
      icon: User,
      badge: null
    },
    {
      title: "Resources Hub",
      description: "Read citizen rights, FAQs, and guides on effective civic reporting.",
      onClick: () => navigate("/resources"),
      icon: BookOpen,
      badge: null
    }
  ];

  // Helper status pill mapping
  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved": return "status-resolved";
      case "In Progress": return "status-in-progress";
      case "Rejected": return "status-rejected";
      default: return "status-pending";
    }
  };

  return (
    <div className="landing-page-root min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* Dashboard Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800 text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              🏛️ Local Sector Central
            </span>
            <h1 className="civic-h1 text-3xl md:text-4xl">
              Welcome back, {user?.firstName || "Citizen"} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm md:text-base leading-relaxed">
              Verify local issues, file new complaints, and coordinate with municipal crews.
            </p>
          </div>

          <button
            onClick={() => navigate("/report-issue")}
            className="civic-btn-primary px-5 py-3 text-sm"
            style={{ cursor: "pointer" }}
          >
            Report Issue
          </button>
        </div>

        {/* Stats Grid Column */}
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
          {[
            { icon: Activity, label: "Complaints Filed", value: myIssues.length, color: "text-emerald-700 dark:text-emerald-400" },
            { icon: Trophy, label: "Community Points", value: "150 XP", color: "text-amber-600" },
            { icon: Star, label: "Reports Verified", value: "12 Issues", color: "text-blue-600" },
          ].map((stat, i) => (
            <div key={i} className="civic-card p-5 flex flex-col items-center justify-center text-center">
              <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{stat.value}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Split Columns Grid: Main Hub Actions vs Sidebar Bulletin */}
        <div className="grid lg:grid-cols-12 gap-8 text-left">
          
          {/* Main Action Hub Grid (Left Column - Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
              Citizen Actions Hub
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {dashboardItems.map((item, index) => (
                <div
                  key={index}
                  onClick={item.onClick}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => { if (e.key === "Enter") item.onClick(); }}
                  className="civic-card p-6 flex flex-col items-start cursor-pointer group text-left relative h-full"
                  style={{ outline: "none" }}
                >
                  {item.badge && (
                    <span className="absolute top-4 right-4 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200/40">
                      {item.badge}
                    </span>
                  )}
                  
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                    <item.icon className="w-5 h-5" />
                  </div>

                  <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Bulletins & Progress (Right Column - Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* District Bulletins Card */}
            <div className="flex flex-col gap-4">
              <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                Municipal Bulletins
              </h3>

              <div className="civic-card p-5 flex flex-col gap-4">
                <div className="flex gap-2.5 items-start text-xs border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <span className="text-[16px] mt-0.5">⚠️</span>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">Scheduled Power Shutdown</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                      Wednesday 10:00 - 14:00. Sector 4 main line offline for routine transformer maintenance.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start text-xs border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <span className="text-[16px] mt-0.5">🚧</span>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">Double Road Resurfacing</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                      Starting Friday 22:00. Lane redirections in place. Commuters are advised to route via Central Ring.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start text-xs">
                  <span className="text-[16px] mt-0.5">💧</span>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">Clean Water Drive</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                      Sanitation division flushing Block-C supply lines this Saturday, 06:00 - 09:00.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Tickets Progress Tracker */}
            <div className="flex flex-col gap-4">
              <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                Your Tickets Status
              </h3>

              {loadingMyIssues ? (
                <div className="civic-card p-6 flex justify-center items-center">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myIssues.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {myIssues.slice(0, 3).map((issue) => (
                    <div key={issue._id} className="civic-card p-4 flex justify-between items-center text-xs gap-3">
                      <div className="truncate text-left flex-1">
                        <h5 className="font-bold text-slate-800 dark:text-slate-200 truncate">{issue.title}</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{issue.category}</p>
                      </div>
                      <span className={`status-pill ${getStatusStyle(issue.status)} flex-shrink-0`}>
                        {issue.status}
                      </span>
                    </div>
                  ))}
                  {myIssues.length > 3 && (
                    <button 
                      onClick={() => navigate("/complaints")}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors text-center w-full mt-1"
                    >
                      View All {myIssues.length} Complaints →
                    </button>
                  )}
                </div>
              ) : (
                <div className="civic-card p-6 text-center text-slate-500 text-xs">
                  <p>You have not submitted any complaints yet.</p>
                  <button 
                    onClick={() => navigate("/report-issue")}
                    className="text-emerald-700 dark:text-emerald-400 font-bold mt-2 hover:underline"
                  >
                    File your first report
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
