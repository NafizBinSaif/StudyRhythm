import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SubjectForm from "@/components/forms/subject-form";
import SubjectCard from "@/components/study/subject-card";
import TopicManagement from "@/components/study/topic-management";
import { Plus, BookOpen } from "lucide-react";
import type { Subject } from "@shared/schema";

export default function Subjects() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const createSubjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/subjects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsFormOpen(false);
      setSelectedSubject(null);
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PATCH", `/api/subjects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsFormOpen(false);
      setSelectedSubject(null);
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
    },
  });

  const handleSubmit = (data: any) => {
    if (selectedSubject) {
      updateSubjectMutation.mutate({ id: selectedSubject.id, data });
    } else {
      createSubjectMutation.mutate(data);
    }
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      deleteSubjectMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            My Subjects
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your subjects and track your progress
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setSelectedSubject(null)}
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" aria-describedby="subject-dialog-description">
            <DialogHeader>
              <DialogTitle>
                {selectedSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
              <div id="subject-dialog-description" className="sr-only">
                {selectedSubject ? "Edit the selected subject's name, icon, and color" : "Create a new subject with name, icon, and color"}
              </div>
            </DialogHeader>
            <SubjectForm
              subject={selectedSubject}
              onSubmit={handleSubmit}
              isLoading={createSubjectMutation.isPending || updateSubjectMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first subject to organize your studies
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject: Subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          
          {/* Topic Management Section */}
          {subjects.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Manage Topics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {subjects.map((subject: Subject) => (
                  <TopicManagement
                    key={subject.id}
                    subject={subject}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
