import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  dailyStudyHours: integer("daily_study_hours").notNull().default(4),
  preferredSessions: text("preferred_sessions").array().notNull().default(["morning"]),
  breakDuration: integer("break_duration").notNull().default(10),
  notifications: boolean("notifications").notNull().default(true),
  examAlerts: boolean("exam_alerts").notNull().default(true),
  progressSummary: boolean("progress_summary").notNull().default(false),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("fa-book"),
  color: text("color").notNull().default("#FF6F3C"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  name: text("name").notNull(),
  difficulty: integer("difficulty").notNull(), // 1-5 scale
  completed: boolean("completed").notNull().default(false),
  lastStudied: date("last_studied"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  topicIds: integer("topic_ids").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  topicId: integer("topic_id"),
  scheduledDate: date("scheduled_date").notNull(),
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "10:30"
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;
