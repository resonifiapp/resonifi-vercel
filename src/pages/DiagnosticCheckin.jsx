import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function DiagnosticCheckin() {
  const [log, setLog] = useState('Ready');

  const test = async () => {
    setLog('Testing...');
    
    try {
      const user = await base44.auth.me();
      setLog(`User: ${user.email}`);
      
      const data = {
        date: new Date().toISOString().split('T')[0],
        frequency_today: 60,
        mood_rating: 7,
        energy_level: 7,
        sleep: 7,
        exercise: 5,
        resilience: 7,
        purpose: 5,
        meditation: 0,
        screen_time: 2,
        hydration: 2,
        gratitude_rating: 5,
        stress_level: 5,
        connection_rating: 7,
        hormonal_shifts: 'none',
        notes: 'test',
        goals_completed: [],
        gratitude_notes: []
      };
      
      setLog('Creating...');
      const result = await base44.entities.DailyCheckin.create(data);
      setLog(`SUCCESS! ID: ${result.id}`);
      
    } catch (e) {
      setLog(`ERROR: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h1>Diagnostic Test</h1>
      <button onClick={test} style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}>
        TEST SAVE
      </button>
      <p style={{ marginTop: '20px', fontSize: '14px', background: '#333', padding: '10px' }}>
        {log}
      </p>
    </div>
  );
}