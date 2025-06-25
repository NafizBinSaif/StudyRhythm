import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import type { Exam, Subject } from "@shared/schema";

export default function UpcomingExams() {
  const { data: exams = [] } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s: Subject) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const getExamUrgency = (date: string) => {
    const daysLeft = differenceInDays(new Date(date), new Date());
    if (daysLeft <= 7) return { color: "bg-destructive", text: `${daysLeft} days left` };
    if (daysLeft <= 14) return { color: "bg-warning", text: `${daysLeft} days left` };
    return { color: "bg-success", text: `${daysLeft} days left` };
  };

  const upcomingExams = exams
    .filter((exam: Exam) => new Date(exam.date) >= new Date())
    .sort((a: Exam, b: Exam) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Upcoming Exams</CardTitle>
          <Button variant="ghost" size="sm">
            <CalendarPlus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {upcomingExams.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No upcoming exams</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingExams.map((exam: Exam) => {
              const urgency = getExamUrgency(exam.date);
              const mockProgress = Math.floor(Math.random() * 80) + 20; // Mock progress
              
              return (
                <div key={exam.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{exam.name}</h4>
                    <Badge className={urgency.color}>
                      {urgency.text}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {getSubjectName(exam.subjectId)} • {exam.topicIds.length} topics
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {format(new Date(exam.date), 'PPP')}
                    </span>
                    <div className="flex items-center">
                      <Progress value={mockProgress} className="w-16 h-1.5 mr-2" />
                      <span className="text-xs text-muted-foreground">{mockProgress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
