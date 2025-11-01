
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Info, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Meta from "../components/Meta";
import BottomNav from "../components/BottomNav"; // Added this import
import { computeWellnessIndex } from "../components/lib/wellnessIndex";

const QUESTIONS = [
  { id: "q1", text: "How grateful did you feel today?", label: "Gratitude" },
  { id: "q2", text: "How present and mindful were you?", label: "Presence" },
  { id: "q3", text: "How aligned with your values did you feel?", label: "Alignment" },
  { id: "q4", text: "How connected to others or something greater?", label: "Connection" },
  { id: "q5", text: "How much awe or wonder did you experience?", label: "Awe" },
];

const SCALE_LABELS = ["Never", "Rarely", "Sometimes", "Often", "Always"];

export default function SpiritualResonance() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem("sr:history") || "[]";
      const parsed = JSON.parse(stored);
      setHistory(parsed.slice(0, 10));
    } catch (error) {
      console.log('[SpiritualResonance] Failed to load history (silent):', error);
    }
  };

  const handleResponse = (value) => {
    const questionId = QUESTIONS[currentQuestion].id;
    setResponses(prev => ({ ...prev, [questionId]: value }));

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    }
  };

  const calculateScore = (responses) => {
    const total = Object.values(responses).reduce((sum, val) => sum + val, 0);
    const total20 = total;
    const score100 = Math.round((total20 / 20) * 100);
    return { total20, score100 };
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length < QUESTIONS.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await base44.auth.me();
      const today = new Date().toISOString().split('T')[0];
      
      const { total20, score100 } = calculateScore(responses);
      
      // STABILITY FIX: Ensure score is bounded 0-100
      const boundedScore = Math.max(0, Math.min(100, score100));

      // Save to localStorage history
      const historyEntry = {
        ts: new Date().toISOString(),
        score: boundedScore,
        responses
      };

      const existingHistory = JSON.parse(localStorage.getItem("sr:history") || "[]");
      existingHistory.unshift(historyEntry);
      localStorage.setItem("sr:history", JSON.stringify(existingHistory.slice(0, 30)));

      // Fetch existing DailyCheckin for today
      const existingCheckins = await base44.entities.DailyCheckin.filter(
        { created_by: user.email, date: today },
        "-created_date",
        1
      );

      const spiritualData = {
        version: 2,
        mode: "five_questions",
        questions: responses,
        total20,
        score100: boundedScore
      };

      if (existingCheckins.length > 0) {
        // Update existing check-in - PRESERVE ALL EXISTING DATA
        const existingCheckin = existingCheckins[0];
        
        // Create updated checkin by spreading existing data first
        const updatedCheckin = {
          ...existingCheckin,
          spiritual_resonance: spiritualData
        };

        // Recalculate frequency_today with ALL factors from EXISTING checkin
        const mood10 = existingCheckin.mood_rating || 5;
        const energy10 = existingCheckin.energy_level || 5;
        const sleep10 = existingCheckin.sleep || 7;
        const exercise10 = existingCheckin.exercise || 0;
        const gratitude10 = existingCheckin.gratitude_rating || 5;
        const purpose10 = existingCheckin.purpose || 5;

        // Physical subscore (0-10)
        const physical10 = ((sleep10 + energy10 + exercise10) / 3);

        // Purpose subscore (0-10): average of purpose, gratitude, spiritual
        const purpose10Combined = ((purpose10 + gratitude10 + (boundedScore / 10)) / 3);

        // Recompute wellness index
        const frequency_today = computeWellnessIndex({
          mood10,
          physical10,
          purpose10: purpose10Combined,
          social10: 0 // Will be updated separately by social tracking
        });

        updatedCheckin.frequency_today = frequency_today;

        await base44.entities.DailyCheckin.update(existingCheckin.id, updatedCheckin);
      } else {
        // Create new check-in with spiritual data and default values
        const newCheckin = {
          date: today,
          mood_rating: 5,
          energy_level: 5,
          sleep: 7,
          exercise: 0,
          gratitude_rating: 5,
          connection_rating: 5,
          resilience: 5,
          purpose: 5,
          spiritual_resonance: spiritualData,
          frequency_today: Math.round((boundedScore / 10) * 10) // Rough initial estimate
        };

        await base44.entities.DailyCheckin.create(newCheckin);
      }

      // Dispatch event for dashboard refresh
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("res:spiritual-updated"));
        window.dispatchEvent(new Event("res:checkin-completed"));
      }

      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Spiritual Check-in Completed");
      }

      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error('[SpiritualResonance] Submission failed:', error);
      alert("Failed to save your spiritual check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentQuestion];
  const currentValue = responses[currentQ.id];

  return (
    <>
      <Meta
        title="Resonifi™ — Spiritual Resonance"
        description="Track your inner alignment and connection to meaning."
        url="https://resonifiapp.com/spiritual"
      />

      {/* Added page-has-bottom-nav and adjusted padding */}
      <div className="page-has-bottom-nav min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1A2035] to-[#0D4D4A] text-white px-6 py-12 pb-24 md:pb-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-[#2DD4BF]" />
              <h1 className="text-4xl font-bold">Spiritual Resonance</h1>
            </div>
            <p className="text-gray-300 italic">🙏 Updating today's spiritual check-in</p>
          </motion.div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
              <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-[#1A2035]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#1A2035]/80 border-[#2DD4BF]/30 mb-8">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-2 text-white">{currentQ.text}</h2>
                  <p className="text-sm text-gray-400 mb-6">{SCALE_LABELS[0]} (0) to {SCALE_LABELS[4]} (4)</p>

                  <div className="space-y-3">
                    {[0, 1, 2, 3, 4].map(value => (
                      <button
                        key={value}
                        onClick={() => handleResponse(value)}
                        className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                          currentValue === value
                            ? 'bg-[#2DD4BF]/20 border-[#2DD4BF] text-white'
                            : 'bg-[#0F172A]/50 border-slate-700 text-gray-300 hover:border-[#2DD4BF]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{SCALE_LABELS[value]}</span>
                          <span className="text-sm text-gray-400">{value}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {currentQuestion === QUESTIONS.length - 1 && currentValue !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="bg-[#2DD4BF] hover:bg-[#0D9488] text-white px-8 py-6 text-lg font-semibold"
              >
                {isSubmitting ? "Saving..." : "Complete Check-in"}
              </Button>
            </motion.div>
          )}

          <Card className="bg-[#1A2035]/60 border-slate-700/50 mt-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2 text-white">Spiritual Resonance tracks your inner alignment and connection to meaning.</h3>
                  <p className="text-sm text-gray-300">
                    Your responses contribute to your overall Wellness Index™ through the purpose dimension.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card className="bg-[#1A2035]/60 border-slate-700/50 mt-6">
              <CardContent className="p-6">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#2DD4BF]" />
                    <h3 className="font-semibold text-white">Recent Scores</h3>
                  </div>
                  <span className="text-sm text-gray-400">{showHistory ? 'Hide' : 'Show'}</span>
                </button>

                {showHistory && (
                  <div className="mt-4 space-y-2">
                    {history.slice(0, 5).map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <span className="text-sm text-gray-400">
                          {new Date(entry.ts).toLocaleDateString()}
                        </span>
                        <span className="text-lg font-semibold text-white">
                          {entry.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNav /> {/* Added BottomNav component here */}
    </>
  );
}
