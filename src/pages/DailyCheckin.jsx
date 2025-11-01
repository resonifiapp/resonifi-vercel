
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ResonifiSlider from "../components/ResonifiSlider";
import ResonifiStepper from "../components/ResonifiStepper";
import HydrationStepper from "../components/HydrationStepper";
import { Save, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { computeWellnessIndex } from "../components/lib/wellnessIndex";
import { saveGuestCheckin, isGuestMode } from "../components/lib/guestMode";
import BottomNav from "@/components/BottomNav"; // Added import for BottomNav

export default function DailyCheckin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCheckin, setExistingCheckin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const [formData, setFormData] = useState({
    mood_rating: 5,
    energy_level: 5,
    sleep: 7,
    exercise: 30,
    stress_level: 5,
    connection_rating: 5,
    gratitude_rating: 5,
    hydration: 2,
    resilience: 5,
    purpose: 5,
  });

  // Calculate REAL-TIME wellness index preview (SIMPLIFIED - 4 pillars only)
  const currentIndex = computeWellnessIndex({
    sleep: formData.sleep,
    hydration: formData.hydration,
    purpose: formData.purpose,
    resilience: formData.resilience
  });

  useEffect(() => {
    const loadTodayCheckin = async () => {
      try {
        if (isGuestMode()) {
          setIsGuest(true);
          return;
        }

        const user = await base44.auth.me();
        setIsGuest(false);
        
        const today = new Date().toISOString().split('T')[0];
        const checkins = await base44.entities.DailyCheckin.filter({
          created_by: user.email,
          date: today
        });

        if (checkins.length > 0) {
          const existing = checkins[0];
          setExistingCheckin(existing);
          setIsEditing(true);
          
          setFormData({
            mood_rating: existing.mood_rating || 5,
            energy_level: existing.energy_level || 5,
            sleep: existing.sleep || 7,
            exercise: existing.exercise || 30,
            stress_level: existing.stress_level || 5,
            connection_rating: existing.connection_rating || 5,
            gratitude_rating: existing.gratitude_rating || 5,
            hydration: existing.hydration || 2,
            resilience: existing.resilience || 5,
            purpose: existing.purpose || 5,
          });
        }
      } catch (error) {
        console.log('[DailyCheckin] Load existing failed (silent):', error);
        setIsGuest(true);
      }
    };

    loadTodayCheckin();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate REAL wellness index from actual form values (SIMPLIFIED)
      const frequency_today = computeWellnessIndex({
        sleep: formData.sleep,
        hydration: formData.hydration,
        purpose: formData.purpose,
        resilience: formData.resilience
      });

      console.log('[DailyCheckin] Calculated index:', frequency_today);
      console.log('[DailyCheckin] Form data:', { sleep: formData.sleep, hydration: formData.hydration, purpose: formData.purpose, resilience: formData.resilience });

      if (isGuest) {
        saveGuestCheckin({
          index: frequency_today,
          sleep: formData.sleep,
          hydration: formData.hydration,
          purpose: formData.purpose,
          resilience: formData.resilience,
          mood: formData.mood_rating,
          energy: formData.energy_level,
          exercise: formData.exercise,
          stress: formData.stress_level,
          connection: formData.connection_rating,
          gratitude: formData.gratitude_rating
        });

        if (typeof window !== "undefined" && window.plausible) {
          window.plausible("Guest Check-in Completed");
        }
      } else {
        const checkinData = {
          date: today,
          frequency_today,
          mood_rating: formData.mood_rating,
          energy_level: formData.energy_level,
          sleep: formData.sleep,
          exercise: formData.exercise,
          stress_level: formData.stress_level,
          connection_rating: formData.connection_rating,
          gratitude_rating: formData.gratitude_rating,
          hydration: formData.hydration,
          resilience: formData.resilience,
          purpose: formData.purpose,
          ...(existingCheckin?.spiritual_resonance && {
            spiritual_resonance: existingCheckin.spiritual_resonance
          })
        };

        console.log('[DailyCheckin] Saving to DB:', checkinData);

        if (isEditing && existingCheckin) {
          await base44.entities.DailyCheckin.update(existingCheckin.id, checkinData);
          console.log('[DailyCheckin] Updated existing check-in');
        } else {
          await base44.entities.DailyCheckin.create(checkinData);
          console.log('[DailyCheckin] Created new check-in');
        }

        if (typeof window !== "undefined" && window.plausible) {
          window.plausible(isEditing ? "Daily Check-in Updated" : "Daily Check-in Completed");
        }
      }

      // Store the FINAL calculated index
      sessionStorage.setItem('res:fresh_index', String(frequency_today));
      console.log('[DailyCheckin] Stored in sessionStorage:', frequency_today);
      
      // Navigate back
      navigate(createPageUrl("Dashboard"));
      
    } catch (error) {
      console.error('[DailyCheckin] Submit error:', error);
      alert('Failed to save check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "How are you feeling?",
      fields: [
        { label: "Mood", key: "mood_rating", type: "slider", min: 0, max: 10, labels: ["Low", "Great"] },
        { label: "Energy", key: "energy_level", type: "slider", min: 0, max: 10, labels: ["Exhausted", "Energized"] },
      ]
    },
    {
      title: "Physical wellness",
      fields: [
        { label: "Sleep (hours)", key: "sleep", type: "slider", min: 0, max: 12, labels: ["0h", "12h"] },
        { label: "Exercise (minutes)", key: "exercise", type: "stepper", min: 0, max: 180, step: 10 },
        { label: "Hydration (liters)", key: "hydration", type: "hydration", min: 0, max: 4, step: 0.25 },
      ]
    },
    {
      title: "Mental & emotional",
      fields: [
        { label: "Stress level", key: "stress_level", type: "slider", min: 0, max: 10, labels: ["Calm", "Overwhelmed"] },
        { label: "Connection with others", key: "connection_rating", type: "slider", min: 0, max: 10, labels: ["Isolated", "Connected"] },
      ]
    },
    {
      title: "Purpose & meaning",
      fields: [
        { label: "Resilience", key: "resilience", type: "slider", min: 0, max: 10, labels: ["Struggling", "Thriving"] },
        { label: "Sense of purpose", key: "purpose", type: "slider", min: 0, max: 10, labels: ["Lost", "Clear"] },
        { label: "Gratitude", key: "gratitude_rating", type: "slider", min: 0, max: 10, labels: ["None", "Abundant"] },
      ]
    }
  ];

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <>
      <div className="page-has-bottom-nav min-h-screen bg-[#0F172A] text-white px-6 py-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">
                {isGuest ? 'Guest Check-in' : (isEditing ? 'Update Your Check-in' : 'Daily Check-in')}
              </h1>
              <span className="text-sm text-gray-400">Step {step + 1} of {steps.length}</span>
            </div>
            
            {isEditing && !isGuest && (
              <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  ✏️ You've already checked in today. Update your responses below.
                </p>
              </div>
            )}

            {/* Real-time Wellness Index Preview */}
            <div className="mb-4 p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-indigo-300">Current Wellness Index</span>
                <span className="text-2xl font-bold text-indigo-400">{currentIndex}</span>
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-[#2DD4BF]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#1A2035]/80 border-slate-700/50">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-8 text-center text-white">{currentStep.title}</h2>
                  
                  <div className="space-y-8">
                    {currentStep.fields.map((field) => (
                      <div key={field.key} className="space-y-3">
                        {field.type === "slider" && (
                          <ResonifiSlider
                            label={field.label}
                            value={formData[field.key]}
                            onChange={(value) => handleChange(field.key, value)}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            labels={field.labels}
                          />
                        )}
                        
                        {field.type === "stepper" && (
                          <ResonifiStepper
                            label={field.label}
                            value={formData[field.key]}
                            onChange={(value) => handleChange(field.key, value)}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            unit="min"
                          />
                        )}
                        
                        {field.type === "hydration" && (
                          <HydrationStepper
                            value={formData[field.key]}
                            onChange={(value) => handleChange(field.key, value)}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 mt-8">
            {step > 0 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-slate-700 bg-white/10 text-white hover:bg-white/20"
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            
            {step < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isGuest ? 'Saving...' : (isEditing ? 'Updating...' : 'Saving...')}
                  </>
                ) : (
                  <>
                    {isGuest ? 'Complete Check-in' : (isEditing ? 'Update Check-in' : 'Complete Check-in')} <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}
