import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./UserMap.css";
import L from "leaflet";
import { Globe, MapPin, ArrowLeft, Filter, Layers, AlertCircle, CheckCircle, Clock, Crosshair } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/apiConfig";

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case "low": return "#10B981";
    case "medium": return "#F59E0B";
    case "high": return "#F97316";
    case "critical": return "#EF4444";
    default: return "#3B82F6";
  }
};

const createCustomIcon = (color) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42" width="42" height="42">
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="7" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.24"/>
      </filter>
      <path filter="url(#shadow)" fill="${color}" d="M21 3C14.9 3 10 7.9 10 14c0 8.25 11 20 11 20s11-11.75 11-20C32 7.9 27.1 3 21 3z"/>
      <circle cx="21" cy="14" r="5.2" fill="white"/>
      <circle cx="21" cy="14" r="2.4" fill="${color}"/>
    </svg>`;
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: svgIcon,
    iconSize: [42, 42],
    iconAnchor: [21, 37],
    popupAnchor: [0, -38],
  });
};

function FlyToLocation({ position }) {
  const map = useMap();
  if (position) map.flyTo(position, 14, { duration: 1.5 });
  return null;
}

const statusClasses = {
  Pending: "text-amber-800 border-amber-200 bg-amber-50 dark:text-amber-300 dark:border-amber-800 dark:bg-amber-950/50",
  "In Progress": "text-blue-800 border-blue-200 bg-blue-50 dark:text-blue-300 dark:border-blue-800 dark:bg-blue-950/50",
  Resolved: "text-emerald-800 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/50",
  "Under Review": "text-purple-800 border-purple-200 bg-purple-50 dark:text-purple-300 dark:border-purple-800 dark:bg-purple-950/50",
};

const severityClasses = {
  Low: "text-emerald-800 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60",
  Medium: "text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60",
  High: "text-orange-800 bg-orange-100 dark:text-orange-300 dark:bg-orange-950/60",
  Critical: "text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-950/60",
};

export default function UserMap() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [mapView, setMapView] = useState("street");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/issues`);
        const data = await response.json();

        const parsedIssues = data.map(issue => {
          const hasCoordinates = Number.isFinite(Number(issue.latitude)) && Number.isFinite(Number(issue.longitude));
          const randomLat = 20.5937 + (Math.random() - 0.5) * 10;
          const randomLng = 78.9629 + (Math.random() - 0.5) * 10;

          return {
            ...issue,
            lat: hasCoordinates ? Number(issue.latitude) : randomLat,
            lng: hasCoordinates ? Number(issue.longitude) : randomLng,
            category: issue.category || "Other",
            severity: issue.severity || "Low",
            approximateLocation: !hasCoordinates,
          };
        });

        setIssues(parsedIssues);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const filteredIssues = issues.filter(
    (issue) =>
      (statusFilter === "All" || issue.status === statusFilter) &&
      (categoryFilter === "All" || issue.category === categoryFilter)
  );

  const totalReports = issues.length;
  const resolvedIssues = issues.filter(i => i.status === "Resolved").length;
  const pendingIssues = issues.filter(i => i.status === "Pending").length;
  const criticalIssues = issues.filter(i => i.severity === "Critical").length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8f4] px-4 py-20 text-slate-900 transition-colors duration-300 dark:bg-[#070b10] dark:text-slate-100 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-8rem] top-16 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-10 left-[-8rem] h-80 w-80 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-5">
        <header className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="group mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
            >
              <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
              Back to dashboard
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Crosshair className="h-3.5 w-3.5" />
              Issue map
            </div>
            <h1 className="mt-4 font-outfit text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              See where the city needs attention.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Filter open reports by status and category, then inspect each marker without losing the big-picture view.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[560px]">
            {[
              { label: "Reports", value: totalReports, icon: MapPin, tone: "text-emerald-600 dark:text-emerald-400" },
              { label: "Pending", value: pendingIssues, icon: Clock, tone: "text-amber-600 dark:text-amber-400" },
              { label: "Critical", value: criticalIssues, icon: AlertCircle, tone: "text-red-600 dark:text-red-400" },
              { label: "Resolved", value: resolvedIssues, icon: CheckCircle, tone: "text-blue-600 dark:text-blue-400" },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                <Icon className={`mb-3 h-5 w-5 ${tone}`} />
                <div className="text-2xl font-black text-slate-950 dark:text-white">{value}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 px-2 text-sm font-black text-emerald-700 dark:text-emerald-300">
                <Filter size={18} />
                Filters
              </div>
              <select
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-emerald-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Under Review">Under Review</option>
              </select>
              <select
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-emerald-700"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Pothole">Pothole</option>
                <option value="Waste">Waste</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Street Light">Street Light</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex w-full items-center gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950/80 sm:w-auto">
              <button
                onClick={() => setMapView("street")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition sm:flex-none ${
                  mapView === "street" ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300" : "text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200"
                }`}
              >
                <Layers size={16} /> Map
              </button>
              <button
                onClick={() => setMapView("satellite")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition sm:flex-none ${
                  mapView === "satellite" ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300" : "text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200"
                }`}
              >
                <Globe size={16} /> Satellite
              </button>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-2 shadow-2xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/30">
          {loading && (
            <div className="absolute inset-2 z-[500] flex items-center justify-center rounded-[1.5rem] bg-white/80 backdrop-blur-sm dark:bg-slate-950/70">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400" />
            </div>
          )}

          <div className="relative z-10 h-[68vh] min-h-[520px] overflow-hidden rounded-[1.5rem]">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url={
                  mapView === "satellite"
                    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution="&copy; OpenStreetMap contributors"
              />

              {filteredIssues.map((issue, idx) => (
                <Marker
                  key={issue._id || idx}
                  position={[issue.lat, issue.lng]}
                  icon={createCustomIcon(getSeverityColor(issue.severity))}
                  eventHandlers={{ click: () => setSelectedIssue(issue) }}
                >
                  <Popup className="civic-map-popup">
                    <div className="w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                      <div className="bg-slate-950 p-4 text-white dark:bg-emerald-500 dark:text-slate-950">
                        <h3 className="pr-4 text-lg font-black leading-tight">{issue.title}</h3>
                        <p className="mt-1 text-xs font-semibold opacity-70">
                          {new Date(issue.createdAt || Date.now()).toLocaleDateString()}
                          {issue.approximateLocation ? " • approximate pin" : ""}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{issue.description}</p>

                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${statusClasses[issue.status] || "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                            {issue.status || "Pending"}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ${severityClasses[issue.severity] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                            {issue.severity || "Unknown"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {issue.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {selectedIssue && <FlyToLocation position={[selectedIssue.lat, selectedIssue.lng]} />}
            </MapContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
