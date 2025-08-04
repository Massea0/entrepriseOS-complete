import { ky } from '@/services/api'
import type {
  Employee,
  Department,
  Position,
  LeaveRequest,
  AttendanceRecord,
  PerformanceReview,
  JobPosting,
  JobApplication,
  HRAnalytics,
  OrgChartNode,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateLeaveRequest,
  CreateJobPostingRequest,
  LeaveBalance,
  Interview,
  EmployeeStatus,
  LeaveType
} from '../types/hr.types'

/**
 * HR Service
 * Handles all HR-related API calls
 */
export class HRService {
  private static readonly ENDPOINTS = {
    // Employees
    EMPLOYEES: 'employees',
    EMPLOYEE_BY_ID: (id: string) => `employees/${id}`,
    EMPLOYEE_AVATAR: (id: string) => `employees/${id}/avatar`,
    EMPLOYEE_DEACTIVATE: (id: string) => `employees/${id}/deactivate`,
    
    // Departments
    DEPARTMENTS: 'departments',
    DEPARTMENT_BY_ID: (id: string) => `departments/${id}`,
    DEPARTMENT_EMPLOYEES: (id: string) => `departments/${id}/employees`,
    
    // Positions
    POSITIONS: 'positions',
    POSITION_BY_ID: (id: string) => `positions/${id}`,
    
    // Organizational Chart
    ORG_CHART: 'org-chart',
    ORG_CHART_DEPARTMENT: (departmentId: string) => `org-chart/department/${departmentId}`,
    
    // Leave Management
    LEAVE_REQUESTS: 'leave-requests',
    LEAVE_REQUEST_BY_ID: (id: string) => `leave-requests/${id}`,
    LEAVE_BALANCES: 'leave-balances',
    EMPLOYEE_LEAVE_BALANCES: (employeeId: string) => `employees/${employeeId}/leave-balances`,
    APPROVE_LEAVE: (id: string) => `leave-requests/${id}/approve`,
    REJECT_LEAVE: (id: string) => `leave-requests/${id}/reject`,
    CANCEL_LEAVE: (id: string) => `leave-requests/${id}/cancel`,
    
    // Attendance
    ATTENDANCE: 'attendance',
    EMPLOYEE_ATTENDANCE: (employeeId: string) => `employees/${employeeId}/attendance`,
    CLOCK_IN: 'attendance/clock-in',
    CLOCK_OUT: 'attendance/clock-out',
    
    // Performance Reviews
    PERFORMANCE_REVIEWS: 'performance-reviews',
    REVIEW_BY_ID: (id: string) => `performance-reviews/${id}`,
    EMPLOYEE_REVIEWS: (employeeId: string) => `employees/${employeeId}/reviews`,
    SUBMIT_REVIEW: (id: string) => `performance-reviews/${id}/submit`,
    
    // Recruitment
    JOB_POSTINGS: 'job-postings',
    JOB_POSTING_BY_ID: (id: string) => `job-postings/${id}`,
    JOB_APPLICATIONS: 'job-applications',
    APPLICATION_BY_ID: (id: string) => `job-applications/${id}`,
    POSTING_APPLICATIONS: (jobId: string) => `job-postings/${jobId}/applications`,
    SCHEDULE_INTERVIEW: (applicationId: string) => `job-applications/${applicationId}/interviews`,
    
    // Analytics
    HR_ANALYTICS: 'hr/analytics',
    DEPARTMENT_ANALYTICS: (departmentId: string) => `hr/analytics/department/${departmentId}`,
    
    // Search
    SEARCH_EMPLOYEES: 'employees/search',
    EMPLOYEE_DIRECTORY: 'employees/directory'
  } as const

  // Employee Management

