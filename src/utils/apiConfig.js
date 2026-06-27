/**
 * Centralized API configuration for CivicPulse frontend.
 * All API calls should use API_BASE_URL instead of hardcoding http://localhost:5000.
 * In production, set REACT_APP_API_URL to your deployed backend URL.
 */

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

export default API_BASE_URL;
