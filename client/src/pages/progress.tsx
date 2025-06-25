import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calendar, Clock, Target, Trophy, TrendingUp } from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import type { Subject, Topic, Exam, StudySession } from "@shared/schema";

export default function ProgressPage() {
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/study-sessions"],
  });

  // Calculate progress metrics
  const totalSubjects = subjects.length;
  const upcomingExams = exams.filter((exam: Exam) => new Date(exam.date) >= new Date()).length;
  const completedSessions = sessions.filter((session: StudySession) => session.completed).length;
  const totalSessions = sessions.length;
  
  const sessionCompletionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Mock weekly progress data
  const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayProgress = Math.floor(Math.random() * 4) + 1; // 1-4 hours
    return {
      date: format(date, 'EEE'),
      hours: dayProgress,
    };
  });

  const totalWeeklyHours = weeklyProgress.reduce((sum, day) => sum + day.hours, 0);
  const avgDailyHours = totalWeeklyHours / 7;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Study Progress
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your study performance and achievements
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Subjects</p>
                <p className="text-2xl font-semibold">{totalSubjects}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Target className="text-primary h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming Exams</p>
                <p className="text-2xl font-semibold">{upcomingExams}</p>
              </div>
              <div className="bg-warning/10 p-3 rounded-lg">
                <Calendar className="text-warning h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Session Rate</p>
                <p className="text-2xl font-semibold">{Math.round(sessionCompletionRate)}%</p>
              </div>
              <div className="bg-success/10 p-3 rounded-lg">
                <Trophy className="text-success h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
                <p className="text-2xl font-semibold">{avgDailyHours.toFixed(1)}h</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Clock className="text-primary h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Study Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.date}</span>
                  <div className="flex items-center gap-3 flex-1 max-w-xs">
                    <Progress value={(day.hours / 4) * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-8">
                      {day.hours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total this week</span>
                <span className="font-semibold">{totalWeeklyHours}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No subjects to track yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjects.map((subject: Subject) => {
                  // Mock progress calculation
                  const progress = Math.floor(Math.random() * 80) + 20;
                  const topicsCompleted = Math.floor(Math.random() * 8) + 2;
                  const totalTopics = topicsCompleted + Math.floor(Math.random() * 5) + 1;
                  
                  return (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {topicsCompleted}/{totalTopics} topics
                          </Badge>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress}% complete</span>
                        <span>{Math.round((totalTopics - topicsCompleted) * 1.5)}h remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-success/5 rounded-lg">
                <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium text-sm">7-Day Streak</p>
                  <p className="text-xs text-muted-foreground">Studied every day this week</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Daily Goal Met</p>
                  <p className="text-xs text-muted-foreground">Completed today's study plan</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg">
                <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-sm">15 Hours This Week</p>
                  <p className="text-xs text-muted-foreground">Above your weekly average</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingExams === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming exams</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams
                  .filter((exam: Exam) => new Date(exam.date) >= new Date())
                  .sort((a: Exam, b: Exam) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 3)
                  .map((exam: Exam) => {
                    const daysLeft = differenceInDays(new Date(exam.date), new Date());
                    const urgencyColor = daysLeft <= 7 ? "text-destructive" : daysLeft <= 14 ? "text-warning" : "text-success";
                    
                    return (
                      <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{exam.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(exam.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={urgencyColor}>
                          {daysLeft} days
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}