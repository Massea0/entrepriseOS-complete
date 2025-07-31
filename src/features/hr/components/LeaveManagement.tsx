'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { DatePicker } from '@/components/ui/date-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'
import { 
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  CheckIcon,
  XIcon,
  EyeIcon,
  FilterIcon,
  DownloadIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  UserIcon,
  FileTextIcon
} from 'lucide-react'
import type { 
  LeaveRequest, 
  LeaveBalance, 
  LeaveType, 
  LeaveStatus,
  Employee,
  CreateLeaveRequest
} from '../types/hr.types'
import { HRUtils } from '../services/hr.service'

interface LeaveManagementProps {
  leaveRequests: LeaveRequest[]
  leaveBalances: LeaveBalance[]
  employees: Employee[]
  currentUser: Employee
  isLoading?: boolean
  onRequestLeave?: (data: CreateLeaveRequest) => Promise<void>
  onApproveLeave?: (id: string) => Promise<void>
  onRejectLeave?: (id: string, reason: string) => Promise<void>
  onCancelLeave?: (id: string) => Promise<void>
  className?: string
}

interface LeaveRequestFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateLeaveRequest) => Promise<void>
  employees: Employee[]
  currentUser: Employee
}

interface LeaveBalanceCardProps {
  balance: LeaveBalance
  className?: string
}

