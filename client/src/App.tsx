import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Subjects from "@/pages/subjects";
import Exams from "@/pages/exams";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pb-20 md:pb-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/subjects" component={Subjects} />
          <Route path="/exams" component={Exams} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
