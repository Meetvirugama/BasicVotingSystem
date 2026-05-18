import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, TrendingUp, Trophy } from "lucide-react";
import Coin from "../components/Coin";

const VerificationPage = () => {
  const { googleLogin, error } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Left Column: Branding / Illustration */}
      <div className="md:flex-1 bg-gradient-to-br from-primary to-secondary p-10 md:p-20 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-display font-black text-primary text-xl shadow-xl">
              CP
            </div>
            <span className="text-3xl font-display font-black text-white tracking-tight">CrowdPulse</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight mb-6">
            Predict.<br />Earn.<br />Compete.
          </h1>
          <p className="text-white/80 font-medium text-lg max-w-md leading-relaxed">
            Join the ultimate virtual economy. Complete tasks to earn coins, predict outcomes of live events, and climb the global leaderboards.
          </p>
        </div>

        <div className="relative z-10 hidden md:flex gap-4">
          <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <TrendingUp className="text-success w-6 h-6" />
            <span className="text-white font-bold text-sm">Live Odds</span>
          </div>
          <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <Trophy className="text-warning w-6 h-6" />
            <span className="text-white font-bold text-sm">Leaderboards</span>
          </div>
          <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <ShieldCheck className="text-primary-light w-6 h-6" />
            <span className="text-white font-bold text-sm">Fair Play Engine</span>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="md:flex-1 flex flex-col justify-center items-center p-10 relative bg-white dark:bg-dark-800">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Coin size="xl" className="animate-bounce" />
                <div className="absolute -inset-4 bg-warning/20 rounded-full blur-xl -z-10"></div>
              </div>
            </div>
            <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2">Welcome to the Market</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Sign in to claim your daily reward.</p>
          </div>

          <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-3xl p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={googleLogin}
                onError={() => console.log("Login Failed")}
                useOneTap
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-center text-sm font-semibold animate-shake">
                {error}
              </div>
            )}
            
            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-slate-200 dark:border-dark-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Secure Access Only</span>
              <div className="flex-grow border-t border-slate-200 dark:border-dark-700"></div>
            </div>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
              By continuing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. This is a virtual economy platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
