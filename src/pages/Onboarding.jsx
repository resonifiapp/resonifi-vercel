import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Shield, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Meta from "../components/Meta";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);

  const steps = [
    {
      emoji: "👋",
      title: "Welcome to Resonifi™",
      description: "Track your daily wellness frequency and discover your patterns.",
    },
    {
      emoji: "📊",
      title: "Simple Daily Check-ins",
      description: "Answer a few quick questions each day to build your wellness baseline.",
    },
    {
      emoji: "🎯",
      title: "Personalized Insights",
      description: "See trends, patterns, and get actionable recommendations.",
    },
    {
      emoji: "🔒",
      title: "Your Data, Your Privacy",
      description: "Your wellness journey is private and secure. We never share your data.",
    },
  ];

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboardingComplete');
    if (hasSeenOnboarding === 'true') {
      navigate(createPageUrl('Dashboard'));
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      navigate(createPageUrl('DailyCheckin'));
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    navigate(createPageUrl('DailyCheckin'));
  };

  return (
    <>
      <Meta
        title="Welcome to Resonifi™"
        description="Get started with your daily wellness tracking"
        noIndex={true}
      />

      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative">
        
        {/* Privacy Modal */}
        <AnimatePresence>
          {showPrivacyBanner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
              onClick={() => setShowPrivacyBanner(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'linear-gradient(135deg, #0E1A24 0%, #122C35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  maxWidth: '32rem',
                  width: '100%',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#00BFA6' }} />
                    <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 600 }}>
                      Your Privacy Matters
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowPrivacyBanner(false)}
                    style={{
                      color: '#A8B3C5',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#A8B3C5'}
                  >
                    <X style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </div>
                
                <div style={{ color: '#A8B3C5', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  <p style={{ marginBottom: '0.75rem' }}>
                    We want you to feel safe and in control. While your email is essential for managing your account and ensuring your data is secure, we will never use it for marketing or unwanted contact without your express permission.
                  </p>
                  <p style={{ marginBottom: '0.75rem' }}>
                    You can opt-out of any emails from us, unless you've opted into a service like Reminders. Your data remains <strong style={{ color: '#FFFFFF' }}>yours</strong>.
                  </p>
                </div>

                <Button
                  onClick={() => setShowPrivacyBanner(false)}
                  className="w-full bg-[#00BFA6] hover:bg-[#00D4B8] text-white"
                >
                  Got it
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Onboarding Content */}
        <div className="max-w-2xl w-full">
          <div className="mb-8 flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-8 bg-[#00BFA6]' 
                    : 'w-2 bg-gray-600'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#1A2035]/80 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-6">{steps[currentStep].emoji}</div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    {steps[currentStep].description}
                  </p>

                  <div className="flex gap-4">
                    {currentStep === 0 && (
                      <Button
                        onClick={handleSkip}
                        variant="ghost"
                        className="flex-1 text-gray-400 hover:text-white"
                      >
                        Skip intro
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      className="flex-1 bg-[#00BFA6] hover:bg-[#00D4B8] text-white"
                    >
                      {currentStep === steps.length - 1 ? (
                        "Get Started"
                      ) : (
                        <>
                          Next
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}