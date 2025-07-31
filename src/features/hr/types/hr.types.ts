import { ReactNode } from 'react'
import { User } from '@/features/auth/types/auth.types'

// Employee status types
export type EmployeeStatus = 
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'terminated'
  | 'suspended'
  | 'probation'

// Employment types
export type EmploymentType = 
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'intern'
  | 'consultant'
  | 'freelance'

// Leave types
export type LeaveType = 
  | 'vacation'
  | 'sick'
  | 'maternity'
  | 'paternity'
  | 'personal'
  | 'bereavement'
  | 'medical'
  | 'unpaid'
  | 'compensatory'
  | 'study'

// Leave status
export type LeaveStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'taken'

// Performance review types
export type ReviewType = 
  | 'annual'
  | 'quarterly'
  | 'monthly'
  | 'probation'
  | 'project'
  | '360_feedback'

// Review status
export type ReviewStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'overdue'

// Recruitment status
export type RecruitmentStatus = 
  | 'open'
  | 'closed'
  | 'on_hold'
  | 'filled'
  | 'cancelled'

// Application status
export type ApplicationStatus = 
  | 'applied'
  | 'screening'
  | 'interview'
  | 'technical_test'
  | 'reference_check'
  | 'offer_made'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'hired'
  | 'rejected'

// Gender types
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

// Employee entity (extends User)
export interface Employee {
  id: string
  user: User
  
  // Personal Information
  employeeId: string
  personalEmail?: string
  phone?: string
  mobile?: string
  address?: Address
  dateOfBirth?: Date
  gender?: Gender
  nationality?: string
  emergencyContact?: EmergencyContact
  
  // Employment Details
  status: EmployeeStatus
  employmentType: EmploymentType
  department: Department
  position: Position
  manager?: Pick<Employee, 'id' | 'user'>
  directReports: string[] // Employee IDs
  
  // Dates
  hireDate: Date
  startDate: Date
  endDate?: Date
  probationEndDate?: Date
  
  // Compensation
  salary?: number
  currency: string
  payGrade?: string
  payFrequency: 'hourly' | 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'annually'
  
  // Work Details
  workLocation: 'office' | 'remote' | 'hybrid'
  workSchedule: WorkSchedule
  timezone: string
  
  // Leave Balances
  leaveBalances: LeaveBalance[]
  
  // Skills and Certifications
  skills: Skill[]
  certifications: Certification[]
  
  // HR Data
  performanceRating?: number
  lastReviewDate?: Date
  nextReviewDate?: Date
  
  // System
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  notes?: string
}

// Address information
export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
}

// Emergency contact
export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
  address?: Address
}

// Department structure
export interface Department {
  id: string
  name: string
  description?: string
  parentId?: string
  managerId?: string
  manager?: Pick<Employee, 'id' | 'user'>
  employees: Employee[]
  budget?: number
  costCenter?: string
  location?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Position/Job title
export interface Position {
  id: string
  title: string
  department: Department
  description?: string
  responsibilities: string[]
  requirements: string[]
  skillsRequired: Skill[]
  minSalary?: number
  maxSalary?: number
  payGrade?: string
  level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Work schedule
export interface WorkSchedule {
  type: 'fixed' | 'flexible' | 'shift'
  hoursPerWeek: number
  workDays: string[] // ['monday', 'tuesday', ...]
  startTime?: string // '09:00'
  endTime?: string // '17:00'
  breakDuration?: number // minutes
  flexibleHours?: {
    coreHours: {
      start: string
      end: string
    }
    earliestStart: string
    latestEnd: string
  }
}

// Skills
export interface Skill {
  id: string
  name: string
  category: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified?: boolean
  verifiedBy?: string
  verifiedAt?: Date
}

// Certifications
export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: Date
  expiryDate?: Date
  credentialId?: string
  credentialUrl?: string
  isVerified: boolean
}

// Leave balance
export interface LeaveBalance {
  type: LeaveType
  allocated: number
  used: number
  pending: number
  remaining: number
  carryOver?: number
  year: number
}

// Leave request
export interface LeaveRequest {
  id: string
  employee: Pick<Employee, 'id' | 'user'>
  type: LeaveType
  startDate: Date
  endDate: Date
  days: number
  reason?: string
  status: LeaveStatus
  
  // Approval workflow
  approver?: Pick<Employee, 'id' | 'user'>
  approvedAt?: Date
  rejectionReason?: string
  
  // Delegation
  delegateTo?: Pick<Employee, 'id' | 'user'>
  delegationNotes?: string
  
  // System
  requestedAt: Date
  updatedAt: Date
  attachments?: string[]
}

// Attendance record
export interface AttendanceRecord {
  id: string
  employee: Pick<Employee, 'id' | 'user'>
  date: Date
  
  // Time tracking
  clockIn?: Date
  clockOut?: Date
  breakStart?: Date
  breakEnd?: Date
  totalHours?: number
  regularHours?: number
  overtimeHours?: number
  
