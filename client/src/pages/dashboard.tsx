import { format } from "date-fns";
import QuickStats from "@/components/study/quick-stats";
import TodaySchedule from "@/components/study/today-schedule";
import UpcomingExams from "@/components/study/upcoming-exams";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Brain, Plus } from "lucide-react";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/study-sessions", format(new Date(), 'yyyy-MM-dd')],
  });

  const generatePlanMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/study-sessions/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
    },
  });

  const userName = "Alex"; // In a real app, this would come from user context

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Good morning, {userName}! 🌅
        </h2>
        <p className="text-muted-foreground">Ready to tackle your study goals today?</p>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Today's Schedule */}
        <TodaySchedule 
          sessions={sessions} 
          onGenerateNewPlan={() => generatePlanMutation.mutate()}
          isGenerating={generatePlanMutation.isPending}
        />

        {/* Upcoming Exams */}
        <UpcomingExams />
      </div>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-20 right-6 md:bottom-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => generatePlanMutation.mutate()}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
