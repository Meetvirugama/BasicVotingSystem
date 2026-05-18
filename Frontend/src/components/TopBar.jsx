import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  User as UserIcon, 
  Moon, 
  Sun, 
  LogOut, 
  Coins, 
  CheckCheck, 
  Trophy, 
  ShieldCheck, 
  Calendar,
  Sparkles
} from "lucide-react";
import Coin from "./Coin";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const TopBar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [notificationList, setNotificationList] = useState([
    {
      id: 1,
      title: "Daily Check-in Claimed!",
      description: "You earned 100 free coins. Keep up your streak!",
      time: "2 hours ago",
      icon: Calendar,
      color: "text-amber-500 bg-amber-500/10",
      read: false
    },
    {
      id: 2,
      title: "New Reputation Task",
      description: "Earn 50 coins by verifying your profile details.",
      time: "5 hours ago",
      icon: ShieldCheck,
      color: "text-primary bg-primary/10",
      read: false
    },
    {
      id: 3,
      title: "Leaderboard Alert!",
      description: "You just broke into the Top 10% this week. Keep predicting!",
      time: "1 day ago",
      icon: Trophy,
      color: "text-emerald-500 bg-emerald-500/10",
      read: false
    }
  ]);

  const handleMarkAllRead = () => {
    setNotificationList(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleToggleNotifications = () => {
    setShowNotifications(prev => !prev);
    setShowUserMenu(false);
  };

  const handleToggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-700 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-display font-bold text-white shadow-lg shadow-primary/30">
          CP
        </div>
        <span className="text-xl font-display font-bold hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          CrowdPulse
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700 transition"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Coin Balance (Static View) */}
        <div className="flex items-center gap-2 bg-warning/10 dark:bg-warning/20 px-3 py-1.5 rounded-full border border-warning/20">
          <Coin size="sm" />
          <span className="font-bold text-amber-600 dark:text-warning text-sm">
            {user?.coinBalance || "0"}
          </span>
        </div>

        {/* Dynamic Notification Center */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={handleToggleNotifications}
            className={`relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors ${showNotifications ? 'bg-slate-100 dark:bg-dark-700 text-primary' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-white dark:border-dark-800 animate-in zoom-in">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 dark:bg-dark-800/95 backdrop-blur-lg border border-slate-200 dark:border-dark-700 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-3 duration-255">
              <div className="p-4 border-b border-slate-100 dark:border-dark-700 flex justify-between items-center bg-slate-50/50 dark:bg-dark-900/20">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black">
                      {unreadCount} New
                    </span>
                  )}
                </h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs font-black text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-dark-700">
                {notificationList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No new alerts.
                  </div>
                ) : (
                  notificationList.map(item => {
                    const ItemIcon = item.icon;
                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 hover:bg-slate-50 dark:hover:bg-dark-900/40 transition-colors flex gap-3 ${!item.read ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                      >
                        <div className={`p-2 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                          <ItemIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h5 className={`text-sm font-bold leading-tight ${item.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                              {item.title}
                            </h5>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{item.description}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block pt-1">{item.time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={handleToggleUserMenu}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="text-right hidden md:block select-none">
              <div className="text-sm font-black text-slate-800 dark:text-slate-200">{user?.username || "Guest"}</div>
              <div className="text-xs text-primary dark:text-primary-light font-black uppercase tracking-wider">{user?.level || "Beginner"}</div>
            </div>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showUserMenu ? 'bg-primary text-white scale-95 shadow-md shadow-primary/30' : 'bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-600'}`}>
              <UserIcon className="w-5 h-5" />
            </div>
          </button>

          {/* User Profile Dropdown Card */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-dark-800/95 backdrop-blur-lg border border-slate-200 dark:border-dark-700 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-3 duration-255 p-6">
              
              {/* Profile Card Header */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-dark-700">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/20 mb-3">
                  {user?.username ? user.username.substring(0, 2).toUpperCase() : "GU"}
                </div>
                <h4 className="font-display font-black text-slate-900 dark:text-white text-lg">{user?.username || "Guest User"}</h4>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light uppercase tracking-wider mt-1.5">
                  <Sparkles className="w-3 h-3" /> {user?.level || "Beginner"}
                </span>
              </div>

              {/* Account Stats Info */}
              <div className="py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Coin Balance</span>
                  <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-warning text-sm">
                    <Coins className="w-4 h-4 text-warning" />
                    {user?.coinBalance || "0"}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reputation Score</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">{user?.reputationScore ?? 0}</span>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-dark-700">
                <button 
                  onClick={logout}
                  className="w-full py-3 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
