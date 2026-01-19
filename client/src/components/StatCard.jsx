import React from "react";
import { motion } from "framer-motion";

const StatCard = ({
  label,
  value,
  icon,
  color = "indigo",
  trend = null, // { value: number, isUp: boolean }
  subtitle = null,
}) => {
  const colorClasses = {
    indigo: "text-indigo-600 bg-indigo-100",
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    red: "text-red-600 bg-red-100",
    yellow: "text-yellow-600 bg-yellow-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-3xl p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </span>
        {trend && (
          <span
            className={`text-sm font-medium flex items-center gap-1 ${
              trend.isUp ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isUp ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <p className="text-gray-500 text-sm font-medium mt-3">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color].split(" ")[0]}`}>
        {value}
      </p>

      {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
};

export default StatCard;
