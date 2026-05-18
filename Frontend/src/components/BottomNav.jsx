import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShieldCheck, PlusCircle, Trophy, User } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  const links = [
    { name: "Feed", path: "/dashboard", icon: Home },
    { name: "Tasks", path: "/tasks", icon: ShieldCheck },
    { name: "Create", path: "/create", icon: PlusCircle, isPrimary: true },
    { name: "Rank", path: "/leaderboard", icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-t border-slate-200 dark:border-dark-700 pb-safe z-50 transition-colors duration-300">
      <div className="flex justify-around items-center h-16 px-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          
          if (link.isPrimary) {
            return (
              <Link key={link.name} to={link.path} className="relative -top-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/40 border-4 border-white dark:border-dark-800 transition-transform active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive ? "text-primary dark:text-primary-light" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] font-bold tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
