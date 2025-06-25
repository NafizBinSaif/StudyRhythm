import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calculator, FlaskRound, Atom, BookOpen, Microscope, Globe } from "lucide-react";
import type { Subject } from "@shared/schema";

const subjectFormSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  icon: z.string(),
  color: z.string(),
});

type SubjectFormData = z.infer<typeof subjectFormSchema>;

interface SubjectFormProps {
  subject?: Subject | null;
  onSubmit: (data: SubjectFormData) => void;
  isLoading: boolean;
}

const iconOptions = [
  { value: "fa-calculator", label: "Calculator", icon: Calculator },
  { value: "fa-flask", label: "FlaskRound", icon: FlaskRound },
  { value: "fa-atom", label: "Atom", icon: Atom },
  { value: "fa-book", label: "Book", icon: BookOpen },
  { value: "fa-microscope", label: "Microscope", icon: Microscope },
  { value: "fa-globe", label: "Globe", icon: Globe },
];

const colorOptions = [
  { value: "#FF6F3C", label: "Primary Orange", color: "bg-primary" },
  { value: "#6CBBA9", label: "Success Teal", color: "bg-success" },
  { value: "#F06C6C", label: "Warning Coral", color: "bg-warning" },
  { value: "#8B5CF6", label: "Purple", color: "bg-purple-500" },
  { value: "#10B981", label: "Green", color: "bg-green-500" },
  { value: "#F59E0B", label: "Yellow", color: "bg-yellow-500" },
];

export default function SubjectForm({ subject, onSubmit, isLoading }: SubjectFormProps) {
  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: subject?.name || "",
      icon: subject?.icon || "fa-book",
      color: subject?.color || "#FF6F3C",
    },
  });

  const handleSubmit = (data: SubjectFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="subject-name">Subject Name</FormLabel>
              <FormControl>
                <Input 
                  id="subject-name"
                  placeholder="e.g., Mathematics, Chemistry..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : subject ? "Update Subject" : "Create Subject"}
        </Button>
      </form>
    </Form>
  );
}
