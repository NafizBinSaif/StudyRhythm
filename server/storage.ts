import { 
  users, subjects, topics, exams, studySessions,
  type User, type InsertUser,
  type Subject, type InsertSubject,
  type Topic, type InsertTopic,
  type Exam, type InsertExam,
  type StudySession, type InsertStudySession
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Subject operations
  getSubjects(userId: number): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, updates: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;

  // Topic operations
  getTopics(subjectId: number): Promise<Topic[]>;
  getTopicsBySubject(subjectId: number): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: number, updates: Partial<InsertTopic>): Promise<Topic | undefined>;
  deleteTopic(id: number): Promise<boolean>;

  // Exam operations
  getExams(userId: number): Promise<Exam[]>;
  getExam(id: number): Promise<Exam | undefined>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, updates: Partial<InsertExam>): Promise<Exam | undefined>;
  deleteExam(id: number): Promise<boolean>;

  // Study session operations
  getStudySessions(userId: number, date?: string): Promise<StudySession[]>;
  getStudySession(id: number): Promise<StudySession | undefined>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, updates: Partial<InsertStudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private topics: Map<number, Topic>;
  private exams: Map<number, Exam>;
  private studySessions: Map<number, StudySession>;
  private currentUserId: number;
  private currentSubjectId: number;
  private currentTopicId: number;
  private currentExamId: number;
  private currentStudySessionId: number;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.topics = new Map();
    this.exams = new Map();
    this.studySessions = new Map();
    this.currentUserId = 1;
    this.currentSubjectId = 1;
    this.currentTopicId = 1;
    this.currentExamId = 1;
    this.currentStudySessionId = 1;

    // Initialize with a default user
    this.createUser({
      username: "demo",
      password: "demo",
      dailyStudyHours: 4,
      preferredSessions: ["morning"],
      breakDuration: 10,
      notifications: true,
      examAlerts: true,
      progressSummary: false,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      dailyStudyHours: insertUser.dailyStudyHours ?? 4,
      preferredSessions: insertUser.preferredSessions ?? ["morning"],
      breakDuration: insertUser.breakDuration ?? 10,
      notifications: insertUser.notifications ?? true,
      examAlerts: insertUser.examAlerts ?? true,
      progressSummary: insertUser.progressSummary ?? false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Subject operations
  async getSubjects(userId: number): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(subject => subject.userId === userId);
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const subject: Subject = { 
      ...insertSubject, 
      id, 
      icon: insertSubject.icon ?? "fa-book",
      color: insertSubject.color ?? "#FF6F3C",
      createdAt: new Date() 
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: number, updates: Partial<InsertSubject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;
    
    const updatedSubject = { ...subject, ...updates };
    this.subjects.set(id, updatedSubject);
    return updatedSubject;
  }

  async deleteSubject(id: number): Promise<boolean> {
    return this.subjects.delete(id);
  }

  // Topic operations
  async getTopics(subjectId: number): Promise<Topic[]> {
    return Array.from(this.topics.values()).filter(topic => topic.subjectId === subjectId);
  }

  async getTopicsBySubject(subjectId: number): Promise<Topic[]> {
    return this.getTopics(subjectId);
  }

  async getTopic(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = this.currentTopicId++;
    const topic: Topic = { 
      ...insertTopic, 
      id,
      completed: insertTopic.completed ?? false,
      lastStudied: insertTopic.lastStudied ?? null,
      createdAt: new Date() 
    };
    this.topics.set(id, topic);
    return topic;
  }

  async updateTopic(id: number, updates: Partial<InsertTopic>): Promise<Topic | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;
    
    const updatedTopic = { ...topic, ...updates };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  async deleteTopic(id: number): Promise<boolean> {
    return this.topics.delete(id);
  }

  // Exam operations
  async getExams(userId: number): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter(exam => exam.userId === userId);
  }

  async getExam(id: number): Promise<Exam | undefined> {
    return this.exams.get(id);
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const id = this.currentExamId++;
    const exam: Exam = { 
      ...insertExam, 
      id, 
      createdAt: new Date() 
    };
    this.exams.set(id, exam);
    return exam;
  }

  async updateExam(id: number, updates: Partial<InsertExam>): Promise<Exam | undefined> {
    const exam = this.exams.get(id);
    if (!exam) return undefined;
    
    const updatedExam = { ...exam, ...updates };
    this.exams.set(id, updatedExam);
    return updatedExam;
  }

  async deleteExam(id: number): Promise<boolean> {
    return this.exams.delete(id);
  }

  // Study session operations
  async getStudySessions(userId: number, date?: string): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(session => {
      const matchesUser = session.userId === userId;
      if (!date) return matchesUser;
      return matchesUser && session.scheduledDate === date;
    });
  }

  async getStudySession(id: number): Promise<StudySession | undefined> {
    return this.studySessions.get(id);
  }

  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = this.currentStudySessionId++;
    const session: StudySession = { 
      ...insertSession, 
      id,
      completed: insertSession.completed ?? false,
      topicId: insertSession.topicId ?? null,
      completedAt: insertSession.completedAt ?? null,
      createdAt: new Date() 
    };
    this.studySessions.set(id, session);
    return session;
  }

  async updateStudySession(id: number, updates: Partial<InsertStudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessions.delete(id);
  }
}

export const storage = new MemStorage();