// Leave balance card component
const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ balance, className }) => {
  const usagePercentage = balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0
  const remainingPercentage = balance.allocated > 0 ? (balance.remaining / balance.allocated) * 100 : 0

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">{HRUtils.formatLeaveType(balance.type)}</h3>
          <Badge className={HRUtils.getLeaveTypeColor(balance.type)}>
            {balance.year}
          </Badge>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Utilisé</span>
              <span className="font-medium">{balance.used}/{balance.allocated} jours</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Restant</span>
              <span className="font-medium text-green-600">{balance.remaining} jours</span>
            </div>
            <Progress value={remainingPercentage} className="h-2 bg-green-100" />
          </div>

          {balance.pending > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">En attente</span>
                <span className="font-medium text-orange-600">{balance.pending} jours</span>
              </div>
            </div>
          )}

          {balance.carryOver && balance.carryOver > 0 && (
            <div className="text-xs text-muted-foreground">
              Report: {balance.carryOver} jours
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Leave request form modal
const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  currentUser
}) => {
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    type: 'vacation',
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    delegateToId: undefined,
    delegationNotes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      onClose()
      // Reset form
      setFormData({
        type: 'vacation',
        startDate: new Date(),
        endDate: new Date(),
        reason: '',
        delegateToId: undefined,
        delegationNotes: ''
      })
    } catch (error) {
      console.error('Failed to submit leave request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    return HRUtils.calculateLeaveDays(formData.startDate, formData.endDate)
  }

  const totalDays = calculateDays()

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Demande de congé</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type and dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type de congé</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as LeaveType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Congés payés</SelectItem>
                  <SelectItem value="sick">Congé maladie</SelectItem>
                  <SelectItem value="personal">Congé personnel</SelectItem>
                  <SelectItem value="maternity">Congé maternité</SelectItem>
                  <SelectItem value="paternity">Congé paternité</SelectItem>
                  <SelectItem value="bereavement">Congé de deuil</SelectItem>
                  <SelectItem value="medical">Congé médical</SelectItem>
                  <SelectItem value="unpaid">Congé sans solde</SelectItem>
                  <SelectItem value="compensatory">Congé compensateur</SelectItem>
                  <SelectItem value="study">Congé formation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Durée calculée</label>
              <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">
                  {totalDays} jour{totalDays !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date de début</label>
              <DatePicker
                value={formData.startDate}
                onSelect={(date) => setFormData(prev => ({ 
                  ...prev, 
                  startDate: date || new Date(),
                  endDate: date && date > prev.endDate ? date : prev.endDate
                }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date de fin</label>
              <DatePicker
                value={formData.endDate}
                onSelect={(date) => setFormData(prev => ({ 
                  ...prev, 
                  endDate: date || prev.startDate
                }))}
                minDate={formData.startDate}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium mb-2 block">Motif (optionnel)</label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Expliquez la raison de votre demande..."
              className="min-h-[80px]"
            />
          </div>

          {/* Delegation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Déléguer à (optionnel)</label>
              <Select
                value={formData.delegateToId || ''}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  delegateToId: value || undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un collègue" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(emp => emp.id !== currentUser.id && emp.status === 'active')
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.user.firstName} {employee.user.lastName} - {employee.position.title}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {formData.delegateToId && (
              <div>
                <label className="text-sm font-medium mb-2 block">Notes de délégation</label>
                <Textarea
                  value={formData.delegationNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, delegationNotes: e.target.value }))}
                  placeholder="Instructions pour le délégué..."
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Résumé de la demande</h4>
            <div className="text-sm space-y-1">
              <div><strong>Type:</strong> {HRUtils.formatLeaveType(formData.type)}</div>
              <div><strong>Période:</strong> {formData.startDate.toLocaleDateString('fr-FR')} - {formData.endDate.toLocaleDateString('fr-FR')}</div>
              <div><strong>Durée:</strong> {totalDays} jour{totalDays !== 1 ? 's' : ''}</div>
              {formData.delegateToId && (
                <div><strong>Délégué:</strong> {employees.find(e => e.id === formData.delegateToId)?.user.firstName} {employees.find(e => e.id === formData.delegateToId)?.user.lastName}</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || totalDays === 0}>
              {isSubmitting ? 'Envoi...' : 'Soumettre la demande'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  )
}

// Leave requests table
const LeaveRequestsTable: React.FC<{
  requests: LeaveRequest[]
  currentUser: Employee
  onApprove?: (id: string) => Promise<void>
  onReject?: (id: string, reason: string) => Promise<void>
  onCancel?: (id: string) => Promise<void>
  onView?: (request: LeaveRequest) => void
}> = ({ requests, currentUser, onApprove, onReject, onCancel, onView }) => {
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const getStatusColor = (status: LeaveStatus): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      taken: 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: LeaveStatus): string => {
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      cancelled: 'Annulé',
      taken: 'Pris'
    }
    return labels[status] || status
  }

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return
    
    try {
      await onReject?.(id, rejectReason)
      setRejectingId(null)
      setRejectReason('')
    } catch (error) {
      console.error('Failed to reject leave request:', error)
    }
  }

  const canApproveReject = (request: LeaveRequest): boolean => {
    // User can approve/reject if they are the manager or have HR permissions
    return request.employee.id !== currentUser.id && 
           (request.employee.manager?.id === currentUser.id || 
            currentUser.user.permissions.includes('manage_leave'))
  }

  const canCancel = (request: LeaveRequest): boolean => {
    // User can cancel their own pending requests
    return request.employee.id === currentUser.id && 
           request.status === 'pending'
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune demande de congé</h3>
          <p className="text-sm text-muted-foreground">
            Les demandes de congé apparaîtront ici
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes de congé</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employé</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de demande</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar
                      name={`${request.employee.user.firstName} ${request.employee.user.lastName}`}
                      src={request.employee.user.avatar}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">
                        {request.employee.user.firstName} {request.employee.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.employee.position?.title}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={HRUtils.getLeaveTypeColor(request.type)}>
                    {HRUtils.formatLeaveType(request.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(request.startDate).toLocaleDateString('fr-FR')}</div>
                    <div className="text-muted-foreground">
                      → {new Date(request.endDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{request.days} jour{request.days !== 1 ? 's' : ''}</span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(request)}
                      className="h-6 w-6 p-0"
                    >
                      <EyeIcon className="h-3 w-3" />
                    </Button>

                    {canApproveReject(request) && request.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove?.(request.id)}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                        >
                          <CheckIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRejectingId(request.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </>
                    )}

                    {canCancel(request) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel?.(request.id)}
                        className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700"
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Reject modal */}
        <Modal open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Rejeter la demande de congé</ModalTitle>
            </ModalHeader>
            <div className="p-6">
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Raison du rejet</label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Expliquez pourquoi cette demande est rejetée..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setRejectingId(null)}>
                  Annuler
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => rejectingId && handleReject(rejectingId)}
                  disabled={!rejectReason.trim()}
                >
                  Rejeter
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </CardContent>
    </Card>
  )
}

// Main Leave Management component
export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  leaveRequests,
  leaveBalances,
  employees,
  currentUser,
  isLoading = false,
  onRequestLeave,
  onApproveLeave,
  onRejectLeave,
  onCancelLeave,
  className
}) => {
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Filter requests by tab
  const filteredRequests = useMemo(() => {
    switch (activeTab) {
      case 'my-requests':
        return leaveRequests.filter(req => req.employee.id === currentUser.id)
      case 'team-requests':
        return leaveRequests.filter(req => 
          req.employee.manager?.id === currentUser.id || 
          currentUser.user.permissions.includes('manage_leave')
        )
      case 'all-requests':
        return leaveRequests
      default:
        return leaveRequests
    }
  }, [leaveRequests, activeTab, currentUser])

  // Upcoming leaves
  const upcomingLeaves = useMemo(() => {
    return HRUtils.getUpcomingLeaves(leaveRequests.filter(req => req.status === 'approved'))
  }, [leaveRequests])

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des congés</h2>
          <p className="text-sm text-muted-foreground">
            Gérez vos demandes de congé et consultez vos soldes
          </p>
        </div>

        <Button onClick={() => setIsRequestFormOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Demander un congé
        </Button>
      </div>

      {/* Leave Balances */}
      <div>
        <h3 className="text-lg font-medium mb-4">Soldes de congés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveBalances.map((balance) => (
            <LeaveBalanceCard key={`${balance.type}-${balance.year}`} balance={balance} />
          ))}
        </div>
      </div>

      {/* Upcoming Leaves */}
      {upcomingLeaves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircleIcon className="h-5 w-5 text-orange-500" />
              <span>Congés à venir (30 prochains jours)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingLeaves.slice(0, 5).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={`${leave.employee.user.firstName} ${leave.employee.user.lastName}`}
                      src={leave.employee.user.avatar}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">
                        {leave.employee.user.firstName} {leave.employee.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {HRUtils.formatLeaveType(leave.type)} • {leave.days} jour{leave.days !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(leave.startDate).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dans {Math.ceil((new Date(leave.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jour{Math.ceil((new Date(leave.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Requests */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="my-requests">Mes demandes</TabsTrigger>
          <TabsTrigger value="team-requests">Mon équipe</TabsTrigger>
          {currentUser.user.permissions.includes('manage_leave') && (
            <TabsTrigger value="all-requests">Toutes les demandes</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {leaveRequests.filter(r => r.status === 'pending').length}
                    </div>
                    <div className="text-xs text-muted-foreground">En attente</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {leaveRequests.filter(r => r.status === 'approved').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Approuvées</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUpIcon className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {upcomingLeaves.length}
                    </div>
                    <div className="text-xs text-muted-foreground">À venir</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <LeaveRequestsTable
            requests={filteredRequests.slice(0, 10)}
            currentUser={currentUser}
            onApprove={onApproveLeave}
            onReject={onRejectLeave}
            onCancel={onCancelLeave}
            onView={setSelectedRequest}
          />
        </TabsContent>

        <TabsContent value="my-requests">
          <LeaveRequestsTable
            requests={filteredRequests}
            currentUser={currentUser}
            onApprove={onApproveLeave}
            onReject={onRejectLeave}
            onCancel={onCancelLeave}
            onView={setSelectedRequest}
          />
        </TabsContent>

        <TabsContent value="team-requests">
          <LeaveRequestsTable
            requests={filteredRequests}
            currentUser={currentUser}
            onApprove={onApproveLeave}
            onReject={onRejectLeave}
            onCancel={onCancelLeave}
            onView={setSelectedRequest}
          />
        </TabsContent>

        <TabsContent value="all-requests">
          <LeaveRequestsTable
            requests={filteredRequests}
            currentUser={currentUser}
            onApprove={onApproveLeave}
            onReject={onRejectLeave}
            onCancel={onCancelLeave}
            onView={setSelectedRequest}
          />
        </TabsContent>
      </Tabs>

      {/* Leave Request Form Modal */}
      {onRequestLeave && (
        <LeaveRequestForm
          isOpen={isRequestFormOpen}
          onClose={() => setIsRequestFormOpen(false)}
          onSubmit={onRequestLeave}
          employees={employees}
          currentUser={currentUser}
        />
      )}

      {/* Leave Request Detail Modal */}
      <Modal open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Détails de la demande de congé</ModalTitle>
          </ModalHeader>
          {selectedRequest && (
            <div className="p-6 space-y-4">
              {/* Request details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Employé</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar
                      name={`${selectedRequest.employee.user.firstName} ${selectedRequest.employee.user.lastName}`}
                      src={selectedRequest.employee.user.avatar}
                      size="sm"
                    />
                    <span className="text-sm">
                      {selectedRequest.employee.user.firstName} {selectedRequest.employee.user.lastName}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="mt-1">
                    <Badge className={HRUtils.getLeaveTypeColor(selectedRequest.type)}>
                      {HRUtils.formatLeaveType(selectedRequest.type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Période</label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedRequest.startDate).toLocaleDateString('fr-FR')} - {new Date(selectedRequest.endDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Durée</label>
                  <div className="mt-1 text-sm font-medium">
                    {selectedRequest.days} jour{selectedRequest.days !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {selectedRequest.reason && (
                <div>
                  <label className="text-sm font-medium">Motif</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedRequest.reason}
                  </div>
                </div>
              )}

              {selectedRequest.delegateTo && (
                <div>
                  <label className="text-sm font-medium">Délégué à</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar
                      name={`${selectedRequest.delegateTo.user.firstName} ${selectedRequest.delegateTo.user.lastName}`}
                      src={selectedRequest.delegateTo.user.avatar}
                      size="sm"
                    />
                    <span className="text-sm">
                      {selectedRequest.delegateTo.user.firstName} {selectedRequest.delegateTo.user.lastName}
                    </span>
                  </div>
                  {selectedRequest.delegationNotes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Notes: {selectedRequest.delegationNotes}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

LeaveManagement.displayName = 'LeaveManagement'