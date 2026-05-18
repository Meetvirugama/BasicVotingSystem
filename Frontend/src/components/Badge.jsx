import React from "react";

const Badge = ({ children, variant = "primary", className = "" }) => {
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-amber-600 dark:text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    neutral: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-dark-700 dark:text-slate-300 dark:border-dark-600"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
