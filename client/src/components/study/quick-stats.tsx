import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuickStatsProps {
  stats?: {
    todayProgress: {
      completed: number;
      total: number;
    };
    upcomingExamsCount: number;
    studyStreak: number;
  };
}

export default function QuickStats({ stats }: QuickStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const progressPercentage = stats.todayProgress.total > 0 
    ? (stats.todayProgress.completed / stats.todayProgress.total) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Progress</p>
              <p className="text-2xl font-semibold">
                {stats.todayProgress.completed} / {stats.todayProgress.total} hrs
              </p>
            </div>
            <div className="bg-success/10 p-3 rounded-lg">
              <Clock className="text-success text-lg" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Upcoming Exams</p>
              <p className="text-2xl font-semibold">{stats.upcomingExamsCount}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <Calendar className="text-primary text-lg" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {stats.upcomingExamsCount > 0 ? "Stay focused!" : "No exams scheduled"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Study Streak</p>
              <p className="text-2xl font-semibold">{stats.studyStreak} days</p>
            </div>
            <div className="bg-warning/10 p-3 rounded-lg">
              <Flame className="text-warning text-lg" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Keep it up! 🔥</p>
        </CardContent>
      </Card>
    </div>
  );
}
