import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";
import { useToast } from "../components/Toast";
import { quizAPI, getErrorMessage } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Send,
  Flame,
  CheckCircle,
  Lightbulb,
  Headphones,
  MessageSquare,
  VolumeX,
} from "lucide-react";

// Session storage key for tracking used phrases
const USED_PHRASES_KEY = "speech_used_phrases";
const MAX_STORED_PHRASES = 30;

const QNA = () => {
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);
  const [browserSupported, setBrowserSupported] = useState(true);
  const toast = useToast();

  // Refs to prevent multiple fetches
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const usedPhrasesRef = useRef([]);

  // Load used phrases from session storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(USED_PHRASES_KEY);
      if (stored) {
        usedPhrasesRef.current = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading used phrases:", e);
    }
  }, []);

  // Save used phrase to session storage
  const saveUsedPhrase = useCallback((phrase) => {
    if (!phrase) return;

    const normalizedPhrase = phrase.toLowerCase().trim();
    const used = usedPhrasesRef.current;

    if (!used.includes(normalizedPhrase)) {
      used.push(normalizedPhrase);
      if (used.length > MAX_STORED_PHRASES) {
        used.shift();
      }
      usedPhrasesRef.current = used;
      try {
        sessionStorage.setItem(USED_PHRASES_KEY, JSON.stringify(used));
      } catch (e) {
        console.error("Error saving used phrases:", e);
      }
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.lang = "en-US";
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1;

      let finalTranscript = "";

      recognitionInstance.onstart = () => {
        console.log("Speech recognition started");
        finalTranscript = "";
      };

      recognitionInstance.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        // Show interim results while speaking, final when done
        setUserAnswer((finalTranscript + interimTranscript).trim());
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        switch (event.error) {
          case "not-allowed":
          case "permission-denied":
            toast.error(
              "Please allow microphone access to use speech recognition",
            );
            break;
          case "no-speech":
            toast.info("No speech detected. Please try again.");
            break;
          case "audio-capture":
            toast.error("No microphone found. Please check your device.");
            break;
          case "network":
            toast.error("Network error. Please check your connection.");
            break;
          case "aborted":
            // User stopped, no error message needed
            break;
          default:
            toast.error("Speech recognition error. Please try again.");
        }
      };

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setBrowserSupported(false);
      toast.warning(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch speech challenge
  const fetchChallenge = useCallback(async () => {
    // Prevent duplicate requests
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setResult(null);
    setUserAnswer("");

    try {
      // Pass previously used phrases to exclude them
      const excludePhrases = usedPhrasesRef.current;
      const response = await quizAPI.getSpeechChallenge(excludePhrases);
      const data = response.data;

      if (data?.text) {
        // Check if we got a duplicate
        const normalizedText = data.text.toLowerCase().trim();
        if (usedPhrasesRef.current.includes(normalizedText)) {
          // Clear some history
          usedPhrasesRef.current = usedPhrasesRef.current.slice(-5);
          sessionStorage.setItem(
            USED_PHRASES_KEY,
            JSON.stringify(usedPhrasesRef.current),
          );
        }
        setQuestion(data.text);
      } else {
        // Fallback phrases if API doesn't return one
        const fallbackPhrases = [
          "Hello, how are you today?",
          "The quick brown fox jumps over the lazy dog",
          "Learning is fun with KIDOAI",
          "Practice makes perfect",
          "I love to learn new things",
          "Knowledge is power",
          "Every day is a new opportunity",
          "Reading opens new worlds",
          "Curiosity leads to discovery",
          "Education is the key to success",
        ];

        // Filter out already used phrases
        const availablePhrases = fallbackPhrases.filter(
          (p) => !usedPhrasesRef.current.includes(p.toLowerCase().trim()),
        );

        const selectedPhrase =
          availablePhrases.length > 0
            ? availablePhrases[
                Math.floor(Math.random() * availablePhrases.length)
              ]
            : fallbackPhrases[
                Math.floor(Math.random() * fallbackPhrases.length)
              ];

        setQuestion(selectedPhrase);
      }
    } catch (error) {
      console.error("Error fetching challenge:", error);
      // Don't show error for cancelled requests
      if (error.message !== "Duplicate request cancelled") {
        // Use fallback phrase
        setQuestion("Hello World");
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch - only once
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchChallenge();
    }
  }, [fetchChallenge]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userAnswer.trim()) {
      toast.warning("Please speak or type your answer first");
      return;
    }

    setSubmitting(true);

    // Calculate similarity for partial matches
    const similarity = calculateSimilarity(
      userAnswer.toLowerCase().trim(),
      question.toLowerCase().trim(),
    );

    try {
      await quizAPI.submitAnswer({
        isValid: similarity >= 0.8,
        answer: userAnswer,
        challenge: question,
      });

      // Save this phrase as used
      saveUsedPhrase(question);

      if (similarity >= 0.95) {
        setResult({ status: "perfect", message: "Perfect! 🎉" });
        setStreak((prev) => prev + 1);
        toast.success("Perfect pronunciation! 🎉");
      } else if (similarity >= 0.8) {
        setResult({ status: "correct", message: "Great job! Almost perfect!" });
        setStreak((prev) => prev + 1);
        toast.success("Great job! 👏");
      } else if (similarity >= 0.5) {
        setResult({ status: "partial", message: "Good try! Keep practicing!" });
        setStreak(0);
        toast.info("Good attempt! Try again for a better score.");
      } else {
        setResult({ status: "incorrect", message: "Not quite. Try again!" });
        setStreak(0);
        toast.info("Keep practicing! You'll get it! 💪");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewChallenge = () => {
    if (!loading && !submitting) {
      // Save current phrase as used even if skipped
      saveUsedPhrase(question);
      fetchChallenge();
    }
  };

  const calculateSimilarity = (str1, str2) => {
    const words1 = str1.split(" ").filter(Boolean);
    const words2 = str2.split(" ").filter(Boolean);
    let matches = 0;

    words1.forEach((word, index) => {
      if (words2[index] && word === words2[index]) {
        matches++;
      }
    });

    return matches / Math.max(words1.length, words2.length);
  };

  const startListening = async () => {
    if (!recognition) {
      toast.error("Speech recognition not available");
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setUserAnswer("");
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Microphone permission error:", error);
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        toast.error("Please allow microphone access to use speech recognition");
      } else if (error.name === "NotFoundError") {
        toast.error("No microphone found. Please connect a microphone.");
      } else {
        toast.error("Could not access microphone. Please check your settings.");
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakQuestion = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.warning("Text-to-speech is not supported in your browser");
    }
  };

  const getResultStyles = () => {
    if (!result) return { bg: "", border: "", text: "", icon: null };
    switch (result.status) {
      case "perfect":
        return {
          bg: "bg-success-50",
          border: "border-success-500",
          text: "text-success-700",
          icon: <CheckCircle className="w-6 h-6 text-success-600" />,
        };
      case "correct":
        return {
          bg: "bg-secondary-50",
          border: "border-secondary-500",
          text: "text-secondary-700",
          icon: <CheckCircle className="w-6 h-6 text-secondary-600" />,
        };
      case "partial":
        return {
          bg: "bg-warning-50",
          border: "border-warning-500",
          text: "text-warning-700",
          icon: <Lightbulb className="w-6 h-6 text-warning-600" />,
        };
      case "incorrect":
        return {
          bg: "bg-error-50",
          border: "border-error-500",
          text: "text-error-700",
          icon: <MessageSquare className="w-6 h-6 text-error-600" />,
        };
      default:
        return { bg: "", border: "", text: "", icon: null };
    }
  };

  const resultStyles = getResultStyles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 via-white to-primary-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <Card variant="glass" className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Challenge</p>
                    <p className="font-bold text-neutral-800">
                      Speech Practice
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
                  onClick={fetchChallenge}
                  disabled={loading}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  New
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
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
                    <LoadingSpinner text="Loading challenge..." />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  variant="elevated"
                  className="overflow-hidden border-0 shadow-xl"
                >
                  {/* Challenge Header */}
                  <div className="bg-gradient-to-r from-success-500 via-success-600 to-secondary-500 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                    <div className="relative">
                      <Badge
                        variant="default"
                        className="bg-white/20 text-white border-0 mb-3"
                      >
                        <Mic className="w-3 h-3 mr-1" />
                        Repeat the sentence below
                      </Badge>
                      <div className="flex items-center gap-4">
                        <motion.h2
                          className="text-xl md:text-2xl font-bold text-white flex-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          "{question}"
                        </motion.h2>
                        <motion.button
                          onClick={speakQuestion}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/20 rounded-xl text-white hover:bg-white/30 transition"
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="w-6 h-6" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Answer Section */}
                  <form onSubmit={handleSubmit}>
                    <CardContent className="p-6 space-y-6">
                      {/* Your Answer Display */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Your Answer:
                        </label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder={
                              isListening
                                ? "Listening..."
                                : "Click 'Start Recording' or type your answer"
                            }
                            className={`pr-12 ${
                              isListening
                                ? "border-error-400 bg-error-50 ring-2 ring-error-200"
                                : ""
                            }`}
                          />
                          {isListening && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              <div className="w-4 h-4 bg-error-500 rounded-full" />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        {browserSupported && (
                          <Button
                            type="button"
                            onClick={
                              isListening ? stopListening : startListening
                            }
                            disabled={submitting}
                            variant={isListening ? "destructive" : "success"}
                            className="flex-1 gap-2"
                          >
                            {isListening ? (
                              <>
                                <MicOff className="w-5 h-5" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic className="w-5 h-5" />
                                Start Recording
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          type="submit"
                          disabled={
                            !userAnswer.trim() || submitting || isListening
                          }
                          className="flex-1 gap-2 shadow-lg"
                        >
                          {submitting ? (
                            <>
                              <LoadingSpinner
                                size="sm"
                                showText={false}
                                color="white"
                              />
                              Checking...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Submit Answer
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </form>

                  {/* Result Feedback */}
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-6 border-t-4 ${resultStyles.bg} ${resultStyles.border}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${resultStyles.bg}`}
                          >
                            {resultStyles.icon}
                          </div>
                          <div>
                            <p
                              className={`font-bold text-lg ${resultStyles.text}`}
                            >
                              {result.message}
                            </p>
                            <p
                              className={`text-sm opacity-75 ${resultStyles.text}`}
                            >
                              {result.status === "incorrect" ||
                              result.status === "partial"
                                ? `Expected: "${question}"`
                                : streak > 1
                                  ? `${streak} in a row! Keep it up!`
                                  : "Great pronunciation!"}
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

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card variant="glass" className="border-0">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning-500" />
                  Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-neutral-600 space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-3 h-3 text-secondary-600" />
                    </div>
                    <span>
                      Click the speaker icon to hear the correct pronunciation
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-3 h-3 text-success-600" />
                    </div>
                    <span>Speak clearly and at a moderate pace</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <VolumeX className="w-3 h-3 text-primary-600" />
                    </div>
                    <span>Find a quiet place for better recognition</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QNA;
