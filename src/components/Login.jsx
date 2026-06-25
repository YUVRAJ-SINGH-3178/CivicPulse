import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { motion } from "framer-motion";
import 'react-toastify/dist/ReactToastify.css';
import loginImage from "../assets/signup.png"; 

const Login = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen items-center justify-center font-inter relative dark:bg-gray-900 bg-gradient-to-br from-green-50 to-emerald-50/30">
      {/* Left Side - Image */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:w-1/2 justify-center items-center bg-transparent"
      >
        <motion.img
          src={loginImage}
          alt="Login Illustration"
          className="w-full h-[80vh] object-contain drop-shadow-2xl rounded-xl"
          animate={{
            y: [0, -25, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="md:w-1/2 w-full flex justify-center flex-col items-center"
      >
        <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-2xl border border-white/20">
          <SignIn 
            routing="hash" 
            redirectUrl="/user/dashboard"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-transparent shadow-none"
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center pt-6">
          <Link
            to="/"
            className="inline-block text-sm text-green-700 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
