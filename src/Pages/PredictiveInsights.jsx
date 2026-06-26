import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Brain, Clock, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "../utils/apiConfig";

const buildFallbackInsight = (issues) => {
  const total = issues.length;
  const unresolved = issues.filter((issue) => issue.status !== "Resolved").length;
  const critical = issues.filter((issue) => issue.severity === "Critical" || issue.severity === "High").length;
  const categoryCounts = issues.reduce((counts, issue) => {
    const category = issue.category || "Other";
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "General civic reports";

  return {
    summary: total
      ? `${topCategory} is the strongest current signal, with ${unresolved} unresolved reports and ${critical} high-priority items needing attention.`
      : "No reports are available yet, so predictions will become useful after residents submit issues.",
    riskLevel: critical > 3 ? "High" : unresolved > 5 ? "Medium" : "Low",
    recommendations: total
      ? [
          `Prioritize field checks for ${topCategory}.`,
          "Watch unresolved reports older than 48 hours.",
          "Ask nearby residents to verify duplicate or urgent reports."
        ]
      : [
          "Collect more reports with photos or videos.",
          "Enable location permission for better map clustering.",
          "Use community verification to separate urgent issues from noise."
        ]
  };
};

const getGeminiInsight = async (issues) => {
  if (!process.env.REACT_APP_GEMINI_API_KEY) return null;

  const model = process.env.REACT_APP_GEMINI_MODEL || "gemini-1.5-flash";
  const compactIssues = issues.slice(0, 25).map((issue) => ({
    title: issue.title,
    category: issue.category,
    severity: issue.severity,
    status: issue.status,
    location: issue.location,
    createdAt: issue.createdAt
  }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Analyze these civic reports and return only JSON:
{
  "summary": "2 sentence predictive civic risk summary",
  "riskLevel": "Low, Medium, or High",
  "recommendations": ["three short operational recommendations"]
}

Reports:
${JSON.stringify(compactIssues)}`
        }]
      }]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Gemini insights failed");

  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Gemini returned no insight text");
  text = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(text);
};

const PredictiveInsights = () => {
  const [issues, setIssues] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("local");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/issues`);
        const data = response.ok ? await response.json() : [];
        setIssues(data);

        const fallback = buildFallbackInsight(data);
        try {
          const geminiInsight = await getGeminiInsight(data);
          setInsight(geminiInsight || fallback);
          setSource(geminiInsight ? "gemini" : "local");
        } catch (error) {
          console.warn("Predictive Gemini fallback used:", error);
          setInsight(fallback);
          setSource("local");
        }
      } catch (error) {
        console.warn("Could not fetch issues for insights:", error);
        setInsight(buildFallbackInsight([]));
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const stats = useMemo(() => {
    const unresolved = issues.filter((issue) => issue.status !== "Resolved").length;
    const highPriority = issues.filter((issue) => ["High", "Critical"].includes(issue.severity)).length;
    const verified = issues.reduce((total, issue) => total + (issue.upvotes || 0), 0);

    return [
      { label: "Open reports", value: unresolved, icon: Clock },
      { label: "High risk", value: highPriority, icon: AlertTriangle },
      { label: "Resident checks", value: verified, icon: Sparkles },
    ];
  }, [issues]);

  return (
    <div className="min-h-screen bg-[#f7f8f5] px-4 pb-12 pt-28 text-slate-900 dark:bg-[#080d12] dark:text-slate-100 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Brain className="h-3.5 w-3.5" />
            Predictive insights
          </div>
          <h1 className="mt-4 font-outfit text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Forecast civic risk before it piles up.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
            Uses current reports, severity, status, and resident verification patterns to surface operational priorities.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
              <Icon className="mb-4 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div className="text-3xl font-black text-slate-950 dark:text-white">{value}</div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400" />
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                  {source === "gemini" ? "Gemini-assisted forecast" : "Local fallback forecast"}
                </div>
                <h2 className="font-outfit text-2xl font-black text-slate-950 dark:text-white">
                  {insight?.riskLevel || "Low"} risk outlook
                </h2>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">{insight?.summary}</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950/60">
                <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100">
                  <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Recommended action
                </div>
                <div className="space-y-3">
                  {(insight?.recommendations || []).map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PredictiveInsights;
