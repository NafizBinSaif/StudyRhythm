import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TopicForm from "@/components/forms/topic-form";
import { Plus, Star, CheckCircle, Circle, Trash2, Edit } from "lucide-react";
import type { Subject, Topic } from "@shared/schema";

interface TopicManagementProps {
  subject: Subject;
}

export default function TopicManagement({ subject }: TopicManagementProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: topics = [] } = useQuery({
    queryKey: ["/api/subjects", subject.id, "topics"],
  });

  const createTopicMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/subjects/${subject.id}/topics`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", subject.id, "topics"] });
      setIsFormOpen(false);
      setSelectedTopic(null);
    },
  });

  const updateTopicMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PATCH", `/api/topics/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", subject.id, "topics"] });
      setIsFormOpen(false);
      setSelectedTopic(null);
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/topics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", subject.id, "topics"] });
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      apiRequest("PATCH", `/api/topics/${id}`, { 
        completed,
        lastStudied: completed ? new Date().toISOString().split('T')[0] : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", subject.id, "topics"] });
    },
  });

  const handleSubmit = (data: any) => {
    if (selectedTopic) {
      updateTopicMutation.mutate({ id: selectedTopic.id, data });
    } else {
      createTopicMutation.mutate(data);
    }
  };

  const handleEdit = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this topic?")) {
      deleteTopicMutation.mutate(id);
    }
  };

  const completedTopics = topics.filter((topic: Topic) => topic.completed).length;
  const totalTopics = topics.length;
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-success/20 text-success";
    if (difficulty <= 3) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = { 1: "Very Easy", 2: "Easy", 3: "Medium", 4: "Hard", 5: "Very Hard" };
    return labels[difficulty as keyof typeof labels];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{subject.name} Topics</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {completedTopics} of {totalTopics} topics completed
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => setSelectedTopic(null)}
              >
                <Plus className="h-4 w-4" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" aria-describedby="topic-dialog-description">
              <DialogHeader>
                <DialogTitle>
                  {selectedTopic ? "Edit Topic" : "Add New Topic"}
                </DialogTitle>
                <div id="topic-dialog-description" className="sr-only">
                  {selectedTopic ? "Edit the selected topic's name and difficulty level" : "Create a new topic with name and difficulty level"}
                </div>
              </DialogHeader>
              <TopicForm
                topic={selectedTopic}
                onSubmit={handleSubmit}
                isLoading={createTopicMutation.isPending || updateTopicMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
        {totalTopics > 0 && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.round(progress)}% complete</span>
              <span>{totalTopics - completedTopics} remaining</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {topics.length === 0 ? (
          <div className="text-center py-6">
            <Star className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">No topics added yet</p>
            <Button 
              variant="outline" 
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Topic
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic: Topic) => (
              <div
                key={topic.id}
                className={`flex items-center p-3 rounded-lg border ${
                  topic.completed ? 'bg-success/5 border-success/20' : 'bg-background/50'
                }`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-3 p-1"
                  onClick={() =>
                    toggleCompletionMutation.mutate({
                      id: topic.id,
                      completed: !topic.completed,
                    })
                  }
                  disabled={toggleCompletionMutation.isPending}
                >
                  {topic.completed ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${topic.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {topic.name}
                    </h4>
                    <Badge className={getDifficultyColor(topic.difficulty)} variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      {topic.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getDifficultyLabel(topic.difficulty)}
                    {topic.lastStudied && (
                      <span> • Last studied: {new Date(topic.lastStudied).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(topic)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(topic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}