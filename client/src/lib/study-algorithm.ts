import { differenceInDays, format } from "date-fns";
import type { Subject, Topic, Exam, StudySession } from "@shared/schema";

export interface StudyPlanOptions {
  dailyHours: number;
  preferredSessions: string[];
  breakDuration: number;
}

export interface StudyPlanInput {
  subjects: Subject[];
  topics: Topic[];
  exams: Exam[];
  options: StudyPlanOptions;
}

export interface StudySessionPlan {
  subjectId: number;
  topicId?: number;
  duration: number; // in hours
  priority: number; // 1-10, higher is more urgent
  difficulty: number; // 1-5
  examRelated?: boolean;
}

export function generateDailyStudyPlan(input: StudyPlanInput): StudySessionPlan[] {
  const { subjects, topics, exams, options } = input;
  const sessions: StudySessionPlan[] = [];
  
  // Calculate topic priorities based on:
  // 1. Exam urgency (closer exams = higher priority)
  // 2. Topic difficulty
  // 3. Last studied date
  // 4. Completion status
  
  const topicPriorities = topics.map(topic => {
    let priority = 0;
    
    // Base priority from difficulty (harder topics get more time)
    priority += topic.difficulty * 1.5;
    
    // Boost priority for incomplete topics
    if (!topic.completed) {
      priority += 3;
    }
    
    // Check if topic is part of upcoming exams
    const relatedExams = exams.filter(exam => 
      exam.topicIds.includes(topic.id) && 
      new Date(exam.date) >= new Date()
    );
    
    if (relatedExams.length > 0) {
      // Find the closest exam
      const closestExam = relatedExams.reduce((closest, exam) => 
        new Date(exam.date) < new Date(closest.date) ? exam : closest
      );
      
      const daysUntilExam = differenceInDays(new Date(closestExam.date), new Date());
      
      // Higher priority for closer exams
      if (daysUntilExam <= 7) priority += 5;
      else if (daysUntilExam <= 14) priority += 3;
      else if (daysUntilExam <= 30) priority += 2;
    }
    
    // Boost priority for topics not studied recently
    if (topic.lastStudied) {
      const daysSinceStudied = differenceInDays(new Date(), new Date(topic.lastStudied));
      if (daysSinceStudied > 7) priority += 2;
      if (daysSinceStudied > 14) priority += 3;
    } else {
      // Never studied - high priority
      priority += 4;
    }
    
    return { ...topic, calculatedPriority: Math.min(priority, 10) };
  });
  
  // Sort by priority (highest first)
  const sortedTopics = topicPriorities.sort((a, b) => b.calculatedPriority - a.calculatedPriority);
  
  // Allocate study time
  let remainingHours = options.dailyHours;
  const minSessionDuration = 0.5; // 30 minutes minimum
  const maxSessionDuration = 2; // 2 hours maximum
  
  for (const topic of sortedTopics) {
    if (remainingHours < minSessionDuration) break;
    
    // Calculate session duration based on difficulty and priority
    let sessionDuration = minSessionDuration;
    
    if (topic.difficulty >= 4) {
      sessionDuration = Math.min(1.5, remainingHours);
    } else if (topic.difficulty >= 3) {
      sessionDuration = Math.min(1, remainingHours);
    } else {
      sessionDuration = Math.min(0.75, remainingHours);
    }
    
    // Ensure we don't exceed max session duration
    sessionDuration = Math.min(sessionDuration, maxSessionDuration);
    
    sessions.push({
      subjectId: topic.subjectId,
      topicId: topic.id,
      duration: sessionDuration,
      priority: topic.calculatedPriority,
      difficulty: topic.difficulty,
      examRelated: exams.some(exam => 
        exam.topicIds.includes(topic.id) && 
        differenceInDays(new Date(exam.date), new Date()) <= 30
      ),
    });
    
    remainingHours -= sessionDuration;
  }
  
  // If we still have time and no topics, create general subject review sessions
  if (remainingHours >= minSessionDuration && sessions.length === 0) {
    for (const subject of subjects) {
      if (remainingHours < minSessionDuration) break;
      
      const sessionDuration = Math.min(1, remainingHours);
      sessions.push({
        subjectId: subject.id,
        duration: sessionDuration,
        priority: 5,
        difficulty: 3,
        examRelated: false,
      });
      
      remainingHours -= sessionDuration;
    }
  }
  
  return sessions;
}

export function convertToStudySessions(
  plans: StudySessionPlan[], 
  userId: number, 
  date: string
): Omit<StudySession, 'id' | 'createdAt'>[] {
  const sessions: Omit<StudySession, 'id' | 'createdAt'>[] = [];
  
  // Start at 9 AM by default
  let currentTime = 9;
  
  for (const plan of plans) {
    const startTime = currentTime;
    const endTime = currentTime + plan.duration;
    
    sessions.push({
      userId,
      subjectId: plan.subjectId,
      topicId: plan.topicId || null,
      scheduledDate: date,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      completed: false,
      completedAt: null,
    });
    
    // Add break time (default 15 minutes)
    currentTime = endTime + 0.25;
  }
  
  return sessions;
}

function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours % 1) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
