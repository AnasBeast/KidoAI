import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";
import { useToast } from "../components/Toast";
import { quizAPI, getErrorMessage } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Pencil,
  Target,
  BarChart3,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Lightbulb,
} from "lucide-react";

// Session storage key for tracking used sentences
const USED_SENTENCES_KEY = "kidoai_used_fillgap_sentences";

// Extended sentence pool with categories for variety
const ALL_SENTENCES = [
  // Animals
  {
    id: 1,
    text: "The quick _____ fox jumps over the _____ dog.",
    correctWords: ["brown", "lazy"],
    allWords: ["brown", "lazy", "smart", "active"],
    category: "animals",
  },
  {
    id: 2,
    text: "The _____ cat sleeps on the _____ mat.",
    correctWords: ["fluffy", "warm"],
    allWords: ["fluffy", "warm", "angry", "cold"],
    category: "animals",
  },
  {
    id: 3,
    text: "The _____ bird sings a _____ song.",
    correctWords: ["small", "beautiful"],
    allWords: ["small", "beautiful", "large", "quiet"],
    category: "animals",
  },
  {
    id: 4,
    text: "A _____ elephant has _____ ears.",
    correctWords: ["big", "large"],
    allWords: ["big", "large", "tiny", "small"],
    category: "animals",
  },
  // Nature
  {
    id: 5,
    text: "The _____ shines brightly in the _____ sky.",
    correctWords: ["sun", "blue"],
    allWords: ["sun", "blue", "moon", "dark"],
    category: "nature",
  },
  {
    id: 6,
    text: "The _____ flowers bloom in the _____ garden.",
    correctWords: ["colorful", "spring"],
    allWords: ["colorful", "spring", "dead", "winter"],
    category: "nature",
  },
  {
    id: 7,
    text: "Rain falls from _____ clouds in the _____ weather.",
    correctWords: ["dark", "stormy"],
    allWords: ["dark", "stormy", "white", "sunny"],
    category: "nature",
  },
  // Learning
  {
    id: 8,
    text: "Learning is _____ when you have a _____ attitude.",
    correctWords: ["fun", "positive"],
    allWords: ["fun", "positive", "boring", "negative"],
    category: "learning",
  },
  {
    id: 9,
    text: "Reading _____ helps improve your _____ skills.",
    correctWords: ["books", "vocabulary"],
    allWords: ["books", "vocabulary", "games", "cooking"],
    category: "learning",
  },
  {
    id: 10,
    text: "A _____ student always does their _____ work.",
    correctWords: ["good", "homework"],
    allWords: ["good", "homework", "bad", "chores"],
    category: "learning",
  },
  {
    id: 11,
    text: "Practice makes _____ when you work _____.",
    correctWords: ["perfect", "hard"],
    allWords: ["perfect", "hard", "worse", "lazy"],
    category: "learning",
  },
  // Food
  {
    id: 12,
    text: "The _____ apple tastes very _____.",
    correctWords: ["red", "sweet"],
    allWords: ["red", "sweet", "green", "sour"],
    category: "food",
  },
  {
    id: 13,
    text: "I drink _____ milk for _____ bones.",
    correctWords: ["cold", "strong"],
    allWords: ["cold", "strong", "hot", "weak"],
    category: "food",
  },
  {
    id: 14,
    text: "Fresh _____ are healthy for your _____.",
    correctWords: ["vegetables", "body"],
    allWords: ["vegetables", "body", "candies", "toys"],
    category: "food",
  },
  // Daily life
  {
    id: 15,
    text: "I wake up _____ in the _____ morning.",
    correctWords: ["early", "bright"],
    allWords: ["early", "bright", "late", "dark"],
    category: "daily",
  },
  {
    id: 16,
    text: "We play _____ games in the _____ park.",
    correctWords: ["fun", "big"],
    allWords: ["fun", "big", "boring", "small"],
    category: "daily",
  },
  {
    id: 17,
    text: "The _____ teacher helps us _____ new things.",
    correctWords: ["kind", "learn"],
    allWords: ["kind", "learn", "mean", "forget"],
    category: "daily",
  },
  {
    id: 18,
    text: "My _____ friends make me feel _____.",
    correctWords: ["best", "happy"],
    allWords: ["best", "happy", "worst", "sad"],
    category: "daily",
  },
];

// Shuffle array helper function
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Get unused sentences, reset if all used
function getUnusedSentences() {
  const usedIds = JSON.parse(
    sessionStorage.getItem(USED_SENTENCES_KEY) || "[]",
  );
  const unusedSentences = ALL_SENTENCES.filter((s) => !usedIds.includes(s.id));

  if (unusedSentences.length === 0) {
    // All sentences used, reset and start fresh
    sessionStorage.setItem(USED_SENTENCES_KEY, "[]");
    return shuffleArray([...ALL_SENTENCES]);
  }

  return shuffleArray(unusedSentences);
}

