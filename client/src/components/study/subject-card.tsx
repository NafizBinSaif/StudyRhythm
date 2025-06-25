import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Calculator, FlaskRound, Atom, BookOpen, Star, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Subject, Topic } from "@shared/schema";

interface SubjectCardProps {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (id: number) => void;
}

export default function SubjectCard({ subject, onEdit, onDelete }: SubjectCardProps) {
  const { data: topics = [] } = useQuery({
    queryKey: ["/api/subjects", subject.id, "topics"],
  });

  const getSubjectIcon = (icon: string) => {
    const icons = {
      "fa-calculator": Calculator,
      "fa-flask": FlaskRound,
      "fa-atom": Atom,
      "fa-book": BookOpen,
    };
    return icons[icon as keyof typeof icons] || BookOpen;
  };

  const SubjectIcon = getSubjectIcon(subject.icon);
  
  const completedTopics = topics.filter((topic: Topic) => topic.completed).length;
  const totalTopics = topics.length;
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  
  const avgDifficulty = totalTopics > 0 
    ? (topics.reduce((sum: number, topic: Topic) => sum + topic.difficulty, 0) / totalTopics).toFixed(1)
    : "0";

  // Mock study time calculation
  const weeklyStudyTime = (totalTopics * 0.5).toFixed(1);

  const getIconColor = () => {
    if (subject.color === "#FF6F3C") return "text-primary";
    if (subject.color === "#6CBBA9") return "text-success";
    if (subject.color === "#F06C6C") return "text-warning";
    return "text-primary";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <SubjectIcon className={`h-6 w-6 ${getIconColor()}`} />
            </div>
            <div>
              <h4 className="font-medium">{subject.name}</h4>
              <p className="text-sm text-muted-foreground">
                {totalTopics} {totalTopics === 1 ? 'topic' : 'topics'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(subject)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Star className="h-4 w-4 text-warning mr-1" />
              <span>Avg: {avgDifficulty}/5</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{weeklyStudyTime}h/week</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
