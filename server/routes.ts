import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSubjectSchema, insertTopicSchema, insertExamSchema, 
  insertStudySessionSchema, insertUserSchema 
} from "@shared/schema";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  const currentUserId = 1; // Mock current user for demo

  // User routes
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(currentUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/user/settings", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(currentUserId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects(currentUserId);
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to get subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse({
        ...req.body,
        userId: currentUserId,
      });
      const subject = await storage.createSubject(subjectData);
      res.status(201).json(subject);
    } catch (error) {
      res.status(400).json({ message: "Invalid subject data" });
    }
  });

  app.patch("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(id, updates);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(400).json({ message: "Invalid subject data" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubject(id);
      if (!success) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Topic routes
  app.get("/api/subjects/:subjectId/topics", async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const topics = await storage.getTopics(subjectId);
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get topics" });
    }
  });

  app.post("/api/subjects/:subjectId/topics", async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const topicData = insertTopicSchema.parse({
        ...req.body,
        subjectId,
      });
      const topic = await storage.createTopic(topicData);
      res.status(201).json(topic);
    } catch (error) {
      res.status(400).json({ message: "Invalid topic data" });
    }
  });

  app.patch("/api/topics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertTopicSchema.partial().parse(req.body);
      const topic = await storage.updateTopic(id, updates);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (error) {
      res.status(400).json({ message: "Invalid topic data" });
    }
  });

  app.delete("/api/topics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTopic(id);
      if (!success) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete topic" });
    }
  });

  // Exam routes
  app.get("/api/exams", async (req, res) => {
    try {
      const exams = await storage.getExams(currentUserId);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exams" });
    }
  });

  app.post("/api/exams", async (req, res) => {
    try {
      const examData = insertExamSchema.parse({
        ...req.body,
        userId: currentUserId,
      });
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      res.status(400).json({ message: "Invalid exam data" });
    }
  });

  app.patch("/api/exams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertExamSchema.partial().parse(req.body);
      const exam = await storage.updateExam(id, updates);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      res.status(400).json({ message: "Invalid exam data" });
    }
  });

  app.delete("/api/exams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExam(id);
      if (!success) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  // Study session routes
  app.get("/api/study-sessions", async (req, res) => {
    try {
      const { date } = req.query;
      const sessions = await storage.getStudySessions(currentUserId, date as string);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get study sessions" });
    }
  });

  app.post("/api/study-sessions/generate", async (req, res) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Clear existing sessions for today
      const existingSessions = await storage.getStudySessions(currentUserId, today);
      for (const session of existingSessions) {
        await storage.deleteStudySession(session.id);
      }

      // Get user settings
      const user = await storage.getUser(currentUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get subjects, topics, and exams
      const subjects = await storage.getSubjects(currentUserId);
      const exams = await storage.getExams(currentUserId);
      
      // Collect all topics with priorities
      const allTopics = [];
      for (const subject of subjects) {
        const topics = await storage.getTopics(subject.id);
        allTopics.push(...topics);
      }

      // Smart algorithm to prioritize topics
      const prioritizedTopics = allTopics
        .filter(topic => !topic.completed)
        .map(topic => {
          let priority = 0;
          
          // Base priority from difficulty (harder topics get more time)
          priority += topic.difficulty * 1.5;
          
          // Boost priority for incomplete topics
          priority += 3;
          
          // Check if topic is part of upcoming exams
          const relatedExams = exams.filter(exam => 
            exam.topicIds.includes(topic.id) && 
            new Date(exam.date) >= new Date()
          );
          
          if (relatedExams.length > 0) {
            const closestExam = relatedExams.reduce((closest, exam) => 
              new Date(exam.date) < new Date(closest.date) ? exam : closest
            );
            
            const daysUntilExam = Math.ceil((new Date(closestExam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            // Higher priority for closer exams
            if (daysUntilExam <= 7) priority += 5;
            else if (daysUntilExam <= 14) priority += 3;
            else if (daysUntilExam <= 30) priority += 2;
          }
          
          // Boost priority for topics not studied recently
          if (topic.lastStudied) {
            const daysSinceStudied = Math.ceil((new Date().getTime() - new Date(topic.lastStudied).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceStudied > 7) priority += 2;
            if (daysSinceStudied > 14) priority += 3;
          } else {
            // Never studied - high priority
            priority += 4;
          }
          
          return { ...topic, calculatedPriority: Math.min(priority, 10) };
        })
        .sort((a, b) => b.calculatedPriority - a.calculatedPriority);

      // Generate study sessions
      const sessions = [];
      let currentTime = 9; // 9 AM
      const availableHours = user.dailyStudyHours;
      let hoursScheduled = 0;
      const minSessionDuration = 0.5; // 30 minutes minimum
      const maxSessionDuration = 2; // 2 hours maximum

      for (const topic of prioritizedTopics) {
        if (hoursScheduled >= availableHours) break;
        
        // Calculate session duration based on difficulty and priority
        let sessionDuration = minSessionDuration;
        
        if (topic.difficulty >= 4) {
          sessionDuration = Math.min(1.5, availableHours - hoursScheduled);
        } else if (topic.difficulty >= 3) {
          sessionDuration = Math.min(1, availableHours - hoursScheduled);
        } else {
          sessionDuration = Math.min(0.75, availableHours - hoursScheduled);
        }
        
        // Ensure we don't exceed max session duration
        sessionDuration = Math.min(sessionDuration, maxSessionDuration);
        
        if (sessionDuration >= minSessionDuration) {
          const endTime = currentTime + sessionDuration;
          
          const session = await storage.createStudySession({
            userId: currentUserId,
            subjectId: topic.subjectId,
            topicId: topic.id,
            scheduledDate: today,
            startTime: `${Math.floor(currentTime)}:${String(Math.floor((currentTime % 1) * 60)).padStart(2, '0')}`,
            endTime: `${Math.floor(endTime)}:${String(Math.floor((endTime % 1) * 60)).padStart(2, '0')}`,
            completed: false,
          });
          
          sessions.push(session);
          currentTime = endTime + (user.breakDuration / 60); // Add break time
          hoursScheduled += sessionDuration;
        }
      }

      res.json(sessions);
    } catch (error) {
      console.error("Error generating study plan:", error);
      res.status(500).json({ message: "Failed to generate study plan" });
    }
  });

  app.patch("/api/study-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertStudySessionSchema.partial().parse(req.body);
      
      if (updates.completed && !updates.completedAt) {
        updates.completedAt = new Date();
      }
      
      const session = await storage.updateStudySession(id, updates);
      if (!session) {
        return res.status(404).json({ message: "Study session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaySessions = await storage.getStudySessions(currentUserId, today);
      const completedSessions = todaySessions.filter(s => s.completed);
      const totalSessions = todaySessions.length;
      
      const exams = await storage.getExams(currentUserId);
      const upcomingExams = exams.filter(exam => new Date(exam.date) >= new Date());
      
      // Calculate study streak (simplified)
      const studyStreak = 12; // Mock for now
      
      // Calculate progress
      const totalMinutes = todaySessions.reduce((total, session) => {
        const start = session.startTime.split(':').map(Number);
        const end = session.endTime.split(':').map(Number);
        const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
        return total + duration;
      }, 0);
      
      const completedMinutes = completedSessions.reduce((total, session) => {
        const start = session.startTime.split(':').map(Number);
        const end = session.endTime.split(':').map(Number);
        const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
        return total + duration;
      }, 0);

      res.json({
        todayProgress: {
          completed: Math.round(completedMinutes / 60 * 10) / 10,
          total: Math.round(totalMinutes / 60 * 10) / 10,
        },
        upcomingExamsCount: upcomingExams.length,
        studyStreak,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
