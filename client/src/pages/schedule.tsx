import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Circle, Clock, Plus } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import type { StudySession } from "@shared/schema";

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/study-sessions", format(selectedDate, 'yyyy-MM-dd')],
  });

  const generatePlanMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/study-sessions/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
    },
  });

  const toggleSessionMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      apiRequest("PATCH", `/api/study-sessions/${id}`, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
    },
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(selectedDate), i);
    return date;
  });

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  };

  const isSelected = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Study Schedule
          </h1>
          <p className="text-muted-foreground mt-2">
            Plan and track your daily study sessions
          </p>
        </div>
        
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => generatePlanMutation.mutate()}
          disabled={generatePlanMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {generatePlanMutation.isPending ? "Generating..." : "Generate Plan"}
        </Button>
      </div>

      {/* Week Navigation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Week View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date) => (
              <Button
                key={date.toISOString()}
                variant={isSelected(date) ? "default" : "outline"}
                className={`flex flex-col h-auto py-3 ${isToday(date) ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="text-xs text-muted-foreground">
                  {format(date, 'EEE')}
                </span>
                <span className="text-lg font-semibold">
                  {format(date, 'd')}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {format(selectedDate, 'EEEE, MMMM d')}
              {isToday(selectedDate) && (
                <Badge className="ml-2" variant="secondary">Today</Badge>
              )}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {sessions.length} sessions
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No study sessions scheduled</p>
              <Button 
                onClick={() => generatePlanMutation.mutate()}
                disabled={generatePlanMutation.isPending}
              >
                {generatePlanMutation.isPending ? "Generating..." : "Generate Study Plan"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session: StudySession) => (
                <div
                  key={session.id}
                  className={`flex items-center p-4 rounded-lg border-l-4 ${
                    session.completed
                      ? "bg-success/5 border-success"
                      : "bg-background/50 border-primary"
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="text-primary h-6 w-6" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">Subject {session.subjectId}</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.topicId ? `Topic ${session.topicId}` : "General Review"}
                    </p>
                    <div className="flex items-center mt-1">
                      <Badge className="mr-2" variant="secondary">
                        {session.startTime} - {session.endTime}
                      </Badge>
                      {session.completed && (
                        <Badge className="bg-success/20 text-success">
                          Completed
                        </Badge>
                      )}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}