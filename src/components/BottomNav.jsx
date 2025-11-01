import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Home, CheckCircle, Sparkles, Heart, TrendingUp } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  const [showCycle, setShowCycle] = useState(false);
  
  useEffect(() => {
    const checkCycleVisibility = async () => {
      try {
        const user = await base44.auth.me();
        const shouldShow = 
          user?.gender_identity === "female" || 
          (user?.life_stage_preferences || []).some(stage => 
            ["menstrual_cycle", "perimenopause_menopause"].includes(stage)
          );
        setShowCycle(shouldShow);
      } catch (error) {
        console.log('[BottomNav] Failed to check cycle visibility (silent):', error);
      }
    };
    
    checkCycleVisibility();
  }, []);
  
  const navItems = [
    { icon: Home, label: "Dashboard", path: createPageUrl("Dashboard"), show: true },
    { icon: CheckCircle, label: "Check-In", path: createPageUrl("DailyCheckin"), color: "#2DD4BF", show: true },
    { icon: Sparkles, label: "Spiritual", path: createPageUrl("SpiritualResonance"), color: "#2DD4BF", show: true },
    { icon: Heart, label: "Cycle", path: createPageUrl("CycleTracking"), color: "#F9A8D4", show: showCycle },
    { icon: TrendingUp, label: "Insights", path: createPageUrl("Insights"), show: true },
  ].filter(item => item.show);

  return (
    <>
      <style jsx>{`
        .bottom-nav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: env(safe-area-inset-bottom, 0px);
          height: 84px;
          background: rgba(17, 17, 17, 0.95);
          backdrop-filter: blur(8px);
          border-top: 1px solid #262626;
          z-index: 40;
        }

        .bottom-nav-content {
          height: 100%;
          max-width: 672px;
          margin: 0 auto;
          padding: 0 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 100%;
          transition: color 0.2s ease;
          text-decoration: none;
          flex: 1;
          min-width: 0;
        }

        .nav-icon {
          width: 24px;
          height: 24px;
          transition: all 0.2s ease;
        }

        .nav-label {
          font-size: 11px;
          color: #c7c7c7;
          font-weight: 500;
          white-space: nowrap;
        }

        .nav-active .nav-label {
          font-weight: 700;
        }

        .nav-active .nav-icon {
          transform: scale(1.1);
        }
      `}</style>
      
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'nav-active' : ''}`}
              >
                <Icon 
                  className="nav-icon" 
                  style={{ 
                    color: isActive && item.color ? item.color : '#c7c7c7',
                    strokeWidth: isActive ? 2.5 : 2
                  }}
                />
                <span 
                  className="nav-label" 
                  style={{ color: isActive && item.color ? item.color : undefined }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}