  // Status
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'half_day' | 'on_leave'
  isHoliday: boolean
  isWeekend: boolean
  
  // Location
  location?: {
    type: 'office' | 'remote' | 'client_site'
    address?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  
  // Notes and approvals
  notes?: string
  approvedBy?: Pick<Employee, 'id' | 'user'>
  createdAt: Date
  updatedAt: Date
}

// Performance review
export interface PerformanceReview {
  id: string
  employee: Pick<Employee, 'id' | 'user'>
  reviewer: Pick<Employee, 'id' | 'user'>
  type: ReviewType
  period: {
    start: Date
    end: Date
  }
  
  // Review content
  status: ReviewStatus
  overallRating?: number
  goals: PerformanceGoal[]
  competencies: CompetencyRating[]
  strengths: string[]
  areasForImprovement: string[]
  developmentPlan: DevelopmentPlan[]
  
  // Feedback
  selfAssessment?: string
  managerFeedback?: string
  peerFeedback?: PeerFeedback[]
  
  // Outcomes
  salaryRecommendation?: number
  promotionRecommendation?: boolean
  trainingRecommendations: string[]
  
  // System
  dueDate: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Performance goal
export interface PerformanceGoal {
  id: string
  title: string
  description: string
  category: 'performance' | 'development' | 'behavioral' | 'project'
  target: string
  progress: number // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  completedAt?: Date
}

// Competency rating
export interface CompetencyRating {
  competency: string
  category: string
  currentLevel: number // 1-5
  expectedLevel: number // 1-5
  comments?: string
}

// Development plan
export interface DevelopmentPlan {
  action: string
  timeline: string
  resources: string[]
  support?: string
  success_criteria: string
}

// Peer feedback
export interface PeerFeedback {
  reviewer: Pick<Employee, 'id' | 'user'>
  feedback: string
  rating?: number
  anonymous: boolean
}

// Job posting
export interface JobPosting {
  id: string
  title: string
  department: Department
  position: Position
  description: string
  requirements: string[]
  responsibilities: string[]
  
  // Details
  employmentType: EmploymentType
  location: string
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  benefits: string[]
  
  // Posting details
  status: RecruitmentStatus
  hiringManager: Pick<Employee, 'id' | 'user'>
  recruiter?: Pick<Employee, 'id' | 'user'>
  openings: number
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  
  // Dates
  postedDate: Date
  applicationDeadline?: Date
  targetStartDate?: Date
  closedDate?: Date
  
  // Application settings
  isPublic: boolean
  requiresReferral: boolean
  applicationForm?: ApplicationFormField[]
  
  // Analytics
  viewCount: number
  applicationCount: number
  
  // System
  createdAt: Date
  updatedAt: Date
}

// Application form field
export interface ApplicationFormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file' | 'boolean' | 'date'
  required: boolean
  options?: string[]
  placeholder?: string
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

// Job application
export interface JobApplication {
  id: string
  jobPosting: JobPosting
  
  // Applicant info
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Application data
  resume?: string
  coverLetter?: string
  portfolio?: string
  customFields: Record<string, any>
  
  // Status and tracking
  status: ApplicationStatus
  source: 'website' | 'referral' | 'linkedin' | 'indeed' | 'other'
  referredBy?: Pick<Employee, 'id' | 'user'>
  
  // Interview process
  interviews: Interview[]
  assessments: Assessment[]
  notes: ApplicationNote[]
  
  // Decision
  rating?: number
  tags: string[]
  rejectionReason?: string
  offer?: JobOffer
  
  // System
  appliedAt: Date
  updatedAt: Date
}

// Interview
export interface Interview {
  id: string
  type: 'phone' | 'video' | 'in_person' | 'technical' | 'panel'
  scheduledAt: Date
  duration: number // minutes
  location?: string
  meetingLink?: string
  
  // Participants
  interviewers: Pick<Employee, 'id' | 'user'>[]
  
  // Results
  status: 'scheduled' | 'completed' | 'no_show' | 'cancelled'
  feedback?: string
  rating?: number
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire'
  
  // System
  createdAt: Date
  updatedAt: Date
}

// Assessment
export interface Assessment {
  id: string
  type: 'technical' | 'personality' | 'cognitive' | 'skills'
  name: string
  description?: string
  
  // Assessment data
  assignedAt: Date
  dueDate?: Date
  completedAt?: Date
  score?: number
  maxScore?: number
  result?: 'pass' | 'fail' | 'pending'
  
  // Files
  instructions?: string
  submissionUrl?: string
  feedback?: string
}

// Application note
export interface ApplicationNote {
  id: string
  author: Pick<Employee, 'id' | 'user'>
  content: string
  isPrivate: boolean
  createdAt: Date
}

// Job offer
export interface JobOffer {
  id: string
  position: Position
  
  // Offer details
  salary: number
  currency: string
  benefits: string[]
  startDate: Date
  probationPeriod?: number // months
  
