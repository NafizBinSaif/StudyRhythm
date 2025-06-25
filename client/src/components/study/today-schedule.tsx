import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Circle, Calculator, FlaskRound, Atom, BookOpen } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { StudySession, Subject, Topic } from "@shared/schema";

interface TodayScheduleProps {
  sessions: StudySession[];
  onGenerateNewPlan: () => void;
  isGenerating: boolean;
}

export default function TodaySchedule({ sessions, onGenerateNewPlan, isGenerating }: TodayScheduleProps) {
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: allTopics = [] } = useQuery({
    queryKey: ["/api/topics/all"],
    queryFn: async () => {
      const topicsArrays = await Promise.all(
        subjects.map((subject: Subject) =>
          fetch(`/api/subjects/${subject.id}/topics`).then(res => res.json())
        )
      );
      return topicsArrays.flat();
    },
    enabled: subjects.length > 0,
  });

  const toggleSessionMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      apiRequest("PATCH", `/api/study-sessions/${id}`, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const getSubjectIcon = (subjectId: number) => {
    const subject = subjects.find((s: Subject) => s.id === subjectId);
    const iconMap = {
      "fa-calculator": Calculator,
      "fa-flask": FlaskRound,
      "fa-atom": Atom,
      "fa-book": BookOpen,
    };
    return iconMap[subject?.icon as keyof typeof iconMap] || BookOpen;
  };

  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s: Subject) => s.id === subjectId);
    return subject?.name || `Subject ${subjectId}`;
  };

  const getTopicName = (topicId: number | null) => {
    if (!topicId) return "General Review";
    const topic = allTopics.find((t: Topic) => t.id === topicId);
    return topic?.name || `Topic ${topicId}`;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-success/20 text-success";
    if (difficulty <= 3) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Today's Schedule</CardTitle>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No study sessions scheduled for today</p>
            <Button onClick={onGenerateNewPlan} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Study Plan"}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {sessions.map((session) => {
                const SubjectIcon = getSubjectIcon(session.subjectId);
                return (
                  <div
                    key={session.id}
                    className={`flex items-center p-4 rounded-lg border-l-4 ${
                      session.completed
                        ? "bg-success/5 border-success"
                        : "bg-background/50 border-primary"
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <SubjectIcon className="text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{getSubjectName(session.subjectId)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getTopicName(session.topicId)}
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge className="mr-2" variant="secondary">
                          {session.startTime} - {session.endTime}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleSessionMutation.mutate({
                          id: session.id,
                          completed: !session.completed,
                        })
                      }
                      disabled={toggleSessionMutation.isPending}
                    >
                      {session.completed ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
            
            <Button 
              onClick={onGenerateNewPlan} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate New Daily Plan"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
