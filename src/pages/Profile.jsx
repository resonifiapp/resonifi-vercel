import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Award, Loader2, Activity, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ProfilePhotoUpload from "../components/ProfilePhotoUpload";
import BottomNav from "../components/BottomNav";
import Meta from "../components/Meta";
import { feedback } from "../components/lib/feedback";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gender, setGender] = useState("");
  const [lifeStages, setLifeStages] = useState([]);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setGender(userData.gender_identity || "");
        setLifeStages(userData.life_stage_preferences || []);
      } catch (err) {
        console.error('[Profile] Load failed:', err);
        setError('Failed to load profile. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handlePhotoUpdate = (url) => {
    setUser(prev => ({ ...prev, profile_photo: url }));
  };

  const handleLifeStageToggle = (stage) => {
    setLifeStages(prev =>
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    setError(null);

    try {
      const updateData = {
        gender_identity: gender,
        life_stage_preferences: gender === 'female' ? lifeStages : []
      };

      await base44.auth.updateMe(updateData);
      
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setGender(updatedUser.gender_identity || "");
      setLifeStages(updatedUser.life_stage_preferences || []);
      
      feedback('success');
      
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('Profile Preferences Updated', {
          props: { gender: gender || 'not_set', life_stages: lifeStages.length }
        });
      }
      
    } catch (err) {
      console.error('[Profile] Save failed:', err);
      setError('Failed to save preferences. Please try again.');
      feedback('error');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2DD4BF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
        <Card className="bg-[#1A2035]/80 border-slate-700/50 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Meta
        title="Resonifi™ — Profile"
        description="Manage your Resonifi profile and settings"
        url="https://resonifiapp.com/profile"
      />
      
      <div className="page-has-bottom-nav min-h-screen bg-[#0F172A] px-6 pt-6 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>

          <Card className="bg-[#1A2035]/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfilePhotoUpload
                currentPhotoUrl={user?.profile_photo}
                onPhotoUpdate={handlePhotoUpdate}
              />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white">{user?.full_name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Member since</p>
                    <p className="text-white">
                      {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Role</p>
                    <p className="text-white capitalize">{user?.role || 'User'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A2035]/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Personal Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gender" className="text-gray-300 mb-2 block">
                    Gender Identity (Optional)
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender" className="bg-[#0F172A] border-slate-700 text-white">
                      <SelectValue placeholder="Select your gender identity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="nonbinary">Non-binary</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    Helps us provide relevant wellness tracking options
                  </p>
                </div>

                {gender === 'female' && (
                  <div className="space-y-3 p-4 rounded-lg bg-[#0F172A] border border-slate-700">
                    <Label className="text-gray-300">Life Stage Tracking (Optional)</Label>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Menstrual cycle tracking</p>
                        <p className="text-xs text-gray-500">Track energy, mood, and symptoms</p>
                      </div>
                      <Switch
                        id="menstrual"
                        checked={lifeStages.includes('menstrual_cycle')}
                        onCheckedChange={() => handleLifeStageToggle('menstrual_cycle')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Perimenopause/Menopause</p>
                        <p className="text-xs text-gray-500">Track hormonal shifts</p>
                      </div>
                      <Switch
                        id="perimenopause"
                        checked={lifeStages.includes('perimenopause_menopause')}
                        onCheckedChange={() => handleLifeStageToggle('perimenopause_menopause')}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-lg bg-[#0F172A] border border-slate-700">
                  <div>
                    <p className="text-sm text-white">Spiritual Resonance tracking</p>
                    <p className="text-xs text-gray-500">Track gratitude, presence, alignment & more</p>
                  </div>
                  <Switch
                    checked={user?.show_spiritual_resonance || false}
                    onCheckedChange={async (checked) => {
                      try {
                        await base44.auth.updateMe({ show_spiritual_resonance: checked });
                        const updatedUser = await base44.auth.me();
                        setUser(updatedUser);
                        feedback('success');
                      } catch (err) {
                        console.error('[Profile] Update spiritual preference failed:', err);
                        feedback('error');
                      }
                    }}
                  />
                </div>

                <Button
                  onClick={handleSavePreferences}
                  disabled={isSavingPreferences}
                  className="w-full bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
                >
                  {isSavingPreferences ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>

                {gender === 'female' && lifeStages.length > 0 && (
                  <Link to={createPageUrl('CycleTracking')}>
                    <Button className="w-full bg-[#2E6AFF] hover:bg-[#5083FF] text-white">
                      <Activity className="w-4 h-4 mr-2" />
                      Open Cycle Tracking
                    </Button>
                  </Link>
                )}

                {user?.show_spiritual_resonance && (
                  <Link to={createPageUrl('SpiritualResonance')}>
                    <Button className="w-full bg-[#2E6AFF] hover:bg-[#5083FF] text-white">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Open Spiritual Resonance
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </>
  );
}