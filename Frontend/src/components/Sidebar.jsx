import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, PlusCircle, Trophy, Settings, ShieldCheck } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user, updateUserFields } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState(null);

  const links = [
    { name: "Feed", path: "/dashboard", icon: Home },
    { name: "Tasks", path: "/tasks", icon: ShieldCheck },
    { name: "Create Poll", path: "/create", icon: PlusCircle },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "AI Autogen", path: "/admin/autogen", icon: Settings },
  ];

  const hasCheckedInToday = user?.lastCheckIn && new Date(user.lastCheckIn).toDateString() === new Date().toDateString();

  const handleClaimReward = async () => {
    if (hasCheckedInToday) return;
    setClaiming(true);
    try {
      const { data } = await api.post("/economy/check-in");
      if (data.success) {
        setClaimMessage({ type: 'success', text: data.message });
        updateUserFields({ 
          coinBalance: parseFloat(data.balance), 
          lastCheckIn: new Date().toISOString(),
          checkInStreak: data.streak
        });
      }
    } catch (err) {
      setClaimMessage({ type: 'error', text: err.response?.data?.error || "Check-in failed." });
    } finally {
      setClaiming(false);
      setTimeout(() => setClaimMessage(null), 3000);
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-dark-800 border-r border-slate-200 dark:border-dark-700 hidden md:flex flex-col shadow-sm z-10 transition-colors duration-300">
      <div className="p-4 flex-1">
        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${
                  isActive
                    ? "bg-primary/10 text-primary dark:text-primary-light shadow-sm border border-primary/20"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-100 dark:border-dark-700">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-4 rounded-2xl border border-primary/20">
          <h4 className="text-sm font-bold text-primary dark:text-primary-light mb-1">Daily Reward</h4>
          
          {claimMessage ? (
             <p className={`text-xs font-bold mb-3 ${claimMessage.type === 'success' ? 'text-success' : 'text-danger'}`}>
                {claimMessage.text}
             </p>
          ) : (
            <p className="text-xs text-primary/80 dark:text-primary-light/80 font-medium mb-3">Check in to earn free coins!</p>
          )}

          <button 
            onClick={handleClaimReward}
            disabled={claiming || hasCheckedInToday}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${
              hasCheckedInToday 
                ? 'bg-slate-100 dark:bg-dark-700 text-slate-400 dark:text-slate-500 shadow-none border border-slate-200 dark:border-dark-600 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark text-white shadow-primary/30 active:scale-95'
            }`}
          >
            {claiming ? "Claiming..." : (hasCheckedInToday ? "Claimed Today!" : "Claim Reward")}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
