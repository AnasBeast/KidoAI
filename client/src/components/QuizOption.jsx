import React from "react";
import { motion } from "framer-motion";

const QuizOption = React.memo(
  ({ option, index, isSelected, showResult, onSelect, disabled = false }) => {
    const isCorrect = option.isCorrect;

    const getStyles = () => {
      if (showResult) {
        if (isCorrect) {
          return "border-success-500 bg-success-50 text-success-800";
        }
        if (isSelected && !isCorrect) {
          return "border-error-500 bg-error-50 text-error-800";
        }
        return "border-neutral-200 bg-neutral-50 text-neutral-500";
      }

      if (isSelected) {
        return "border-primary-600 bg-primary-50 text-primary-800 ring-2 ring-primary-200";
      }

      return "border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-50";
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
        w-full p-4 rounded-xl border-2 text-left transition-all duration-200
        flex items-center gap-3
        ${getStyles()}
        ${disabled || showResult ? "cursor-not-allowed" : "cursor-pointer"}
      `}
      >
        {/* Option indicator */}
        <span
          className={`
        w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all
        ${showResult && isCorrect ? "bg-success-500 text-white" : ""}
        ${showResult && isSelected && !isCorrect ? "bg-error-500 text-white" : ""}
        ${!showResult && isSelected ? "bg-primary-600 text-white" : ""}
        ${!showResult && !isSelected ? "bg-neutral-200 text-neutral-600" : ""}
        ${showResult && !isSelected && !isCorrect ? "bg-neutral-300 text-neutral-500" : ""}
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
            className="text-success-600 font-medium text-sm"
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
