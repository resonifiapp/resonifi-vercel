import React, { useState } from "react";
import { DailyCheckin } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Database } from "lucide-react";

export default function MigrateScores() {
  const [status, setStatus] = useState("idle"); // idle, scanning, migrating, complete, error
  const [stats, setStats] = useState({ total: 0, needsMigration: 0, migrated: 0 });
  const [error, setError] = useState("");

  const scanData = async () => {
    setStatus("scanning");
    setError("");
    
    try {
      const currentUser = await User.me();
      const allCheckins = await DailyCheckin.filter({ created_by: currentUser.email });
      
      // Check which ones need migration (score < 20 indicates old 0-10 scale)
      const needsMigration = allCheckins.filter(c => c.frequency_today < 20);
      
      setStats({
        total: allCheckins.length,
        needsMigration: needsMigration.length,
        migrated: 0
      });
      
      setStatus("idle");
    } catch (err) {
      console.error("Error scanning data:", err);
      setError(err.message);
      setStatus("error");
    }
  };

  const migrateData = async () => {
    setStatus("migrating");
    setError("");
    
    try {
      const currentUser = await User.me();
      const allCheckins = await DailyCheckin.filter({ created_by: currentUser.email });
      
      // Only migrate scores that look like old 0-10 scale (< 20)
      const needsMigration = allCheckins.filter(c => c.frequency_today < 20);
      
      let migrated = 0;
      
      for (const checkin of needsMigration) {
        const newScore = Math.round(checkin.frequency_today * 10);
        await DailyCheckin.update(checkin.id, {
          frequency_today: newScore
        });
        migrated++;
        
        // Update progress
        setStats(prev => ({ ...prev, migrated }));
      }
      
      setStatus("complete");
      setStats(prev => ({ ...prev, migrated }));
      
    } catch (err) {
      console.error("Error migrating data:", err);
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#0F172A]">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-[#1A2035]/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-[#2DD4BF]" />
              Score Migration Tool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                This tool will convert old check-in scores from the 0-10 scale to the new 0-100 scale.
                Only run this once!
              </AlertDescription>
            </Alert>

            {status === "idle" && stats.total === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Click "Scan Data" to check if you have old check-ins that need migration.
                </p>
                <Button
                  onClick={scanData}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Scan Data
                </Button>
              </div>
            )}

            {status === "scanning" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2DD4BF] mx-auto mb-4"></div>
                <p className="text-gray-400">Scanning your check-ins...</p>
              </div>
            )}

            {stats.total > 0 && status !== "migrating" && status !== "complete" && (
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Total Check-ins:</span>
                    <span className="font-bold text-white">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Need Migration:</span>
                    <span className="font-bold text-yellow-400">{stats.needsMigration}</span>
                  </div>
                </div>

                {stats.needsMigration > 0 ? (
                  <div className="space-y-4">
                    <Alert className="bg-blue-500/10 border-blue-500/30">
                      <AlertDescription className="text-blue-200">
                        Found {stats.needsMigration} check-ins with old scores (e.g., 6.2 → 62).
                        Click "Migrate Now" to update them.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={migrateData}
                        className="flex-1 bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
                      >
                        Migrate Now
                      </Button>
                      <Button
                        onClick={scanData}
                        variant="outline"
                        className="border-slate-700 text-gray-300"
                      >
                        Re-scan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert className="bg-green-500/10 border-green-500/30">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <AlertDescription className="text-green-200">
                      All check-ins are already using the 0-100 scale. No migration needed!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {status === "migrating" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2DD4BF] mx-auto mb-4"></div>
                <p className="text-gray-400 mb-2">Migrating your data...</p>
                <p className="text-[#2DD4BF] font-bold">
                  {stats.migrated} of {stats.needsMigration} updated
                </p>
              </div>
            )}

            {status === "complete" && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Migration Complete!</h3>
                <p className="text-gray-400 mb-4">
                  Successfully updated {stats.migrated} check-ins to the new 0-100 scale.
                </p>
                <Button
                  onClick={() => window.location.href = "/"}
                  className="bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {status === "error" && (
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <AlertDescription className="text-red-200">
                  Error: {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1A2035]/80 border-slate-700/50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-white mb-2">How it works:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Scans all your check-ins</li>
              <li>• Identifies scores below 20 (old 0-10 scale)</li>
              <li>• Multiplies them by 10 (e.g., 6.2 → 62)</li>
              <li>• Leaves new scores (already 0-100) unchanged</li>
              <li>• Safe to run - won't break existing data</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}