const FillInTheGaps = () => {
  // Get initial sentences from unused pool
  const initialSentencesRef = useRef(getUnusedSentences().slice(0, 5));
  const [sentences, setSentences] = useState(initialSentencesRef.current);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState(shuffleArray([...sentences[0].allWords]));
  const [filledGaps, setFilledGaps] = useState([null, null]);
  const [selectedGap, setSelectedGap] = useState(0);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const usedSentenceIdsRef = useRef(new Set());
  const toast = useToast();

  const currentSentence = sentences[currentIndex];

  // Mark sentence as used
  const markSentenceAsUsed = useCallback((sentenceId) => {
    if (usedSentenceIdsRef.current.has(sentenceId)) return;

    usedSentenceIdsRef.current.add(sentenceId);
    const storedIds = JSON.parse(
      sessionStorage.getItem(USED_SENTENCES_KEY) || "[]",
    );
    if (!storedIds.includes(sentenceId)) {
      storedIds.push(sentenceId);
      sessionStorage.setItem(USED_SENTENCES_KEY, JSON.stringify(storedIds));
    }
  }, []);

  // Load more sentences when needed
  const loadMoreSentences = useCallback(() => {
    const newSentences = getUnusedSentences().slice(0, 5);
    setSentences(newSentences);
    setCurrentIndex(0);
    setWords(shuffleArray([...newSentences[0].allWords]));
  }, []);

  const selectGap = (index) => {
    if (result) return;

    if (filledGaps[index]) {
      // Return word to available words
      setWords((prev) => [...prev, filledGaps[index]]);
      setFilledGaps((prev) => {
        const newGaps = [...prev];
        newGaps[index] = null;
        return newGaps;
      });
    }
    setSelectedGap(index);
  };

  const fillGap = (word) => {
    if (result || selectedGap === null) return;

    setFilledGaps((prev) => {
      const newGaps = [...prev];
      newGaps[selectedGap] = word;
      return newGaps;
    });
    setWords((prev) => prev.filter((w) => w !== word));

    // Move to next empty gap
    const nextEmpty = filledGaps.findIndex(
      (gap, i) => i !== selectedGap && gap === null,
    );
    setSelectedGap(nextEmpty >= 0 ? nextEmpty : null);
  };

  const checkAnswer = async () => {
    if (filledGaps.some((gap) => gap === null)) {
      toast.warning("Please fill in all gaps first!");
      return;
    }

    setSubmitting(true);
    setTotalAttempts((prev) => prev + 1);

    const isCorrect = filledGaps.every(
      (word, index) =>
        word?.toLowerCase() ===
        currentSentence.correctWords[index]?.toLowerCase(),
    );

    try {
      await quizAPI.submitAnswer({
        isValid: isCorrect,
        answer: filledGaps.join(", "),
      });

      if (isCorrect) {
        setScore((prev) => prev + 1);
        setResult({ status: "correct", message: "Correct! Well done! 🎉" });
        toast.success("Correct answer! +1 point");
      } else {
        setResult({
          status: "incorrect",
          message: "Not quite right. Try again!",
          correctAnswer: currentSentence.correctWords.join(", "),
        });
        toast.info("Not quite! Keep trying!");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const nextSentence = () => {
    // Mark current sentence as used
    markSentenceAsUsed(currentSentence.id);

    const nextIndex = currentIndex + 1;

    if (nextIndex >= sentences.length) {
      // Load more sentences when we've gone through current batch
      loadMoreSentences();
    } else {
      setCurrentIndex(nextIndex);
      setWords(shuffleArray([...sentences[nextIndex].allWords]));
    }

    setFilledGaps([null, null]);
    setSelectedGap(0);
    setResult(null);
  };

  const resetGame = () => {
    setWords(shuffleArray([...currentSentence.allWords]));
    setFilledGaps([null, null]);
    setSelectedGap(0);
    setResult(null);
  };

  // Get total sentences for display
  const totalSentencesAvailable = ALL_SENTENCES.length;

  const accuracy = useMemo(() => {
    if (totalAttempts === 0) return 0;
    return Math.round((score / totalAttempts) * 100);
  }, [score, totalAttempts]);

  const renderSentence = () => {
    let gapCounter = 0;
    return currentSentence.text.split(" ").map((word, index) => {
      if (word === "_____") {
        const currentGapIndex = gapCounter;
        gapCounter++;
        const isSelected = selectedGap === currentGapIndex;
        const isFilled = filledGaps[currentGapIndex];
        const isCorrect = result?.status === "correct";
        const isIncorrect =
          result?.status === "incorrect" &&
          filledGaps[currentGapIndex]?.toLowerCase() !==
            currentSentence.correctWords[currentGapIndex]?.toLowerCase();

        return (
          <motion.span
            key={`gap-${index}`}
            onClick={() => selectGap(currentGapIndex)}
            className={`inline-flex items-center justify-center min-w-[100px] h-10 mx-1 px-3 rounded-xl cursor-pointer transition-all duration-200 border-2 font-medium ${
              isCorrect
                ? "bg-success-100 border-success-400 text-success-700"
                : isIncorrect
                  ? "bg-error-100 border-error-400 text-error-700"
                  : isSelected
                    ? "bg-primary-100 border-primary-400 ring-2 ring-primary-200"
                    : isFilled
                      ? "bg-secondary-50 border-secondary-300"
                      : "bg-neutral-100 border-neutral-300 border-dashed"
            }`}
            whileHover={!result ? { scale: 1.05 } : {}}
            whileTap={!result ? { scale: 0.95 } : {}}
          >
            {isFilled || "_____"}
          </motion.span>
        );
      }
      return (
        <span key={`word-${index}`} className="mx-0.5">
          {word}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <Card variant="glass" className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Score</p>
                    <p className="font-bold text-neutral-800">{score}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Accuracy</p>
                    <p className="font-bold text-primary-600">{accuracy}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Attempts</p>
                    <p className="font-bold text-neutral-800">
                      {totalAttempts}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              variant="elevated"
              className="overflow-hidden border-0 shadow-xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary-500 via-secondary-600 to-primary-500 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <Badge
                      variant="default"
                      className="bg-white/20 text-white border-0 mb-2"
                    >
                      {currentSentence.category} • {totalAttempts + 1} of{" "}
                      {totalSentencesAvailable}
                    </Badge>
                    <h1 className="text-2xl font-bold text-white">
                      Fill in the Gaps
                    </h1>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Pencil className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Sentence */}
              <CardContent className="p-6">
                <Card variant="filled" className="bg-neutral-50 mb-6">
                  <CardContent className="p-6">
                    <p className="text-lg leading-relaxed flex flex-wrap items-center">
                      {renderSentence()}
                    </p>
                  </CardContent>
                </Card>

                {/* Word Bank */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-neutral-600 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Available Words:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {words.map((word) => (
                        <motion.div
                          key={word}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          <Button
                            onClick={() => fillGap(word)}
                            disabled={result !== null}
                            variant="secondary"
                            className="shadow-md hover:shadow-lg"
                          >
                            {word}
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {words.length === 0 && !result && (
                      <p className="text-neutral-400 italic">
                        All words have been used
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {!result ? (
                    <>
                      <Button
                        onClick={resetGame}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </Button>
                      <Button
                        onClick={checkAnswer}
                        disabled={
                          filledGaps.some((g) => g === null) || submitting
                        }
                        variant="success"
                        className="flex-1 gap-2 shadow-lg"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {submitting ? "Checking..." : "Check Answer"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={nextSentence}
                      className="w-full gap-2 shadow-lg"
                    >
                      Next Sentence
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>

              {/* Result Feedback */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-6 border-t-4 ${
                      result.status === "correct"
                        ? "bg-success-50 border-success-500"
                        : "bg-error-50 border-error-500"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          result.status === "correct"
                            ? "bg-success-100"
                            : "bg-error-100"
                        }`}
                      >
                        {result.status === "correct" ? (
                          <CheckCircle className="w-6 h-6 text-success-600" />
                        ) : (
                          <Lightbulb className="w-6 h-6 text-error-600" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-bold text-lg ${
                            result.status === "correct"
                              ? "text-success-700"
                              : "text-error-700"
                          }`}
                        >
                          {result.message}
                        </p>
                        {result.correctAnswer && (
                          <p className="text-sm text-error-600 mt-1">
                            Correct answers:{" "}
                            <span className="font-medium">
                              {result.correctAnswer}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Card variant="glass" className="border-0">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-500" />
                    How to Play
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-neutral-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs px-2">
                        1
                      </Badge>
                      <span>Click on a gap to select it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs px-2">
                        2
                      </Badge>
                      <span>
                        Click a word from the word bank to fill the selected gap
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs px-2">
                        3
                      </Badge>
                      <span>Click a filled gap to return the word</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs px-2">
                        4
                      </Badge>
                      <span>Click "Check Answer" when you're ready!</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FillInTheGaps;
