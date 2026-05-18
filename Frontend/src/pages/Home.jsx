import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, PlusCircle, ShieldCheck, Trophy, Target, TrendingUp, Search, Compass, Gamepad2, Cpu, Play, Globe } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PollCard from "../components/PollCard";
import Coin from "../components/Coin";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await api.get("/polls");
        if (data.success) {
          setPolls(data.polls);
        }
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="mb-10 bg-gradient-to-br from-primary to-secondary rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-display font-black mb-2 tracking-tight">
              Welcome back, {user?.username || "Guest"}! 👋
            </h1>
            <p className="text-white/80 font-medium text-lg max-w-lg">
              You're currently a <strong className="text-white uppercase tracking-wider">{user?.level || "Beginner"}</strong> predictor. Join more polls to level up!
            </p>
          </div>
          
          <div className="flex gap-4 bg-black/20 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <div className="text-center px-4 border-r border-white/10">
              <div className="flex items-center justify-center gap-2 text-warning mb-1">
                <Flame className="w-5 h-5 fill-warning/50" />
                <span className="font-bold text-xl">{user?.checkInStreak || 1}</span>
              </div>
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Day Streak</span>
            </div>
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Coin size="sm" />
                <span className="font-bold text-xl">{user?.coinBalance || 0}</span>
              </div>
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Balance</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 mt-8">
          <Link to="/create" className="bg-white text-primary hover:bg-slate-50 px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Create Poll
          </Link>
          <Link to="/tasks" className="bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Earn Coins
          </Link>
        </div>
      </div>

      {/* Trending Predictions Section */}
      <div className="mb-8">
        
        {/* Marketplace Header & Searchbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="text-primary w-6 h-6" /> Predictions Marketplace
          </h2>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search active predictions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/50 text-slate-900 dark:text-white transition-all shadow-sm"
              />
            </div>
            {(searchQuery || selectedCategory !== "All") && (
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="text-xs font-black text-primary hover:underline whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Tags Filter Tabs */}
        {(() => {
          const categoryMeta = {
            All: { icon: Compass, activeBg: "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-indigo-500/20" },
            Esports: { icon: Gamepad2, activeBg: "bg-violet-600 dark:bg-violet-500 text-white border-violet-600 dark:border-violet-500 shadow-violet-500/20" },
            Sports: { icon: Trophy, activeBg: "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-emerald-500/20" },
            Technology: { icon: Cpu, activeBg: "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-blue-500/20" },
            YouTube: { icon: Play, activeBg: "bg-rose-600 dark:bg-rose-500 text-white border-rose-600 dark:border-rose-500 shadow-rose-500/20" },
            Politics: { icon: Globe, activeBg: "bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-500 shadow-amber-500/20" }
          };

          const getCategoryCount = (catName) => {
            if (catName === "All") return polls.length;
            return polls.filter(p => p.category?.name && p.category.name.toLowerCase() === catName.toLowerCase()).length;
          };

          return (
            <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
              {["All", "Esports", "Sports", "Technology", "YouTube", "Politics"].map((catName) => {
                const isSelected = selectedCategory === catName;
                const meta = categoryMeta[catName] || categoryMeta.All;
                const Icon = meta.icon;
                const count = getCategoryCount(catName);

                 return (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(catName)}
                    className={`h-9 px-4 rounded-full text-[11px] font-black transition-all flex items-center gap-2 whitespace-nowrap border active:scale-95 hover:scale-102 ${
                      isSelected
                        ? `${meta.activeBg} shadow-md scale-102`
                        : "bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-dark-700 hover:border-slate-300 dark:hover:border-dark-600 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                    <span>{catName}</span>
                    <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                      isSelected 
                        ? "bg-white/20 text-white" 
                        : "bg-slate-100 dark:bg-dark-900 text-slate-500 dark:text-slate-400 border border-slate-200/20 dark:border-dark-700/20"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {loading ? (
          <div className="flex justify-center items-center h-48">
             <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          (() => {
            const filteredPolls = polls.filter((poll) => {
              const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));
              const matchesCategory = selectedCategory === "All" || 
                (poll.category?.name && poll.category.name.toLowerCase() === selectedCategory.toLowerCase());
              return matchesSearch && matchesCategory;
            });

            if (filteredPolls.length === 0) {
              return (
                <div className="text-center py-16 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-[2rem] shadow-sm">
                  <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No Active Predictions Found</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    We couldn't find any results matching your filters. Try checking other categories or clearing your search.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredPolls.map((poll, index) => (
                    <PollCard key={poll.id} poll={poll} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            );
          })()
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Win Rate", value: "68%", icon: Target, color: "text-success", bg: "bg-success/10" },
          { label: "Reputation", value: user?.reputationScore || "500", icon: Trophy, color: "text-warning", bg: "bg-warning/10" },
          { label: "Polls Created", value: "3", icon: PlusCircle, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Earned", value: "+1450", icon: ShieldCheck, color: "text-secondary", bg: "bg-secondary/10" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-dark-800 p-5 rounded-3xl border border-slate-200 dark:border-dark-700 flex items-center gap-4 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default Home;
