import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Topic } from "@shared/schema";

const topicFormSchema = z.object({
  name: z.string().min(1, "Topic name is required"),
  difficulty: z.number().min(1).max(5),
});

type TopicFormData = z.infer<typeof topicFormSchema>;

interface TopicFormProps {
  topic?: Topic | null;
  onSubmit: (data: TopicFormData) => void;
  isLoading: boolean;
}

export default function TopicForm({ topic, onSubmit, isLoading }: TopicFormProps) {
  const form = useForm<TopicFormData>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      name: topic?.name || "",
      difficulty: topic?.difficulty || 3,
    },
  });

  const handleSubmit = (data: TopicFormData) => {
    onSubmit(data);
  };

  const difficultyValue = form.watch("difficulty");

  const getDifficultyLabel = (value: number) => {
    const labels = {
      1: "Very Easy",
      2: "Easy", 
      3: "Medium",
      4: "Hard",
      5: "Very Hard"
    };
    return labels[value as keyof typeof labels];
  };

  const getDifficultyColor = (value: number) => {
    if (value <= 2) return "text-success";
    if (value <= 3) return "text-warning";
    return "text-destructive";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Linear Equations, Photosynthesis..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty Level</FormLabel>
              <FormControl>
                <div className="px-2">
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </FormControl>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Very Easy</span>
                <span className={`font-semibold ${getDifficultyColor(difficultyValue)}`}>
                  {difficultyValue} - {getDifficultyLabel(difficultyValue)}
                </span>
                <span>Very Hard</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : topic ? "Update Topic" : "Add Topic"}
        </Button>
      </form>
    </Form>
  );
}