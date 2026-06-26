import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { AlertCircle, FileText, CheckCircle, Clock } from "lucide-react";
import { API_BASE_URL } from "../utils/apiConfig";

const MyComplaints = () => {
  const [filter, setFilter] = useState("All");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/issues?clerkUserId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }
        const data = await response.json();
        setComplaints(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [userId]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-gradient-to-r from-amber-200/70 to-orange-100/70 text-amber-700 border border-amber-300";
      case "in progress":
        return "bg-gradient-to-r from-blue-200/70 to-cyan-100/70 text-blue-700 border border-cyan-300";
      case "resolved":
        return "bg-gradient-to-r from-emerald-200/70 to-green-100/70 text-emerald-700 border border-emerald-300";
      case "rejected":
        return "bg-gradient-to-r from-red-200/70 to-rose-100/70 text-red-700 border border-red-300";
      default:
        return "bg-gradient-to-r from-gray-200/70 to-slate-100/70 text-gray-700 border border-slate-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock className="w-4 h-4 mr-1.5" />;
      case "in progress": return <AlertCircle className="w-4 h-4 mr-1.5" />;
      case "resolved": return <CheckCircle className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  const filteredComplaints =
    filter === "All"
      ? complaints
      : complaints.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-slate-100 dark:from-gray-900 dark:via-emerald-950 dark:to-slate-900 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 w-80 h-80 rounded-full bg-emerald-300/10 blur-2xl" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-green-400/10 blur-2xl" />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10 max-w-5xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl shadow-emerald-500/20 mb-6 group transition-all duration-300 hover:scale-105">
            <FileText className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-4 tracking-tight">
            My Complaints
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Track the status of your reported civic issues and community impact.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {["All", "Pending", "In Progress", "Resolved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 shadow-sm
                ${filter === status 
                  ? "bg-emerald-600 text-white shadow-emerald-500/25 scale-105" 
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-red-200 dark:border-red-900/30 backdrop-blur-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No complaints found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {filter === "All" 
                ? "You haven't reported any civic issues yet. Help improve your community by reporting an issue."
                : `You don't have any complaints with the status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((item) => (
              <div 
                key={item._id} 
                className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/20 dark:shadow-black/20 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">
                  {item.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-grow line-clamp-3 mb-6">
                  {item.description}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center mt-auto">
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl">
                    <span className="text-lg mr-2">👍</span>
                    {item.upvotes || 0} Upvotes
                  </div>
                  {item.category && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
