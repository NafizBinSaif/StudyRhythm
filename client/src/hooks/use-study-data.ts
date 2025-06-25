import { useQuery } from "@tanstack/react-query";
import type { Subject, Topic, Exam, StudySession } from "@shared/schema";

export function useStudyData() {
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  const { data: todaySessions = [] } = useQuery<StudySession[]>({
    queryKey: ["/api/study-sessions"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch topics for all subjects
  const topicsQueries = subjects.map(subject => 
    useQuery<Topic[]>({
      queryKey: ["/api/subjects", subject.id, "topics"],
      enabled: !!subject.id,
    })
  );

  const allTopics = topicsQueries.reduce((acc, query) => {
    if (query.data) {
      acc.push(...query.data);
    }
    return acc;
  }, [] as Topic[]);

  return {
    subjects,
    exams,
    todaySessions,
    stats,
    allTopics,
    isLoading: topicsQueries.some(q => q.isLoading),
  };
}
