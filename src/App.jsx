import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { AnimatePresence } from 'framer-motion';

import Home from './Home';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import RequireAdmin from './components/auth/RequireAdmin';
import AdminDashboard from './Pages/AdminDashboard';
import Error404 from './components/Error404';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Feedback from "./Pages/Feedback";
import About from './Pages/About';
import Privacy from './Pages/Privacy';
import Terms from './Pages/Terms';
import ReportIssue from './Pages/ReportIssue';
import ServerError from './components/ServerError';
import NewIssue from './Pages/NewIssue';
import IssueDetail from './Pages/IssueDetail';
import UserDashboard from './Pages/UserDashboard';

import Profile from './Pages/Profile';

import Resources from './Pages/Resources';
import MyComplaints from './Pages/MyComplaints';


import ScrollToTopOnRouteChange from './components/ScrollToTopOnRouteChange';

import Analytics from './Pages/Analytics';
import Users from './Pages/Users';
import Documents from './Pages/Documents';
import Settings from './Pages/Settings';
import Notification from './Pages/Notification';

import UserMap from './Pages/UserMap';
import CommunityFeed from './Pages/CommunityFeed';
import PredictiveInsights from './Pages/PredictiveInsights';




const App = () => {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <ScrollToTopOnRouteChange/>
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white !border !border-gray-200 dark:!border-gray-700',
          duration: 4000,
          success: {
            iconTheme: { primary: '#10B981', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: 'white' },
          },
        }}
      />
          
      {!isAdminRoute && <Navbar />}

      <main className="min-h-screen">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Clerk Auth Routes */}
            <Route
              path="/sign-in/*"
              element={<SignIn routing="path" path="/sign-in" redirectUrl="/" />}
            />
            <Route
              path="/signup/*"
              element={<SignUp routing="path" path="/signup" redirectUrl="/" />}
            />

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/report-issue" element={<ReportIssue />} />

            <Route path="/issues/new" element={<NewIssue />} />
            <Route path="/issues/:id" element={<IssueDetail />} />


            <Route path="/profile" element={<Profile />} />


            <Route path='/user-map' element={<UserMap/>}/>
            <Route path='/community-feed' element={<CommunityFeed/>}/>
            <Route path='/insights' element={<PredictiveInsights/>}/>

            <Route path="/profile-setup" element={<Navigate to="/" replace />} />
            
            <Route path="/resources" element={<Resources />} />
            <Route path="/complaints" element={<MyComplaints />} />


            <Route path='/admin/analytics' element={<Analytics/>}/>
            <Route path='/admin/users' element={<Users/>}/>
            <Route path='/admin/documents' element={<Documents/>}/>
            <Route path='/admin/settings' element={<Settings/>}/>
            <Route path='/admin/notifications' element={<Notification/>}/>

            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PrivateRoute allowedRoles={['user', 'admin']}>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/dashboard"
              element={
                <PrivateRoute allowedRoles={['user', 'admin']}>
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            {/* Errors */}
            <Route path="/500" element={<ServerError />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isAdminRoute && <Footer />}

    </>
  );
};

export default App;
