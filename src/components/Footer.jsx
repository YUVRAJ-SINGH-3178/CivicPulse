import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import logoF from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 select-none border-t border-slate-200/70 bg-white/90 text-slate-500 dark:border-slate-800/80 dark:bg-[#0b0f0e] dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-4 text-left md:grid-cols-[1.25fr_2fr_auto] md:gap-6">
          <div className="space-y-1.5">
            <div
              className="flex w-max cursor-pointer items-center gap-2"
              onClick={() => navigate("/")}
            >
              <img src={logoF} alt="CivicPulse Logo" className="h-auto w-6 object-contain" />
              <span className="font-outfit text-base font-bold tracking-tight text-slate-900 dark:text-white">
                CivicPulse
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-500">
              Local reports, transparent updates, calmer neighborhoods.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
            <Link to="/" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">Home</Link>
            <Link to={isSignedIn ? "/user-map" : "/signup"} className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">Map</Link>
            <Link to={isSignedIn ? "/community-feed" : "/signup"} className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">Feed</Link>
            <Link to={isSignedIn ? "/report-issue" : "/signup"} className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">Report</Link>
            <Link to={isSignedIn ? "/profile" : "/signup"} className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">Profile</Link>
            <Link to="/privacy" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">Terms</Link>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-600 md:text-right">
            © {currentYear} CivicPulse
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
