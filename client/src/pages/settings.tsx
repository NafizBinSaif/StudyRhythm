import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Sun, CloudSun, Moon, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [dailyHours, setDailyHours] = useState([4]);
  const [preferredSessions, setPreferredSessions] = useState(["morning"]);
  const [breakDuration, setBreakDuration] = useState(10);
  const [notifications, setNotifications] = useState(true);
  const [examAlerts, setExamAlerts] = useState(true);
  const [progressSummary, setProgressSummary] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    onSuccess: (data) => {
      if (data) {
        setDailyHours([data.dailyStudyHours]);
        setPreferredSessions(data.preferredSessions || ["morning"]);
        setBreakDuration(data.breakDuration);
        setNotifications(data.notifications);
        setExamAlerts(data.examAlerts);
        setProgressSummary(data.progressSummary);
      }
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/user/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Settings saved",
        description: "Your study preferences have been updated.",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate({
      dailyStudyHours: dailyHours[0],
      preferredSessions,
      breakDuration,
      notifications,
      examAlerts,
      progressSummary,
    });
  };

  const toggleSession = (session: string) => {
    setPreferredSessions(prev => 
      prev.includes(session) 
        ? prev.filter(s => s !== session)
        : [...prev, session]
    );
  };

  const sessionButtons = [
    { key: "morning", label: "Morning", icon: Sun },
    { key: "afternoon", label: "Afternoon", icon: CloudSun },
    { key: "evening", label: "Evening", icon: Moon },
    { key: "night", label: "Night", icon: Star },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Study Preferences
        </h1>
        <p className="text-muted-foreground mt-2">
          Customize your study schedule and notification preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Study Time */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Available Study Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-2">
              <Slider
                value={dailyHours}
                onValueChange={setDailyHours}
                max={12}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1hr</span>
              <span className="text-lg font-semibold text-primary">
                {dailyHours[0]} hours
              </span>
              <span>12hrs</span>
            </div>
          </CardContent>
        </Card>

        {/* Preferred Study Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {sessionButtons.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={preferredSessions.includes(key) ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => toggleSession(key)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Break Duration */}
        <Card>
          <CardHeader>
            <CardTitle>Study Break Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={breakDuration.toString()} onValueChange={(value) => setBreakDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Study session reminders</Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="exam-alerts">Exam date alerts</Label>
              <Switch
                id="exam-alerts"
                checked={examAlerts}
                onCheckedChange={setExamAlerts}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="progress-summary">Daily progress summary</Label>
              <Switch
                id="progress-summary"
                checked={progressSummary}
                onCheckedChange={setProgressSummary}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t">
        <Button 
          size="lg" 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="min-w-[120px]"
        >
          {updateSettingsMutation.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
