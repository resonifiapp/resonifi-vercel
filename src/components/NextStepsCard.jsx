import React from "react";

export default function NextStepsCard({ scores }) {
  const tipsByCategory = {
    mood: "😊 Try a 2-minute breathing break or watch something funny.",
    sleep: "🛌 Aim for an earlier wind-down and reduce screen time tonight.",
    energy: "⚡ Try stretching, sunlight, or a glass of water to boost energy.",
    connection: "📱 Reach out to someone you care about — even a quick text helps.",
    hydration: "💧 Drink more water — aim for 2-3 liters daily to improve focus, energy, and emotional balance.",
    movement: "🚶‍♂️ Take a short walk or do 10 squats right now.",
    reflection: "📓 Try jotting down 1 thing you're grateful for.",
  };

  const hydrationExplanation =
    "Hydration affects brain clarity, mood, and physical energy. Even mild dehydration can cause fatigue, headaches, and low motivation. Target 2-3 liters daily.";

  const getLowestScoringAreas = (scores, limit = 3) => {
    return Object.entries(scores)
      .sort((a, b) => a[1] - b[1])
      .slice(0, limit)
      .map(([category]) => ({
        category,
        tip: tipsByCategory[category],
      }));
  };

  const tips = getLowestScoringAreas(scores);

  return (
    <div className="next-steps-card" style={{
      backgroundColor: "#1e1e1e",
      color: "#ffffff",
      padding: "1.5rem",
      borderRadius: "16px",
      marginTop: "1.5rem",
      boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)"
    }}>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
        Next Steps to Improve Your Wellness Index™
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tips.map(({ tip }, i) => (
          <li key={i} style={{ marginBottom: "0.75rem" }}>{tip}</li>
        ))}
      </ul>

      {tips.some(({ category }) => category === "hydration") && (
        <div style={{
          marginTop: "1rem",
          fontSize: "0.95rem",
          color: "#a0c8ff"
        }}>
          💡 <strong>Why it matters:</strong> {hydrationExplanation}
        </div>
      )}
    </div>
  );
}