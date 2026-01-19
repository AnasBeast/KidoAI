import React from "react";
import { motion } from "framer-motion";

const QuizOption = React.memo(
  ({ option, index, isSelected, showResult, onSelect, disabled = false }) => {
    const isCorrect = option.isCorrect;

    const getStyles = () => {
      if (showResult) {
        if (isCorrect) {
          return "border-green-500 bg-green-50 text-green-800";
        }
        if (isSelected && !isCorrect) {
          return "border-red-500 bg-red-50 text-red-800";
        }
        return "border-gray-200 bg-gray-50 text-gray-500";
      }

      if (isSelected) {
        return "border-indigo-600 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-200";
      }

      return "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";
    };

    return (
      <motion.button
        type="button"
        onClick={() => !disabled && !showResult && onSelect(option.id)}
        disabled={disabled || showResult}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 * index }}
        whileHover={!disabled && !showResult ? { scale: 1.01 } : {}}
        whileTap={!disabled && !showResult ? { scale: 0.99 } : {}}
        className={`
        w-full p-4 rounded-lg border-2 text-left transition-all duration-200
        flex items-center gap-3
        ${getStyles()}
        ${disabled || showResult ? "cursor-not-allowed" : "cursor-pointer"}
      `}
      >
        {/* Option indicator */}
        <span
          className={`
        w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
        ${showResult && isCorrect ? "bg-green-500 text-white" : ""}
        ${showResult && isSelected && !isCorrect ? "bg-red-500 text-white" : ""}
        ${!showResult && isSelected ? "bg-indigo-600 text-white" : ""}
        ${!showResult && !isSelected ? "bg-gray-200 text-gray-600" : ""}
        ${showResult && !isSelected && !isCorrect ? "bg-gray-300 text-gray-500" : ""}
      `}
        >
          {showResult
            ? isCorrect
              ? "✓"
              : isSelected
                ? "✕"
                : String.fromCharCode(65 + index)
            : String.fromCharCode(65 + index)}
        </span>

        {/* Option text */}
        <span className="flex-1 font-medium">{option.text}</span>

        {/* Result indicator */}
        {showResult && isCorrect && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-green-600 font-medium text-sm"
          >
            Correct!
          </motion.span>
        )}
      </motion.button>
    );
  },
);

QuizOption.displayName = "QuizOption";

export default QuizOption;
