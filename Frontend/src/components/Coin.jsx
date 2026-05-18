import React from "react";
import { motion } from "framer-motion";
import coinLogo from "../assets/coin_logo.jpg";

const Coin = ({ size = "md", className = "" }) => {
  const dimensions = {
    sm: "w-4 h-4 border",
    md: "w-5 h-5 border-2",
    lg: "w-8 h-8 border-2",
    xl: "w-12 h-12 border-3"
  };

  return (
    <motion.div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_6px_rgba(245,158,11,0.4)] border-amber-400 dark:border-amber-300 bg-slate-950 ${dimensions[size]} ${className}`}
      whileHover={{ rotateY: 180, scale: 1.15 }}
      transition={{ duration: 0.4 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <img 
        src={coinLogo} 
        alt="M Coin" 
        className="w-full h-full object-cover select-none pointer-events-none scale-105 brightness-135 contrast-125 saturate-110" 
      />
      <div className="absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]"></div>
    </motion.div>
  );
};

export default Coin;
