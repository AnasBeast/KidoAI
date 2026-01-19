import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";
import { useToast } from "../components/Toast";
import { quizAPI, getErrorMessage } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import QuizOption from "../components/QuizOption";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Target,
  Flame,
  RotateCcw,
  CheckCircle,
  XCircle,
  Brain,
} from "lucide-react";

const QuizQuestion = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const toast = useToast();

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getRandomQuestion();
      const data = response.data;

      if (data.error !== "true" && data.text) {
        setQuestion(data.text);
        setAnswers(data.options || []);
      } else {
        toast.error("Failed to load question");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleAnswerSelect = (answerId) => {
    if (!showResult) {
      setSelectedAnswer(answerId);
    }
  };

  const isCorrect = answers.find(
    (answer) => answer.id === selectedAnswer,
  )?.isCorrect;

  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    setSubmitting(true);
    setShowResult(true);

    try {
      await quizAPI.submitAnswer({
        isValid: isCorrect,
        answer: answers.find((answer) => answer.id === selectedAnswer)?.text,
      });

      setQuestionsAnswered((prev) => prev + 1);

      if (isCorrect) {
        setStreak((prev) => prev + 1);
        toast.success(
          `Correct! 🎉 ${streak >= 2 ? `${streak + 1} in a row!` : ""}`,
        );
      } else {
        setStreak(0);
        toast.info("Not quite! Keep trying! 💪");
      }

      // Load next question after delay
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
        fetchQuestion();
      }, 1500);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setShowResult(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getAnswerState = (answer) => {
    if (!showResult) {
      return selectedAnswer === answer.id ? "selected" : "default";
    }
    if (answer.isCorrect) return "correct";
    if (selectedAnswer === answer.id && !answer.isCorrect) return "incorrect";
    return "default";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      <div className="container mx-auto px-4 pt-8 pb-20">
        {/* Stats Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <Card variant="glass" className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Questions</p>
                    <p className="font-bold text-neutral-800">
                      {questionsAnswered}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Streak</p>
                    <p className="font-bold text-warning-600">{streak}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={fetchQuestion}
                  disabled={loading || submitting}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card variant="elevated" className="border-0">
                  <CardContent className="p-8">
                    <LoadingSpinner text="Loading question..." />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  variant="elevated"
                  className="overflow-hidden border-0 shadow-xl"
                >
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                    <div className="relative flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <motion.h2
                        className="text-xl md:text-2xl font-bold text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {question}
                      </motion.h2>
                    </div>
                  </div>

                  {/* Answer Options */}
                  <CardContent className="p-6 space-y-3">
                    {answers.map((answer, index) => (
                      <QuizOption
                        key={answer.id}
                        option={answer}
                        index={index}
                        state={getAnswerState(answer)}
                        onSelect={handleAnswerSelect}
                        disabled={showResult || submitting}
                      />
                    ))}
                  </CardContent>

                  {/* Submit Button */}
                  <div className="px-6 pb-6">
                    <Button
                      onClick={submitAnswer}
                      disabled={!selectedAnswer || submitting || showResult}
                      size="lg"
                      className="w-full shadow-lg"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoadingSpinner
                            size="sm"
                            showText={false}
                            color="white"
                          />
                          Checking...
                        </span>
                      ) : showResult ? (
                        "Loading next question..."
                      ) : (
                        "Submit Answer"
                      )}
                    </Button>
                  </div>

                  {/* Result Feedback */}
                  <AnimatePresence>
                    {showResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-6 ${
                          isCorrect
                            ? "bg-success-50 border-t-4 border-success-500"
                            : "bg-error-50 border-t-4 border-error-500"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isCorrect ? "bg-success-100" : "bg-error-100"
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-success-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-error-600" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-bold text-lg ${isCorrect ? "text-success-700" : "text-error-700"}`}
                            >
                              {isCorrect ? "Excellent!" : "Not quite!"}
                            </p>
                            <p
                              className={`text-sm ${isCorrect ? "text-success-600" : "text-error-600"}`}
                            >
                              {isCorrect
                                ? streak > 1
                                  ? `You're on fire! ${streak} correct in a row!`
                                  : "Keep up the great work!"
                                : "Don't worry, learning takes practice!"}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuizQuestion;