  /**
   * Get all employees
   */
  static async getEmployees(params?: {
    department?: string
    status?: EmployeeStatus[]
    search?: string
    page?: number
    limit?: number
  }): Promise<{ employees: Employee[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.EMPLOYEES}?${searchParams.toString()}`).json<{
      employees: Employee[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Get employee by ID
   */
  static async getEmployee(id: string): Promise<Employee> {
    const response = await ky.get(this.ENDPOINTS.EMPLOYEE_BY_ID(id)).json<Employee>()
    return response
  }

  /**
   * Create new employee
   */
  static async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    const response = await ky.post(this.ENDPOINTS.EMPLOYEES, {
      json: data
    }).json<Employee>()
    return response
  }

  /**
   * Update employee
   */
  static async updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await ky.patch(this.ENDPOINTS.EMPLOYEE_BY_ID(id), {
      json: data
    }).json<Employee>()
    return response
  }

  /**
   * Deactivate employee
   */
  static async deactivateEmployee(id: string, reason?: string): Promise<void> {
    await ky.post(this.ENDPOINTS.EMPLOYEE_DEACTIVATE(id), {
      json: { reason }
    })
  }

  /**
   * Upload employee avatar
   */
  static async uploadEmployeeAvatar(id: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await ky.post(this.ENDPOINTS.EMPLOYEE_AVATAR(id), {
      body: formData
    }).json<{ avatarUrl: string }>()
    
    return response
  }

  // Department Management

  /**
   * Get all departments
   */
  static async getDepartments(): Promise<Department[]> {
    const response = await ky.get(this.ENDPOINTS.DEPARTMENTS).json<Department[]>()
    return response
  }

  /**
   * Get department by ID
   */
  static async getDepartment(id: string): Promise<Department> {
    const response = await ky.get(this.ENDPOINTS.DEPARTMENT_BY_ID(id)).json<Department>()
    return response
  }

  /**
   * Get department employees
   */
  static async getDepartmentEmployees(id: string): Promise<Employee[]> {
    const response = await ky.get(this.ENDPOINTS.DEPARTMENT_EMPLOYEES(id)).json<Employee[]>()
    return response
  }

  // Position Management

  /**
   * Get all positions
   */
  static async getPositions(departmentId?: string): Promise<Position[]> {
    const url = departmentId 
      ? `${this.ENDPOINTS.POSITIONS}?departmentId=${departmentId}`
      : this.ENDPOINTS.POSITIONS
    
    const response = await ky.get(url).json<Position[]>()
    return response
  }

  /**
   * Get position by ID
   */
  static async getPosition(id: string): Promise<Position> {
    const response = await ky.get(this.ENDPOINTS.POSITION_BY_ID(id)).json<Position>()
    return response
  }

  // Organizational Chart

  /**
   * Get organizational chart
   */
  static async getOrgChart(departmentId?: string): Promise<OrgChartNode[]> {
    const url = departmentId 
      ? this.ENDPOINTS.ORG_CHART_DEPARTMENT(departmentId)
      : this.ENDPOINTS.ORG_CHART
    
    const response = await ky.get(url).json<OrgChartNode[]>()
    return response
  }

  // Leave Management

  /**
   * Get leave requests
   */
  static async getLeaveRequests(params?: {
    employeeId?: string
    status?: string[]
    type?: LeaveType[]
    startDate?: Date
    endDate?: Date
  }): Promise<LeaveRequest[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.LEAVE_REQUESTS}?${searchParams.toString()}`
    ).json<LeaveRequest[]>()
    
