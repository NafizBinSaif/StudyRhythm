import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { Exam, Subject, Topic } from "@shared/schema";

const examFormSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  subjectId: z.number().min(1, "Subject is required"),
  date: z.date({
    required_error: "Exam date is required",
  }),
  topicIds: z.array(z.number()).min(1, "At least one topic must be selected"),
});

type ExamFormData = z.infer<typeof examFormSchema>;

interface ExamFormProps {
  exam?: Exam | null;
  subjects: Subject[];
  onSubmit: (data: ExamFormData) => void;
  isLoading: boolean;
}

export default function ExamForm({ exam, subjects, onSubmit, isLoading }: ExamFormProps) {
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      name: exam?.name || "",
      subjectId: exam?.subjectId || 0,
      date: exam?.date ? new Date(exam.date) : undefined,
      topicIds: exam?.topicIds || [],
    },
  });

  const selectedSubjectId = form.watch("subjectId");

  const { data: topics = [] } = useQuery({
    queryKey: ["/api/subjects", selectedSubjectId, "topics"],
    enabled: selectedSubjectId > 0,
  });

  const handleSubmit = (data: ExamFormData) => {
    onSubmit({
      ...data,
      date: data.date,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exam Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Midterm Exam, Final..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Exam Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSubjectId > 0 && topics.length > 0 && (
          <FormField
            control={form.control}
            name="topicIds"
            render={() => (
              <FormItem>
                <FormLabel>Topics to Review</FormLabel>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {topics.map((topic: Topic) => (
                    <FormField
                      key={topic.id}
                      control={form.control}
                      name="topicIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={topic.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(topic.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, topic.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== topic.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {topic.name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : exam ? "Update Exam" : "Schedule Exam"}
        </Button>
      </form>
    </Form>
  );
}
