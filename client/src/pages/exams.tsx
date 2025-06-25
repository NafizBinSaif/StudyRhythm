import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ExamForm from "@/components/forms/exam-form";
import { Plus, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import type { Exam, Subject } from "@shared/schema";

export default function Exams() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: exams = [] } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const createExamMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/exams", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setIsFormOpen(false);
      setSelectedExam(null);
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PATCH", `/api/exams/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setIsFormOpen(false);
      setSelectedExam(null);
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/exams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
    },
  });

  const handleSubmit = (data: any) => {
    if (selectedExam) {
      updateExamMutation.mutate({ id: selectedExam.id, data });
    } else {
      createExamMutation.mutate(data);
    }
  };

  const handleEdit = (exam: Exam) => {
    setSelectedExam(exam);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      deleteExamMutation.mutate(id);
    }
  };

  const getExamUrgency = (date: string) => {
    const daysLeft = differenceInDays(new Date(date), new Date());
    if (daysLeft < 0) return { color: "bg-gray-500", text: "Past" };
    if (daysLeft <= 7) return { color: "bg-destructive", text: `${daysLeft} days left` };
    if (daysLeft <= 14) return { color: "bg-warning", text: `${daysLeft} days left` };
    return { color: "bg-success", text: `${daysLeft} days left` };
  };

  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s: Subject) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const sortedExams = [...exams].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Exam Schedule
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your upcoming exams and prepare effectively
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setSelectedExam(null)}
            >
              <Plus className="h-4 w-4" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedExam ? "Edit Exam" : "Schedule New Exam"}
              </DialogTitle>
            </DialogHeader>
            <ExamForm
              exam={selectedExam}
              subjects={subjects}
              onSubmit={handleSubmit}
              isLoading={createExamMutation.isPending || updateExamMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {sortedExams.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams scheduled</h3>
            <p className="text-muted-foreground mb-4">
              Add your first exam to start tracking your preparation
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Your First Exam
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedExams.map((exam: Exam) => {
            const urgency = getExamUrgency(exam.date);
            const isPast = differenceInDays(new Date(exam.date), new Date()) < 0;
            
            return (
              <Card key={exam.id} className={`${isPast ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{exam.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {getSubjectName(exam.subjectId)}
                      </p>
                    </div>
                    <Badge className={urgency.color}>
                      {isPast ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {urgency.text}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(exam.date), 'PPP')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {exam.topicIds.length} topics to review
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(exam)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(exam.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