    return response
  }

  /**
   * Create leave request
   */
  static async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    const response = await ky.post(this.ENDPOINTS.LEAVE_REQUESTS, {
      json: data
    }).json<LeaveRequest>()
    return response
  }

  /**
   * Get leave request by ID
   */
  static async getLeaveRequest(id: string): Promise<LeaveRequest> {
    const response = await ky.get(this.ENDPOINTS.LEAVE_REQUEST_BY_ID(id)).json<LeaveRequest>()
    return response
  }

  /**
   * Approve leave request
   */
  static async approveLeaveRequest(id: string, notes?: string): Promise<LeaveRequest> {
    const response = await ky.post(this.ENDPOINTS.APPROVE_LEAVE(id), {
      json: { notes }
    }).json<LeaveRequest>()
    return response
  }

  /**
   * Reject leave request
   */
  static async rejectLeaveRequest(id: string, reason: string): Promise<LeaveRequest> {
    const response = await ky.post(this.ENDPOINTS.REJECT_LEAVE(id), {
      json: { reason }
    }).json<LeaveRequest>()
    return response
  }

  /**
   * Cancel leave request
   */
  static async cancelLeaveRequest(id: string): Promise<LeaveRequest> {
    const response = await ky.post(this.ENDPOINTS.CANCEL_LEAVE(id)).json<LeaveRequest>()
    return response
  }

  /**
   * Get employee leave balances
   */
  static async getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    const response = await ky.get(this.ENDPOINTS.EMPLOYEE_LEAVE_BALANCES(employeeId)).json<LeaveBalance[]>()
    return response
  }

  // Attendance Management

  /**
   * Get attendance records
   */
  static async getAttendanceRecords(params?: {
    employeeId?: string
    startDate?: Date
    endDate?: Date
    status?: string[]
  }): Promise<AttendanceRecord[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.ATTENDANCE}?${searchParams.toString()}`
    ).json<AttendanceRecord[]>()
    
    return response
  }

  /**
   * Clock in
   */
  static async clockIn(location?: {
    type: 'office' | 'remote' | 'client_site'
    address?: string
    coordinates?: { latitude: number; longitude: number }
  }): Promise<AttendanceRecord> {
    const response = await ky.post(this.ENDPOINTS.CLOCK_IN, {
      json: { location }
    }).json<AttendanceRecord>()
    return response
  }

  /**
   * Clock out
   */
  static async clockOut(): Promise<AttendanceRecord> {
    const response = await ky.post(this.ENDPOINTS.CLOCK_OUT).json<AttendanceRecord>()
    return response
  }

  // Performance Reviews

  /**
   * Get performance reviews
   */
  static async getPerformanceReviews(params?: {
    employeeId?: string
    reviewerId?: string
    status?: string[]
    type?: string[]
  }): Promise<PerformanceReview[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.PERFORMANCE_REVIEWS}?${searchParams.toString()}`
    ).json<PerformanceReview[]>()
    
    return response
  }

  /**
   * Create performance review
   */
  static async createPerformanceReview(data: {
    employeeId: string
    type: string
    period: { start: Date; end: Date }
    dueDate: Date
  }): Promise<PerformanceReview> {
    const response = await ky.post(this.ENDPOINTS.PERFORMANCE_REVIEWS, {
      json: data
    }).json<PerformanceReview>()
    return response
  }

  /**
   * Update performance review
   */
  static async updatePerformanceReview(
    id: string, 
    data: Partial<PerformanceReview>
  ): Promise<PerformanceReview> {
    const response = await ky.patch(this.ENDPOINTS.REVIEW_BY_ID(id), {
      json: data
    }).json<PerformanceReview>()
    return response
  }

  /**
   * Submit performance review
   */
  static async submitPerformanceReview(id: string): Promise<PerformanceReview> {
    const response = await ky.post(this.ENDPOINTS.SUBMIT_REVIEW(id)).json<PerformanceReview>()
    return response
  }

  // Recruitment

  /**
   * Get job postings
   */
  static async getJobPostings(params?: {
    status?: string[]
    department?: string
    search?: string
  }): Promise<JobPosting[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.JOB_POSTINGS}?${searchParams.toString()}`
    ).json<JobPosting[]>()
    
    return response
  }

  /**
   * Create job posting
   */
  static async createJobPosting(data: CreateJobPostingRequest): Promise<JobPosting> {
    const response = await ky.post(this.ENDPOINTS.JOB_POSTINGS, {
      json: data
    }).json<JobPosting>()
    return response
  }

  /**
   * Update job posting
   */
  static async updateJobPosting(id: string, data: Partial<JobPosting>): Promise<JobPosting> {
    const response = await ky.patch(this.ENDPOINTS.JOB_POSTING_BY_ID(id), {
      json: data
    }).json<JobPosting>()
    return response
  }

  /**
   * Close job posting
   */
  static async closeJobPosting(id: string): Promise<JobPosting> {
    const response = await ky.patch(this.ENDPOINTS.JOB_POSTING_BY_ID(id), {
      json: { status: 'closed' }
    }).json<JobPosting>()
    return response
  }

  /**
   * Get job applications
   */
  static async getJobApplications(jobPostingId?: string): Promise<JobApplication[]> {
    const url = jobPostingId 
      ? this.ENDPOINTS.POSTING_APPLICATIONS(jobPostingId)
      : this.ENDPOINTS.JOB_APPLICATIONS
    
    const response = await ky.get(url).json<JobApplication[]>()
    return response
  }

  /**
   * Update job application
   */
  static async updateJobApplication(
    id: string, 
    data: Partial<JobApplication>
  ): Promise<JobApplication> {
    const response = await ky.patch(this.ENDPOINTS.APPLICATION_BY_ID(id), {
      json: data
    }).json<JobApplication>()
    return response
  }

  /**
   * Schedule interview
   */
  static async scheduleInterview(
    applicationId: string, 
    interviewData: Partial<Interview>
  ): Promise<Interview> {
    const response = await ky.post(this.ENDPOINTS.SCHEDULE_INTERVIEW(applicationId), {
      json: interviewData
    }).json<Interview>()
    return response
  }

  // Analytics

  /**
   * Get HR analytics
   */
  static async getHRAnalytics(
    startDate: Date,
    endDate: Date,
    departmentId?: string
  ): Promise<HRAnalytics> {
    const searchParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    if (departmentId) {
      searchParams.append('departmentId', departmentId)
    }

    const response = await ky.get(
      `${this.ENDPOINTS.HR_ANALYTICS}?${searchParams.toString()}`
    ).json<HRAnalytics>()
    
    return response
  }

  // Search and Directory

  /**
   * Search employees
   */
  static async searchEmployees(query: string, filters?: {
    department?: string[]
    position?: string[]
    status?: EmployeeStatus[]
  }): Promise<Employee[]> {
    const searchParams = new URLSearchParams({ q: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.SEARCH_EMPLOYEES}?${searchParams.toString()}`
    ).json<Employee[]>()
    
    return response
  }

  /**
   * Get employee directory
   */
  static async getEmployeeDirectory(): Promise<Employee[]> {
    const response = await ky.get(this.ENDPOINTS.EMPLOYEE_DIRECTORY).json<Employee[]>()
    return response
  }
}

