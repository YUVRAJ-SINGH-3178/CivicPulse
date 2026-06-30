import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./Home.css";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";

import TestimonialCarousel from "./components/TestimonialCarousel";
import { API_BASE_URL } from "./utils/apiConfig";

function Home() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  
  // States for Live Reports Widget
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  // Removed forceful redirect to profile-setup to improve UX. Users can still see the ProfileCompletionBanner.

  // Mock reports as fallback/initial landing data
  const fallbackIssues = [
    {
      _id: "mock-1",
      title: "Broken Streetlight near Children's Park Corner",
      category: "Electricity",
      location: "Sector 4, HSR Layout",
      severity: "Medium",
      status: "In Progress",
      upvotes: 42,
      description: "The streetlamp near the park's main gate has been non-functional for a week, creating dark zones in the evening.",
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    },
    {
      _id: "mock-2",
      title: "Major Pothole on Sector 7 Crossing",
      category: "Road & Infrastructure",
      location: "Double Road, Sector 7",
      severity: "Critical",
      status: "Pending",
      upvotes: 28,
      description: "Deep pothole developed near the intersection, causing two-wheelers to swerve dangerously. Immediate repair needed.",
      createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
    },
    {
      _id: "mock-3",
      title: "Uncollected Waste Stack near Main Market",
      category: "Waste Management",
      location: "Krishnarajapuram Market",
      severity: "High",
      status: "Resolved",
      upvotes: 67,
      description: "Commercial garbage pileup blocking the sidewalk. Cleaned up and resolved by the waste clearance authority.",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    }
  ];

  // Fetch recent issues from the database
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/issues`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setIssues(sorted.slice(0, 3));
          } else {
            setIssues(fallbackIssues);
          }
        } else {
          setIssues(fallbackIssues);
        }
      } catch (err) {
        console.warn("Could not load database issues, utilizing fallback reports:", err);
        setIssues(fallbackIssues);
      } finally {
        setLoadingIssues(false);
      }
    };
    fetchIssues();
  }, []);

  // Handle direct upvote interaction from Home Page
  const handleUpvote = async (issueId) => {
    if (issueId.startsWith("mock-")) {
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId
            ? { ...issue, upvotes: issue.upvotes + 1, hasUpvoted: true }
            : issue
        )
      );
      toast.success("Local upvote registered! Sign in to track issues.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/issues/${issueId}/upvote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        const updated = await response.json();
        setIssues(prev =>
          prev.map(issue =>
            issue._id === issueId
              ? { ...issue, upvotes: updated.upvotes || (issue.upvotes + 1), hasUpvoted: true }
              : issue
          )
        );
        toast.success("Upvote recorded successfully!");
      } else {
        toast.error("Failed to register upvote. Please sign in!");
      }
    } catch (err) {
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId
            ? { ...issue, upvotes: issue.upvotes + 1, hasUpvoted: true }
            : issue
        )
      );
      toast.info("Connection offline. Simulated local upvote.");
    }
  };

  // Helper: map severity string to pill styling
  const getSeverityClass = (sev) => {
    switch (sev) {
      case "Critical": return "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/30";
      case "High": return "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30";
      case "Medium": return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30";
    }
  };

  // Helper: format creation date
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const faqData = [
    {
      question: "What is CivicPulse?",
      answer: "CivicPulse is a transparent civic collaboration platform that allows citizens to report local infrastructure issues, track resolutions, and vote on neighborhood needs."
    },
    {
      question: "How do reports reach local authorities?",
      answer: "Once an issue is reported and verified by the community, it is categorized and routed into the municipal dashboard where city workers can review severity, assign resources, and update progress."
    },
    {
      question: "Why do we upvote issues?",
      answer: "Upvoting increases an issue's visibility. City dashboards prioritize issues with higher community engagement to ensure critical problems are addressed first."
    },
    {
      question: "Is there a citizen ranking or points system?",
      answer: "Yes! Every verified report and upvote earns you community impact points. Points contribute to your status as a Verified Citizen, showcasing your role in making your neighborhood better."
    }
  ];

  return (
    <div className="landing-page-root min-h-screen flex flex-col">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="dark"
      />

      <Helmet>
        <title>CivicPulse | Collaborative Civic Problem Solver</title>
        <meta name="description" content="Report potholes, broken streetlights, and waste problems directly to your local municipality. Track real-time progress on community improvement projects." />
      </Helmet>

      <main className="flex-1 pb-16">


        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Asymmetric typography */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left animate-slide-up-civic">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-6 w-max border border-emerald-200/50 dark:border-emerald-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" style={{ width: "6px", height: "6px" }}></span>
                Citizen-Driven Community Hub
              </div>
              
              <h1 className="civic-h1 text-4xl sm:text-5xl xl:text-6xl tracking-tight mb-6">
                Empower Your Street. <br />
                <span className="civic-font-editorial italic font-normal text-emerald-700 dark:text-emerald-400">
                  Improve Your City.
                </span>
              </h1>

              <p className="civic-body text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-[580px]">
                CivicPulse is a transparent platform connecting neighborhoods directly to city administrators. Snap street problems, build community priority, and track actual progress.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  className="civic-btn-primary px-8 py-3.5 text-base flex items-center justify-center gap-2 group"
                  style={{ cursor: "pointer", display: "inline-flex" }}
                  onClick={() => navigate(isSignedIn ? "/report-issue" : "/signup")}
                >
                  Report an Issue
                  <svg width="16" height="16" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <button
                  className="civic-btn-secondary px-8 py-3.5 text-base flex items-center justify-center gap-2"
                  style={{ cursor: "pointer", display: "inline-flex" }}
                  onClick={() => navigate(isSignedIn ? "/user-map" : "/signup")}
                >
                  Explore Active Map
                  <svg width="16" height="16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446 5.25-2.25a.75.75 0 0 0 .447-.682V6.112a.75.75 0 0 0-.503-.704l-5.25-2.25a.75.75 0 0 0-.503 0l-5.25 2.25a.75.75 0 0 0-.503 0L3.486 3.162a.75.75 0 0 0-.447.682v11.758a.75.75 0 0 0 .503.704l5.25 2.25a.75.75 0 0 0 .503 0Z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <div className="flex text-yellow-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" className="w-4 h-4 fill-current text-yellow-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">4.8/5 from 2,500+ verified residents</span>
              </div>
            </div>

            {/* Right Column: Dashboard Preview */}
            <div className="lg:col-span-5 flex items-center justify-center animate-slide-up-civic" style={{ animationDelay: "0.2s" }}>
              <div className="w-full civic-dashboard-preview relative flex flex-col gap-6 select-none text-left">
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Civic Impact Feed</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live platform aggregate</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" style={{ width: "6px", height: "6px" }}></span>
                    Live Data
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">1,840+</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fixed Issues</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">92%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resolved Rate</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">3.8d</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Response</span>
                  </div>
                </div>

                <div className="civic-card civic-dashboard-grid-line p-4 min-h-[160px] relative overflow-hidden flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2 mb-1">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Active Incident Lifecycle</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold dark:bg-blue-950/40 dark:text-blue-400 uppercase tracking-wide">In Progress</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-left">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Water Logging at Block-B Corner</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Road & Infrastructure • Reported 3h ago</p>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ display: "flex", alignItems: "center" }}>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" style={{ flex: 1, height: "8px", backgroundColor: "rgba(0,0,0,0.05)" }}>
                      <div className="bg-emerald-600 dark:bg-emerald-500 rounded-full" style={{ width: "66%", height: "8px" }}></div>
                    </div>
                    <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400">Municipal Routed</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>📍 Active District: Bangalore Central</span>
                  <span>System latency: 42ms</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* LIVE COMMUNITY REPORTS SECTION */}
        <section className="py-24 px-6 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-stone-900/10">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-4">
              Real-Time Activity Feed
            </div>
            <h2 className="civic-h2 text-3xl md:text-4xl mb-4">
              What's Happening in the Community
            </h2>
            <p className="civic-body text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Inspect current infrastructure tickets submitted by your neighbors. Upvote critical cases to escalate routing status on the city dashboard.
            </p>
          </div>

          {loadingIssues ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" style={{ width: "40px", height: "40px" }}></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {issues.map((issue) => (
                <div key={issue._id} className="civic-card flex flex-col p-6 h-full text-left relative">
                  
                  <div className="flex justify-between items-center gap-2 mb-4" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="category-badge">{issue.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getSeverityClass(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 line-clamp-1">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow mb-6 line-clamp-3 leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800/80 pt-4 mb-4 text-xs text-slate-500 dark:text-slate-400" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1rem" }}>
                    <div className="flex items-center gap-1" style={{ display: "flex", alignItems: "center" }}>
                      <span className="text-[14px]">📍</span>
                      <span className="truncate font-medium">{issue.location || "Coordinates Pinpoint"}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[11px]" style={{ display: "flex", alignItems: "center", marginTop: "0.25rem" }}>
                      <span>🗓️ Reported:</span>
                      <span>{formatDate(issue.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={`status-pill ${
                      issue.status === "Resolved" ? "status-resolved" :
                      issue.status === "In Progress" ? "status-in-progress" :
                      issue.status === "Rejected" ? "status-rejected" : "status-pending"
                    }`} style={{ display: "inline-flex", alignItems: "center" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        marginRight: "6px",
                        backgroundColor: 
                          issue.status === "Resolved" ? "#10B981" :
                          issue.status === "In Progress" ? "#3B82F6" :
                          issue.status === "Rejected" ? "#EF4444" : "#F59E0B"
                      }} />
                      {issue.status}
                    </span>

                    <button
                      className={`upvote-interactive ${issue.hasUpvoted ? "upvoted" : ""}`}
                      style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                      onClick={() => handleUpvote(issue._id)}
                      aria-label={`Upvote issue: ${issue.title}`}
                    >
                      <svg width="16" height="16" className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                      </svg>
                      <span>{issue.upvotes}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* HOW CIVICPULSE WORKS SECTION */}
        <section id="how-it-works" className="py-24 px-6 bg-slate-50/50 dark:bg-stone-900/10 border-t border-b border-slate-100 dark:border-slate-900" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-4">
                Platform Workflow
              </div>
              <h2 className="civic-h2 text-3xl md:text-4xl mb-4">
                The 3-Step Civic Lifecycle
              </h2>
              <p className="civic-body text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                CivicPulse establishes a closed-loop system between citizen reports, neighborhood prioritization, and direct city resolution.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="civic-card p-8 flex flex-col text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-lg mb-6" style={{ display: "flex", width: "48px", height: "48px", alignItems: "center", justifyContent: "center" }}>
                  01
                </div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-3">
                  Document & Pinpoint
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Spot a broken streetlight or major pothole. Snap a photo, choose a category, and place a precise location pin on our interactive map.
                </p>
              </div>

              {/* Step 2 */}
              <div className="civic-card p-8 flex flex-col text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-lg mb-6" style={{ display: "flex", width: "48px", height: "48px", alignItems: "center", justifyContent: "center" }}>
                  02
                </div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-3">
                  Community Prioritize
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Neighbors review the complaint. When citizens upvote an issue, it raises priority scores on the municipal control board for scheduling.
                </p>
              </div>

              {/* Step 3 */}
              <div className="civic-card p-8 flex flex-col text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-lg mb-6" style={{ display: "flex", width: "48px", height: "48px", alignItems: "center", justifyContent: "center" }}>
                  03
                </div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-3">
                  Direct Resolution
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Authorized departments review the issue details, dispatch municipal repair crews, update status, and close the loop with visual resolution proof.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EMPOWERING FEATURES SECTION */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 text-left flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-4 w-max">
                Platform Pillars
              </div>
              <h2 className="civic-h2 text-3xl md:text-4xl mb-6">
                Designed for Practical Civic Power
              </h2>
              <p className="civic-body text-slate-600 dark:text-slate-400 mb-6">
                No complex bells or AI placeholders. CivicPulse builds solid utilities designed to empower citizen engagement and ensure public accountability.
              </p>
              
              <ul className="space-y-4" style={{ paddingLeft: 0, listStyle: "none" }}>
                <li className="flex gap-3 items-start" style={{ display: "flex", alignItems: "flex-start" }}>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ display: "flex", width: "20px", height: "20px", alignItems: "center", justifyContent: "center", borderRadius: "50%", marginTop: "2px" }}>
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Geospatial Mapping</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pins are mapped precisely, ensuring crews know exactly where to travel.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start" style={{ display: "flex", alignItems: "flex-start" }}>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ display: "flex", width: "20px", height: "20px", alignItems: "center", justifyContent: "center", borderRadius: "50%", marginTop: "2px" }}>
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Audit Trails & Notifications</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Every status change triggers notification updates to tracking citizens.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start" style={{ display: "flex", alignItems: "flex-start" }}>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ display: "flex", width: "20px", height: "20px", alignItems: "center", justifyContent: "center", borderRadius: "50%", marginTop: "2px" }}>
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Citizen Engagement Points</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Earn gamified badging and impact points by maintaining local visibility.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              <div className="civic-card p-6 flex flex-col text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold mb-4" style={{ display: "flex", width: "40px", height: "40px", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                  🗺️
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Localized Heatmaps</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Identify high-density problem spots in your ward at a single glance with visual heat map overlays.
                </p>
              </div>

              <div className="civic-card p-6 flex flex-col text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold mb-4" style={{ display: "flex", width: "40px", height: "40px", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                  🛡️
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Spam & Duplicate Shield</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Radius deduplication alerts automatically cluster identical reports together to prevent municipal clutter.
                </p>
              </div>

              <div className="civic-card p-6 flex flex-col text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold mb-4" style={{ display: "flex", width: "40px", height: "40px", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                  🎖️
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Verified Badges</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Build platform authority and neighborhood badges based on successful issue verification tasks.
                </p>
              </div>

              <div className="civic-card p-6 flex flex-col text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold mb-4" style={{ display: "flex", width: "40px", height: "40px", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                  📊
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Detailed Statistics</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Export resolved report metrics to showcase civic improvements in neighborhood association meets.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <TestimonialCarousel />

        {/* FREQUENTLY ASKED QUESTIONS SECTION */}
        <section id="faqs" className="py-24 px-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-stone-900/5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-4">
                FAQ Support
              </div>
              <h2 className="civic-h2 text-3xl md:text-4xl mb-4">
                Common Inquiries
              </h2>
              <p className="civic-body text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                Find answers regarding platform routing operations, civic upvoting, and citizen profiles.
              </p>
            </div>

            <div className="flex flex-col" style={{ display: "flex", flexDirection: "column" }}>
              {faqData.map((faq, index) => (
                <div key={index} className="civic-faq-item">
                  <button
                    className="civic-faq-trigger"
                    style={{ border: "none", background: "none", padding: "10px 0" }}
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    aria-expanded={activeFaq === index}
                  >
                    <span>{faq.question}</span>
                    <span className={`text-emerald-600 dark:text-emerald-400 transition-transform duration-300 ${activeFaq === index ? "rotate-45" : ""}`}>
                      ＋
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="civic-faq-answer text-left"
                      >
                        <p className="text-slate-600 dark:text-slate-400" style={{ margin: 0 }}>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

export default Home;
