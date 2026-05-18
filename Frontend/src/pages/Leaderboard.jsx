import React, { useEffect, useState } from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("coins"); // coins, accuracy, reputation

  useEffect(() => {
    // Mock data since we don't have dedicated leaderboard API endpoints yet
    setLeaders([
      { id: 1, username: "CryptoKing", coinBalance: 15400, accuracy: 82, reputation: 1200 },
      { id: 2, username: "MeetVirugama", coinBalance: 12000, accuracy: 75, reputation: 950 },
      { id: 3, username: "PredictionPro", coinBalance: 9800, accuracy: 68, reputation: 800 },
      { id: 4, username: "AlphaVoter", coinBalance: 7500, accuracy: 60, reputation: 600 },
      { id: 5, username: "TaskMaster", coinBalance: 4200, accuracy: 55, reputation: 500 },
    ]);
    setLoading(false);
  }, []);

  const getMetric = (user) => {
    if (!user) return "";
    if (activeTab === "coins") return `${user.coinBalance || 0} Coins`;
    if (activeTab === "accuracy") return `${user.accuracy || 0}% Win Rate`;
    return `${user.reputation || 0} Rep`;
  };

  const getSortedLeaders = () => {
    return [...leaders].sort((a, b) => {
      if (activeTab === "coins") return b.coinBalance - a.coinBalance;
      if (activeTab === "accuracy") return b.accuracy - a.accuracy;
      return b.reputation - a.reputation;
    });
  };

  const sortedLeaders = getSortedLeaders();
  const topThree = sortedLeaders.slice(0, 3);
  const rest = sortedLeaders.slice(3);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white mb-4 flex justify-center items-center gap-3">
          <Trophy className="text-warning w-10 h-10" /> Global Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
          Compete against the community. Earn coins, make accurate predictions, and build your reputation to reach the top.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-12">
        {[
          { id: "coins", label: "Top Wealth" },
          { id: "accuracy", label: "Top Accuracy" },
          { id: "reputation", label: "Top Reputation" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-sm ${
              activeTab === tab.id 
                ? "bg-primary text-white shadow-primary/30 scale-105" 
                : "bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Podium (Top 3) */}
      <div className="flex justify-center items-end gap-2 md:gap-6 mb-12 h-64 px-4">
        {/* 2nd Place */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-1/3 max-w-[140px]">
          <div className="relative mb-2">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-dark-700 border-4 border-slate-300 dark:border-dark-600 flex items-center justify-center font-bold text-xl text-slate-500">{topThree[1]?.username?.charAt(0)}</div>
            <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black border-2 border-white dark:border-dark-800">2</div>
          </div>
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate w-full text-center">{topThree[1]?.username}</p>
          <p className="text-xs font-bold text-primary mb-2">{getMetric(topThree[1])}</p>
          <div className="w-full h-24 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-dark-700 dark:to-dark-600 rounded-t-2xl border-t border-slate-300 dark:border-dark-500 flex justify-center pt-4">
            <Medal className="text-slate-400 w-8 h-8" />
          </div>
        </motion.div>

        {/* 1st Place */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center w-1/3 max-w-[160px]">
          <Crown className="text-warning w-8 h-8 mb-2 animate-bounce" />
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-full bg-warning/20 border-4 border-warning flex items-center justify-center font-bold text-2xl text-amber-600 dark:text-warning shadow-lg shadow-warning/30">{topThree[0]?.username?.charAt(0)}</div>
            <div className="absolute -bottom-2 -right-2 bg-warning text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black border-2 border-white dark:border-dark-800">1</div>
          </div>
          <p className="font-black text-slate-900 dark:text-white text-base truncate w-full text-center">{topThree[0]?.username}</p>
          <p className="text-sm font-bold text-primary mb-2">{getMetric(topThree[0])}</p>
          <div className="w-full h-32 bg-gradient-to-t from-warning/20 to-warning/10 dark:from-warning/30 dark:to-warning/10 rounded-t-3xl border-t border-warning flex justify-center pt-4">
            <Trophy className="text-warning w-10 h-10" />
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center w-1/3 max-w-[140px]">
          <div className="relative mb-2">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 border-4 border-orange-300 dark:border-orange-700 flex items-center justify-center font-bold text-xl text-orange-600">{topThree[2]?.username?.charAt(0)}</div>
            <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black border-2 border-white dark:border-dark-800">3</div>
          </div>
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate w-full text-center">{topThree[2]?.username}</p>
          <p className="text-xs font-bold text-primary mb-2">{getMetric(topThree[2])}</p>
          <div className="w-full h-20 bg-gradient-to-t from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/10 rounded-t-2xl border-t border-orange-200 dark:border-orange-800 flex justify-center pt-4">
            <Medal className="text-orange-400 w-8 h-8" />
          </div>
        </motion.div>
      </div>

      {/* List (4th onwards) */}
      <div className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-none">
        {rest.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
            <div className="flex items-center gap-4">
              <span className="w-8 text-center font-bold text-slate-400">{index + 4}</span>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                {user.username.charAt(0)}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">{user.username}</span>
            </div>
            <div className="font-black text-primary bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20">
              {getMetric(user)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
