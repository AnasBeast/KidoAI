import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({
  size = "md",
  color = "indigo",
  fullScreen = false,
  text = "Loading...",
  showText = true,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const colorClasses = {
    indigo: "border-indigo-600",
    blue: "border-blue-600",
    green: "border-green-600",
    red: "border-red-600",
    yellow: "border-yellow-600",
    purple: "border-purple-600",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-200 ${colorClasses[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {showText && (
        <motion.p
          className="text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton loading components for content placeholders
export const Skeleton = ({
  width = "w-full",
  height = "h-4",
  className = "",
  rounded = "rounded",
}) => (
  <motion.div
    className={`${width} ${height} bg-gray-200 ${rounded} ${className}`}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  />
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="w-96 p-6 bg-white rounded-2xl shadow-xl">
    <div className="flex flex-col items-center">
      <Skeleton
        width="w-32"
        height="h-32"
        rounded="rounded-full"
        className="mb-4"
      />
      <Skeleton width="w-40" height="h-6" className="mb-2" />
      <Skeleton width="w-48" height="h-4" className="mb-4" />
      <Skeleton
        width="w-24"
        height="h-10"
        rounded="rounded-full"
        className="mb-4"
      />
      <div className="flex gap-4">
        <Skeleton width="w-20" height="h-10" rounded="rounded-full" />
        <Skeleton width="w-20" height="h-10" rounded="rounded-full" />
      </div>
    </div>
  </div>
);

// Quiz skeleton
export const QuizSkeleton = () => (
  <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
    <Skeleton width="w-3/4" height="h-8" className="mb-6" />
    <div className="space-y-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height="h-12" rounded="rounded-lg" />
      ))}
    </div>
    <Skeleton height="h-10" rounded="rounded-md" />
  </div>
);

// Card skeleton
export const CardSkeleton = () => (
  <div className="p-4 bg-white rounded-lg shadow-lg">
    <Skeleton width="w-3/4" height="h-6" className="mb-2" />
    <Skeleton height="h-4" className="mb-4" />
    <Skeleton width="w-1/2" height="h-8" rounded="rounded-full" />
  </div>
);

// Stats skeleton
export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
        <Skeleton
          width="w-12"
          height="h-12"
          rounded="rounded-full"
          className="mx-auto mb-2"
        />
        <Skeleton width="w-20" height="h-4" className="mx-auto mb-2" />
        <Skeleton width="w-16" height="h-8" className="mx-auto" />
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
