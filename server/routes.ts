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

      // Get subjects and topics
      const subjects = await storage.getSubjects(currentUserId);
      const exams = await storage.getExams(currentUserId);
      
      // Simple algorithm to generate study sessions
      const sessions = [];
      let currentTime = 9; // 9 AM
      const availableHours = user.dailyStudyHours;
      let hoursScheduled = 0;

      for (const subject of subjects) {
        if (hoursScheduled >= availableHours) break;

        const topics = await storage.getTopics(subject.id);
        const incompleteTopic = topics.find(t => !t.completed);
        
        if (incompleteTopic && hoursScheduled < availableHours) {
          const sessionDuration = Math.min(1.5, availableHours - hoursScheduled);
          const endTime = currentTime + sessionDuration;
          
          const session = await storage.createStudySession({
            userId: currentUserId,
            subjectId: subject.id,
            topicId: incompleteTopic.id,
            scheduledDate: today,
            startTime: `${Math.floor(currentTime)}:${String(Math.floor((currentTime % 1) * 60)).padStart(2, '0')}`,
            endTime: `${Math.floor(endTime)}:${String(Math.floor((endTime % 1) * 60)).padStart(2, '0')}`,
            completed: false,
          });
          
          sessions.push(session);
          currentTime = endTime + 0.5; // 30 min break
          hoursScheduled += sessionDuration;
        }
      }

      res.json(sessions);
    } catch (error) {
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
