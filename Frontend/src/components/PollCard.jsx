import React from "react";
import { Link } from "react-router-dom";
import { Timer, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import Badge from "./Badge";

const PollCard = ({ poll, index = 0 }) => {
  const sortedOptions = [...poll.options].sort((a, b) => b.totalStaked - a.totalStaked);
  const topOptions = sortedOptions.slice(0, 2);
  const totalPool = poll.options.reduce((acc, opt) => acc + parseFloat(opt.totalStaked), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      <Link to={`/polls/${poll.id}`} className="block">
        <div className="bg-white dark:bg-dark-800 border border-slate-200/80 dark:border-dark-700 hover:border-primary/40 rounded-2xl p-5 transition-all duration-300 shadow-md shadow-slate-100/40 dark:shadow-none hover:shadow-lg hover:shadow-primary/5 group hover:-translate-y-1">
          
          {/* Header Metadata */}
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{poll.category?.name || "General"}</Badge>
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px] font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>{totalPool} Pooled</span>
              </div>
            </div>
            <Badge variant="success" className="flex items-center gap-1 text-[10px] px-2 py-0.5 font-black uppercase tracking-wider">
              <Timer className="w-3 h-3" /> Active
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-base font-display font-bold text-slate-800 dark:text-slate-200 mb-4 group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {poll.title}
          </h3>
          
          {/* Candidate Options (Slimmed Down) */}
          <div className="space-y-2">
            {topOptions.map((opt) => {
              const pool = parseFloat(opt.totalStaked);
              const odds = pool > 0 ? ((totalPool * 0.9) / pool).toFixed(2) : "1.00";
              const percentage = totalPool > 0 ? ((pool / totalPool) * 100).toFixed(0) : 0;

              return (
                <div key={opt.id} className="relative bg-slate-50/50 dark:bg-dark-900/50 rounded-xl p-3 overflow-hidden border border-slate-100 dark:border-dark-800/80 transition-colors">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10" 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <div className="relative flex justify-between items-center z-10">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{opt.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{percentage}%</span>
                      <span className="flex items-center gap-0.5 text-xs font-black text-success bg-white dark:bg-dark-800 shadow-sm border border-slate-100 dark:border-dark-700 px-2 py-0.5 rounded-md">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {odds}x
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card Footer (Compact) */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-dark-700/60 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-secondary/80 to-primary/80 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                {poll.creator?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{poll.creator?.username || "Unknown"}</span>
            </div>
            {poll.hasPredicted ? (
              <span className="text-success bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1">
                ✨ Predicted
              </span>
            ) : (
              <button className="text-white bg-primary hover:bg-primary-dark px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md shadow-primary/10 transition-all flex items-center gap-1.5">
                Predict Now →
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PollCard;