  // Offer process
  sentAt: Date
  expiresAt: Date
  acceptedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  
  // Contract
  contractType: EmploymentType
  workLocation: 'office' | 'remote' | 'hybrid'
  
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
}

// Organizational chart node
export interface OrgChartNode {
  employee: Employee
  children: OrgChartNode[]
  level: number
  isExpanded?: boolean
}

// HR Analytics
export interface HRAnalytics {
  period: {
    start: Date
    end: Date
  }
  
  // Workforce metrics
  totalEmployees: number
  activeEmployees: number
  newHires: number
  terminations: number
  turnoverRate: number
  
  // Demographics
  departmentBreakdown: Record<string, number>
  positionBreakdown: Record<string, number>
  ageDistribution: Record<string, number>
  genderDistribution: Record<string, number>
  
  // Leave metrics
  leaveRequests: number
  approvedLeaves: number
  averageLeaveDays: number
  leaveByType: Record<LeaveType, number>
  
  // Performance metrics
  reviewsCompleted: number
  averageRating: number
  promotions: number
  ratingDistribution: Record<number, number>
  
  // Recruitment metrics
  openPositions: number
  applicationsReceived: number
  interviewsScheduled: number
  hires: number
  timeToHire: number // days
  costPerHire: number
  
  // Attendance metrics
  averageAttendance: number
  lateArrivals: number
  earlyDepartures: number
  absenteeism: number
}

// API request types
export interface CreateEmployeeRequest {
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  employeeId?: string
  departmentId: string
  positionId: string
  managerId?: string
  hireDate: Date
  startDate: Date
  employmentType: EmploymentType
  salary?: number
  workLocation: 'office' | 'remote' | 'hybrid'
  workSchedule: WorkSchedule
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  status?: EmployeeStatus
  personalInfo?: {
    personalEmail?: string
    phone?: string
    mobile?: string
    address?: Address
    dateOfBirth?: Date
    gender?: Gender
    emergencyContact?: EmergencyContact
  }
}

export interface CreateLeaveRequest {
  type: LeaveType
  startDate: Date
  endDate: Date
  reason?: string
  delegateToId?: string
  delegationNotes?: string
}

export interface CreateJobPostingRequest {
  title: string
  departmentId: string
  positionId: string
  description: string
  requirements: string[]
  responsibilities: string[]
  employmentType: EmploymentType
  location: string
  salaryRange?: {
    min: number
    max: number
  }
  benefits?: string[]
  openings: number
  applicationDeadline?: Date
  targetStartDate?: Date
}

// Hook return types
export interface UseEmployeesReturn {
  employees: Employee[]
  isLoading: boolean
  error: string | null
  createEmployee: (data: CreateEmployeeRequest) => Promise<Employee>
  updateEmployee: (id: string, data: UpdateEmployeeRequest) => Promise<Employee>
  deactivateEmployee: (id: string, reason?: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseEmployeeReturn {
  employee: Employee | null
  isLoading: boolean
  error: string | null
  updateEmployee: (data: UpdateEmployeeRequest) => Promise<Employee>
  refresh: () => Promise<void>
}

export interface UseOrgChartReturn {
  orgChart: OrgChartNode[]
  isLoading: boolean
  error: string | null
  expandNode: (employeeId: string) => void
  collapseNode: (employeeId: string) => void
  refresh: () => Promise<void>
}

export interface UseLeaveReturn {
  leaveRequests: LeaveRequest[]
  leaveBalances: LeaveBalance[]
  isLoading: boolean
  error: string | null
  requestLeave: (data: CreateLeaveRequest) => Promise<LeaveRequest>
  approveLeave: (id: string) => Promise<LeaveRequest>
  rejectLeave: (id: string, reason: string) => Promise<LeaveRequest>
  cancelLeave: (id: string) => Promise<LeaveRequest>
  refresh: () => Promise<void>
}

export interface UsePerformanceReturn {
  reviews: PerformanceReview[]
  isLoading: boolean
  error: string | null
  createReview: (employeeId: string, type: ReviewType) => Promise<PerformanceReview>
  updateReview: (id: string, data: Partial<PerformanceReview>) => Promise<PerformanceReview>
  submitReview: (id: string) => Promise<PerformanceReview>
  refresh: () => Promise<void>
}

export interface UseRecruitmentReturn {
  jobPostings: JobPosting[]
  applications: JobApplication[]
  isLoading: boolean
  error: string | null
  createJobPosting: (data: CreateJobPostingRequest) => Promise<JobPosting>
  updateJobPosting: (id: string, data: Partial<JobPosting>) => Promise<JobPosting>
  closeJobPosting: (id: string) => Promise<JobPosting>
  updateApplication: (id: string, data: Partial<JobApplication>) => Promise<JobApplication>
  scheduleInterview: (applicationId: string, interview: Partial<Interview>) => Promise<Interview>
  refresh: () => Promise<void>
}