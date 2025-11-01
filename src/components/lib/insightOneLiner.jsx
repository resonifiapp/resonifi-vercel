const labels = { 
  sleep: "Sleep", 
  hydration: "Hydration", 
  purpose: "Purpose", 
  resilience: "Resilience", 
  mood: "Mood",
  energy_level: "Energy",
  gratitude_rating: "Gratitude",
  connection_rating: "Connection"
};

export function getInsightOneLiner(vals = {}) {
  const entries = Object.entries(vals).filter(([_, v]) => typeof v === "number" && v !== null);
  
  if (!entries.length) return "";
  
  const hi = entries.slice().sort((a, b) => b[1] - a[1])[0][0];
  const lo = entries.slice().sort((a, b) => a[1] - b[1])[0][0];
  
  return `Today's center is ${labels[hi] || hi}; support ${labels[lo] || lo} for balance.`;
}