/**
 * HR Utilities
 * Helper functions for HR management
 */
export class HRUtils {
  /**
   * Calculate employee tenure
   */
  static calculateTenure(hireDate: Date): {
    years: number
    months: number
    totalMonths: number
  } {
    const now = new Date()
    const hire = new Date(hireDate)
    
    const totalMonths = (now.getFullYear() - hire.getFullYear()) * 12 + 
                       (now.getMonth() - hire.getMonth())
    
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    
    return { years, months, totalMonths }
  }

  /**
   * Calculate leave days between dates
   */
  static calculateLeaveDays(startDate: Date, endDate: Date, excludeWeekends = true): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    let days = 0
    
    const current = new Date(start)
    while (current <= end) {
      if (!excludeWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
        days++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  /**
   * Get employee status color
   */
  static getEmployeeStatusColor(status: EmployeeStatus): string {
    const colors = {
      active: 'text-green-600 bg-green-100',
      inactive: 'text-gray-600 bg-gray-100',
      on_leave: 'text-orange-600 bg-orange-100',
      terminated: 'text-red-600 bg-red-100',
      suspended: 'text-red-600 bg-red-100',
      probation: 'text-yellow-600 bg-yellow-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Get leave type color
   */
  static getLeaveTypeColor(type: LeaveType): string {
    const colors = {
      vacation: 'text-blue-600 bg-blue-100',
      sick: 'text-red-600 bg-red-100',
      maternity: 'text-pink-600 bg-pink-100',
      paternity: 'text-cyan-600 bg-cyan-100',
      personal: 'text-purple-600 bg-purple-100',
      bereavement: 'text-gray-600 bg-gray-100',
      medical: 'text-orange-600 bg-orange-100',
      unpaid: 'text-gray-600 bg-gray-100',
      compensatory: 'text-green-600 bg-green-100',
      study: 'text-indigo-600 bg-indigo-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Format employment type
   */
  static formatEmploymentType(type: string): string {
    const types = {
      full_time: 'Temps plein',
      part_time: 'Temps partiel',
      contract: 'Contractuel',
      intern: 'Stagiaire',
      consultant: 'Consultant',
      freelance: 'Freelance'
    }
    return types[type as keyof typeof types] || type
  }

  /**
   * Format leave type
   */
  static formatLeaveType(type: LeaveType): string {
    const types = {
      vacation: 'Congés payés',
      sick: 'Congé maladie',
      maternity: 'Congé maternité',
      paternity: 'Congé paternité',
      personal: 'Congé personnel',
      bereavement: 'Congé de deuil',
      medical: 'Congé médical',
      unpaid: 'Congé sans solde',
      compensatory: 'Congé compensateur',
      study: 'Congé formation'
    }
    return types[type] || type
  }

  /**
   * Calculate performance rating color
   */
  static getPerformanceRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-600 bg-green-100'
    if (rating >= 3.5) return 'text-blue-600 bg-blue-100'
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-100'
    if (rating >= 1.5) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  /**
   * Check if employee is on probation
   */
  static isOnProbation(employee: Employee): boolean {
    if (!employee.probationEndDate) return false
    return new Date() < new Date(employee.probationEndDate)
  }

  /**
   * Calculate days until probation ends
   */
  static getDaysUntilProbationEnds(employee: Employee): number | null {
    if (!employee.probationEndDate) return null
    
    const now = new Date()
    const probationEnd = new Date(employee.probationEndDate)
    const diffTime = probationEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  /**
   * Get upcoming leave requests
   */
  static getUpcomingLeaves(leaveRequests: LeaveRequest[], days = 30): LeaveRequest[] {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    return leaveRequests
      .filter(leave => 
        leave.status === 'approved' &&
        new Date(leave.startDate) >= now &&
        new Date(leave.startDate) <= futureDate
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  /**
   * Build organizational hierarchy
   */
  static buildOrgHierarchy(employees: Employee[]): OrgChartNode[] {
    const employeeMap = new Map<string, Employee>()
    const rootNodes: OrgChartNode[] = []
    
    // Create employee map
    employees.forEach(emp => employeeMap.set(emp.id, emp))
    
    // Build hierarchy
    employees.forEach(employee => {
      if (!employee.manager) {
        // This is a root node (CEO, etc.)
        rootNodes.push({
          employee,
          children: [],
          level: 0
        })
      }
    })
    
    // Recursively build children
    const buildChildren = (node: OrgChartNode): void => {
      const children = employees
        .filter(emp => emp.manager?.id === node.employee.id)
        .map(emp => ({
          employee: emp,
          children: [],
          level: node.level + 1
        }))
      
      node.children = children
      children.forEach(child => buildChildren(child))
    }
    
    rootNodes.forEach(buildChildren)
    
    return rootNodes
  }
}