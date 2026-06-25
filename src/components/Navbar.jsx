import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Switch from '../DarkModeToggle';
import { jwtDecode } from 'jwt-decode';
import { useAuth, useClerk } from '@clerk/clerk-react';
import logo from '../assets/logo.png';
import { Users, User, LogOut, Shield, LayoutDashboard, Menu, X, AlertTriangle, Map, Bell, Brain } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Complaint Update", message: "Your street light complaint moved to In Progress.", time: "2h ago", unread: true },
    { id: 2, title: "Impact Verified", message: "A neighbor verified your pothole report. +10 points!", time: "1d ago", unread: true },
    { id: 3, title: "Account Verified", message: "Your citizen profile setup was finalized.", time: "3d ago", unread: false }
  ]);
  const rightDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const { isSignedIn, signOut } = useAuth();
  const { openSignIn, openSignUp } = useClerk();
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const handleNav = (cb) => {
    setMobileMenuOpen(false);
    if (cb) cb();
  };

  const handleLogout = async () => {
    if (signOut) {
      await signOut(); 
    }
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage-update"));
    setRightDropdownOpen(false);
    navigate("/");
  };

  const handleSOSClick = () => {
    navigate('/resources');
  };

  const markNotificationRead = (event, id) => {
    event.stopPropagation();
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  const removeNotification = (event, id) => {
    event.stopPropagation();
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  const markAllNotificationsRead = (event) => {
    event.stopPropagation();
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rightDropdownRef.current && !rightDropdownRef.current.contains(event.target)) {
        setRightDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onClick = (e) => {
      if (e.target.closest('#mobile-nav-panel') || e.target.closest('#mobile-nav-toggle')) return;
      setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobileMenuOpen]);

  const token = localStorage.getItem('token');
  let isAdmin = false;

  try {
    if (token) {
      const decoded = jwtDecode(token);
      isAdmin = decoded.role === 'admin';
    }
  } catch (err) {
    console.error('Invalid token');
  }

  const authLinks = (isSignedIn || token) ? [
    {
      title: "Dashboard",
      href: "/user/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Report Issue",
      href: "/report-issue",
      icon: AlertTriangle,
    }
  ] : [];

  const baseLinks = [
    {
      title: "Community Feed",          
      href: "/community-feed",
      icon: Users,        
    },
    {
      title: "Issue Map",
      href: "/user-map",
      icon: Map,
    },
    {
      title: "Insights",
      href: "/insights",
      icon: Brain,
    }
  ];

  const navLinks = [...authLinks, ...baseLinks];

  return (
    <div className="fixed left-0 right-0 top-4 z-50 w-full px-4 lg:px-6 transition-all duration-500">
      <header className="mx-auto max-w-7xl rounded-2xl border border-gray-200/50 bg-white/82 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl dark:border-gray-800/70 dark:bg-slate-950/88 dark:shadow-[0_8px_30px_rgb(0,0,0,0.18)]">
        <div className="px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
          
          <div className="flex items-center">
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/'); }} 
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <img 
                  src={logo} 
                  alt="CivicPulse logo" 
                  className="h-10 w-auto transition-transform duration-300 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal dark:brightness-0 dark:invert" 
                />
                <div className="absolute inset-0 bg-green-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((navItem) => {
              const Icon = navItem.icon;
              const isActive = location.pathname === navItem.href;
              return (
                <Link
                  key={navItem.title}
                  to={navItem.href}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'text-green-700 dark:text-green-300 bg-white/60 dark:bg-white/10 backdrop-blur-lg border border-green-200/50 dark:border-green-700/50'
                      : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 dark:from-green-500/20 dark:to-emerald-500/20 rounded-xl" />
                  )}
                  <Icon className={`w-4 h-4 transition-transform duration-300 relative z-10 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="relative z-10">{navItem.title}</span>
                </Link>
              );
            })}
          </nav>

          <button
            id="mobile-nav-toggle"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-300 group"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Menu className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
          </button>

          <div className="hidden lg:flex items-center gap-5">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700 transition-colors duration-300 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-400 dark:hover:bg-green-900/50"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Alerts & Status</h3>
                    <button onClick={() => setNotificationsOpen(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div
                          key={notification.id}
                          onClick={(event) => markNotificationRead(event, notification.id)}
                          className={`relative cursor-pointer p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/70 ${
                            index !== notifications.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                          } ${notification.unread ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}
                        >
                          <button
                            onClick={(event) => removeNotification(event, notification.id)}
                            className="absolute right-2.5 top-2.5 rounded-full p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            aria-label={`Remove ${notification.title}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex items-start gap-2.5 pr-5">
                            {notification.unread && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-600" />}
                            <div>
                              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{notification.title}</h4>
                              <p className="mt-1 text-xs leading-normal text-slate-500 dark:text-slate-400">{notification.message}</p>
                              <span className="mt-2 block text-[10px] text-slate-400">{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500">No active notifications</div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
                      <button onClick={markAllNotificationsRead} className="w-full rounded-lg py-1 text-xs font-black text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-300">
              <Switch />
            </div>

            <div className="relative" ref={rightDropdownRef}>
              <button
                onClick={() => setRightDropdownOpen(!rightDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-green-200 dark:hover:shadow-green-900/50 transform hover:scale-105 transition-all duration-300"
                aria-label="Open user menu"
              >
                <User className="h-5 w-5" />
              </button>

              {rightDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-green-100 dark:border-green-900/20 z-50 overflow-hidden">
                  <div className="p-2">
                    

                    
                    {!(isSignedIn || token) ? (
                      <button
                        onClick={() => { setRightDropdownOpen(false); openSignIn(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all duration-200 group mt-2"
                      >
                        <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span>Login</span>
                      </button>
                    ) : (
                      <>
                        <div className="border-t border-green-100 dark:border-green-900/20 my-2"></div>
                        
                        <button
                          onClick={() => { setRightDropdownOpen(false); navigate('/profile'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 rounded-xl transition-all duration-200 group"
                        >
                          <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          <span>Profile</span>
                        </button>
                        
                        <button
                          onClick={() => { setRightDropdownOpen(false); navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 rounded-xl transition-all duration-200 group"
                        >
                          {isAdmin ? (
                            <Shield className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          ) : (
                            <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          )}
                          <span>Dashboard</span>
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-white hover:bg-gradient-to-r from-red-500 to-red-600 rounded-xl transition-all duration-200 group mt-2"
                        >
                          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          <div className="lg:hidden fixed inset-x-0 top-0 z-50">
            <nav 
              id="mobile-nav-panel" 
              className="flex flex-col w-full min-h-screen bg-white dark:bg-slate-950 pt-20 px-6 pb-6"
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-300"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5 text-green-600 dark:text-green-400" />
              </button>

              <div className="space-y-2 mb-8">
                {navLinks.map((navItem) => {
                  const Icon = navItem.icon;
                  const isActive = location.pathname === navItem.href;
                  return (
                    <Link 
                      key={navItem.title}
                      to={navItem.href}
                      onClick={() => handleNav()}
                      className={`flex items-center gap-4 px-4 py-4 text-lg font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? 'text-green-700 dark:text-green-300 bg-white/60 dark:bg-white/10 backdrop-blur-lg border border-green-200/50 dark:border-green-700/50 shadow-lg shadow-green-100/50 dark:shadow-green-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 dark:from-green-500/20 dark:to-emerald-500/20 rounded-xl" />
                      )}
                      <Icon className={`w-5 h-5 transition-transform duration-300 relative z-10 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <span className="relative z-10">{navItem.title}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-3 flex-1">
                {(isSignedIn || token) && (
                  <button
                    onClick={() => setNotificationsOpen((open) => !open)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-base font-medium text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-xl transition-all duration-300 group"
                  >
                    <span className="flex items-center gap-4">
                      <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>Notifications</span>
                    </span>
                    {unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}

                {notificationsOpen && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left dark:border-slate-800 dark:bg-slate-950">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={(event) => markNotificationRead(event, notification.id)}
                          className={`block w-full border-b border-slate-100 p-4 text-left last:border-b-0 dark:border-slate-800 ${
                            notification.unread ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {notification.unread && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                            <div>
                              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{notification.title}</h4>
                              <p className="mt-1 text-xs leading-normal text-slate-500 dark:text-slate-400">{notification.message}</p>
                              <span className="mt-2 block text-[10px] text-slate-400">{notification.time}</span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500">No active notifications</div>
                    )}
                  </div>
                )}

                {(isSignedIn || token) && (
                  <>
                    <button
                      onClick={() => handleNav(() => navigate('/profile'))}
                      className="w-full flex items-center gap-4 px-6 py-4 text-base font-medium text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-xl transition-all duration-300 group"
                    >
                      <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => handleNav(() => navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard'))}
                      className="w-full flex items-center gap-4 px-6 py-4 text-base font-medium text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-xl transition-all duration-300 group"
                    >
                      {isAdmin ? (
                        <Shield className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      )}
                      <span>Dashboard</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleNav(handleSOSClick)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-base font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 group"
                >
                  <AlertTriangle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Emergency Resources</span>
                </button>

                {(isSignedIn || token) ? (
                  <button
                    onClick={() => handleNav(handleLogout)}
                    className="w-full flex items-center gap-4 px-6 py-4 text-base font-medium text-red-600 dark:text-red-400 hover:text-white hover:bg-gradient-to-r from-red-500 to-red-600 rounded-xl transition-all duration-300 group"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNav(() => openSignIn())}
                      className="w-full flex items-center gap-4 px-6 py-4 text-base font-medium text-gray-700 dark:text-gray-300 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/50 rounded-xl transition-all duration-300 group"
                    >
                      <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>Login</span>
                    </button>
                    
                    <button
                      onClick={() => handleNav(() => openSignUp())}
                      className="w-full flex items-center gap-4 px-6 py-4 text-base font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 group"
                    >
                      <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>Get Started</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center pt-6 mt-auto border-t border-green-100 dark:border-green-900/20">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/50">
                  <Switch />
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
      </header>
    </div>
  );
};

export default Navbar;
