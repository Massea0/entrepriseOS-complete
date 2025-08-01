'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import { 
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  UsersIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  TrendingUpIcon,
  UserPlusIcon,
  FilterIcon,
  ExpandIcon,
  ShrinkIcon
} from 'lucide-react'
import type { Employee, Department, OrgChartNode, EmployeeStatus } from '../types/hr.types'
// import { HRUtils } from '../services/hr.service' // TODO: Implement HRUtils

// Temporary utility functions until HRUtils is implemented
const HRUtils = {
  calculateTenure: (hireDate?: string) => {
    if (!hireDate) return 'N/A';
    const start = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    if (years > 0) return `${years} an${years > 1 ? 's' : ''}`;
    if (months > 0) return `${months} mois`;
    return 'Nouveau';
  },
  isOnProbation: (employee: any) => {
    if (!employee.hireDate) return false;
    const hireDate = new Date(employee.hireDate);
    const now = new Date();
    const daysSinceHire = Math.floor((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceHire < 90; // 90 days probation
  },
  getDaysUntilProbationEnds: (employee: any) => {
    if (!employee.hireDate) return 0;
    const hireDate = new Date(employee.hireDate);
    const now = new Date();
    const daysSinceHire = Math.floor((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - daysSinceHire);
  },
  getEmployeeStatusColor: (status?: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      onLeave: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status || 'active'] || 'bg-gray-100 text-gray-800';
  },
  formatEmploymentType: (type?: string) => {
    const types: Record<string, string> = {
      fullTime: 'Temps plein',
      partTime: 'Temps partiel',
      contract: 'Contrat',
      intern: 'Stage'
    };
    return types[type || 'fullTime'] || type || 'N/A';
  },
  getPerformanceRatingColor: (rating?: number) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    if (rating >= 4.5) return 'bg-green-100 text-green-800';
    if (rating >= 3.5) return 'bg-blue-100 text-blue-800';
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }
};

interface OrgChartProps {
  orgChart: OrgChartNode[]
  departments: Department[]
  isLoading?: boolean
  onExpandNode?: (employeeId: string) => void
  onCollapseNode?: (employeeId: string) => void
  onEmployeeSelect?: (employee: Employee) => void
  className?: string
}

interface EmployeeCardProps {
  node: OrgChartNode
  onToggle: (employeeId: string, isExpanded: boolean) => void
  onEmployeeClick: (employee: Employee) => void
  isSearchMatch?: boolean
  className?: string
}

// Employee card component
const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  node, 
  onToggle, 
  onEmployeeClick,
  isSearchMatch = false,
  className 
}) => {
  const { employee, children, isExpanded = false } = node
  const hasDirectReports = children.length > 0

  const handleToggle = () => {
    if (hasDirectReports) {
      onToggle(employee.id, !isExpanded)
    }
  }

  const handleEmployeeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEmployeeClick(employee)
  }

  const tenure = HRUtils.calculateTenure(employee.hireDate)
  const isOnProbation = HRUtils.isOnProbation(employee)

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer border-l-4',
        isSearchMatch && 'ring-2 ring-primary/50 border-l-primary',
        !isSearchMatch && 'border-l-muted',
        className
      )}
      onClick={handleToggle}
    >
      <CardContent className="p-4">
        {/* Employee Header */}
        <div className="flex items-start space-x-3">
          <Avatar
            name={`${employee.firstName} ${employee.lastName}`}
            src={employee.avatar}
            size="lg"
            className="ring-2 ring-background"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 
                  className="font-semibold text-base truncate hover:text-primary cursor-pointer"
                  onClick={handleEmployeeClick}
                >
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {employee.position.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {employee.department.name}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 ml-2">
                <Badge className={HRUtils.getEmployeeStatusColor(employee.status)}>
                  {employee.status === 'active' ? 'Actif' : 
                   employee.status === 'on_leave' ? 'En congé' :
                   employee.status === 'probation' ? 'Probation' : employee.status}
                </Badge>
                
                {hasDirectReports && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggle()
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Employee Details */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <MailIcon className="h-3 w-3 mr-1" />
                                    <span className="truncate">{employee.email}</span>
              </div>
              
              {employee.phone && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <PhoneIcon className="h-3 w-3 mr-1" />
                  <span>{employee.phone}</span>
                </div>
              )}

              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>
                  {tenure.years > 0 && `${tenure.years}a `}
                  {tenure.months > 0 && `${tenure.months}m`}
                  {tenure.years === 0 && tenure.months === 0 && '< 1m'}
                </span>
              </div>

              {employee.workLocation && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPinIcon className="h-3 w-3 mr-1" />
                  <span className="capitalize">
                    {employee.workLocation === 'remote' ? 'Télétravail' :
                     employee.workLocation === 'hybrid' ? 'Hybride' : 'Bureau'}
                  </span>
                </div>
              )}
            </div>

            {/* Performance & Direct Reports */}
            {(employee.performanceRating || hasDirectReports) && (
              <div className="mt-3 flex items-center justify-between">
                {employee.performanceRating && (
                  <div className="flex items-center space-x-1">
                    <TrendingUpIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      {employee.performanceRating.toFixed(1)}/5
                    </span>
                  </div>
                )}
                
                {hasDirectReports && (
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {children.length} rapport{children.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Probation warning */}
            {isOnProbation && (
              <div className="mt-2">
                <Badge variant="warning" className="text-xs">
                  Période d'essai
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recursive org chart tree component
const OrgChartTree: React.FC<{
  nodes: OrgChartNode[]
  onToggle: (employeeId: string, isExpanded: boolean) => void
  onEmployeeClick: (employee: Employee) => void
  searchTerm: string
  level?: number
}> = ({ nodes, onToggle, onEmployeeClick, searchTerm, level = 0 }) => {
  const isSearchMatch = useCallback((employee: Employee, term: string): boolean => {
    if (!term) return false
    
    const searchLower = term.toLowerCase()
    return (
      employee.firstName.toLowerCase().includes(searchLower) ||
      employee.lastName.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.position.title.toLowerCase().includes(searchLower) ||
      employee.department.name.toLowerCase().includes(searchLower) ||
      employee.employeeId.toLowerCase().includes(searchLower)
    )
  }, [])

  return (
    <div className="space-y-4">
      {nodes.map((node) => (
        <div key={node.employee.id} className="relative">
          {/* Connection lines for hierarchy */}
          {level > 0 && (
            <>
              <div 
                className="absolute left-6 -top-4 h-4 w-px bg-border"
                style={{ left: `${level * 24 - 18}px` }}
              />
              <div 
                className="absolute -top-2 w-4 h-px bg-border"
                style={{ left: `${level * 24 - 18}px` }}
              />
            </>
          )}
          
          {/* Employee Card */}
          <div style={{ marginLeft: `${level * 24}px` }}>
            <EmployeeCard
              node={node}
              onToggle={onToggle}
              onEmployeeClick={onEmployeeClick}
              isSearchMatch={isSearchMatch(node.employee, searchTerm)}
            />
          </div>

          {/* Children */}
          {node.isExpanded && node.children.length > 0 && (
            <div className="mt-4">
              <OrgChartTree
                nodes={node.children}
                onToggle={onToggle}
                onEmployeeClick={onEmployeeClick}
                searchTerm={searchTerm}
                level={level + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Employee detail modal
const EmployeeDetailModal: React.FC<{
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
}> = ({ employee, isOpen, onClose }) => {
  if (!employee) return null

  const tenure = HRUtils.calculateTenure(employee.hireDate)
  const isOnProbation = HRUtils.isOnProbation(employee)
  const probationDays = HRUtils.getDaysUntilProbationEnds(employee)

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle className="flex items-center space-x-3">
            <Avatar
                                  name={`${employee.firstName} ${employee.lastName}`}
                    src={employee.avatar}
              size="lg"
            />
            <div>
              <h2 className="text-xl font-semibold">
                                  {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-sm text-muted-foreground font-normal">
                {employee.position.title}
              </p>
            </div>
          </ModalTitle>
        </ModalHeader>

        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Statut</label>
              <div className="mt-1">
                <Badge className={HRUtils.getEmployeeStatusColor(employee.status)}>
                  {employee.status === 'active' ? 'Actif' : employee.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">ID Employé</label>
              <div className="mt-1 text-sm">{employee.employeeId}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Département</label>
              <div className="mt-1 text-sm">{employee.department.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Type d'emploi</label>
              <div className="mt-1 text-sm">
                {HRUtils.formatEmploymentType(employee.employmentType)}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email professionnel</label>
                                    <div className="mt-1 text-sm">{employee.email}</div>
              </div>
              {employee.personalEmail && (
                <div>
                  <label className="text-sm font-medium">Email personnel</label>
                  <div className="mt-1 text-sm">{employee.personalEmail}</div>
                </div>
              )}
              {employee.phone && (
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <div className="mt-1 text-sm">{employee.phone}</div>
                </div>
              )}
              {employee.mobile && (
                <div>
                  <label className="text-sm font-medium">Mobile</label>
                  <div className="mt-1 text-sm">{employee.mobile}</div>
                </div>
              )}
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-lg font-medium mb-3">Emploi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date d'embauche</label>
                <div className="mt-1 text-sm">
                  {new Date(employee.hireDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Ancienneté</label>
                <div className="mt-1 text-sm">
                  {tenure.years > 0 && `${tenure.years} an${tenure.years > 1 ? 's' : ''} `}
                  {tenure.months > 0 && `${tenure.months} mois`}
                  {tenure.years === 0 && tenure.months === 0 && 'Moins d\'un mois'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Lieu de travail</label>
                <div className="mt-1 text-sm capitalize">
                  {employee.workLocation === 'remote' ? 'Télétravail' :
                   employee.workLocation === 'hybrid' ? 'Hybride' : 'Bureau'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Horaires</label>
                <div className="mt-1 text-sm">
                  {employee.workSchedule.hoursPerWeek}h/semaine
                </div>
              </div>
            </div>
          </div>

          {/* Manager and Direct Reports */}
          {(employee.manager || employee.directReports.length > 0) && (
            <div>
              <h3 className="text-lg font-medium mb-3">Hiérarchie</h3>
              <div className="space-y-3">
                {employee.manager && (
                  <div>
                    <label className="text-sm font-medium">Manager</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Avatar
                        name={`${employee.manager.user.firstName} ${employee.manager.user.lastName}`}
                        src={employee.manager.user.avatar}
                        size="sm"
                      />
                      <span className="text-sm">
                        {employee.manager.user.firstName} {employee.manager.user.lastName}
                      </span>
                    </div>
                  </div>
                )}
                
                {employee.directReports.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">
                      Rapports directs ({employee.directReports.length})
                    </label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {employee.directReports.length} employé{employee.directReports.length > 1 ? 's' : ''} 
                      {' '}sous sa responsabilité
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance & Probation */}
          {(employee.performanceRating || isOnProbation) && (
            <div>
              <h3 className="text-lg font-medium mb-3">Performance</h3>
              <div className="space-y-3">
                {employee.performanceRating && (
                  <div>
                    <label className="text-sm font-medium">Note de performance</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge className={HRUtils.getPerformanceRatingColor(employee.performanceRating)}>
                        {employee.performanceRating.toFixed(1)}/5
                      </Badge>
                    </div>
                  </div>
                )}
                
                {isOnProbation && probationDays !== null && (
                  <div>
                    <label className="text-sm font-medium">Période d'essai</label>
                    <div className="mt-1">
                      <Badge variant="warning">
                        {probationDays > 0 
                          ? `${probationDays} jour${probationDays > 1 ? 's' : ''} restant${probationDays > 1 ? 's' : ''}`
                          : 'Se termine aujourd\'hui'
                        }
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills and Certifications */}
          {(employee.skills.length > 0 || employee.certifications.length > 0) && (
            <div>
              <h3 className="text-lg font-medium mb-3">Compétences & Certifications</h3>
              <div className="space-y-3">
                {employee.skills.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Compétences</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {employee.skills.slice(0, 6).map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="text-xs">
                          {skill.name}
                          {skill.level && ` (${skill.level})`}
                        </Badge>
                      ))}
                      {employee.skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{employee.skills.length - 6}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {employee.certifications.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Certifications</label>
                    <div className="mt-1 space-y-1">
                      {employee.certifications.slice(0, 3).map((cert) => (
                        <div key={cert.id} className="text-sm">
                          <span className="font-medium">{cert.name}</span>
                          <span className="text-muted-foreground"> - {cert.issuer}</span>
                        </div>
                      ))}
                      {employee.certifications.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{employee.certifications.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button>
              Modifier
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

// Main OrgChart component
export const OrgChart: React.FC<OrgChartProps> = ({
  orgChart,
  departments,
  isLoading = false,
  onExpandNode,
  onCollapseNode,
  onEmployeeSelect,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [isFullyExpanded, setIsFullyExpanded] = useState(false)

  // Memoized filtered and processed org chart
  const processedOrgChart = useMemo(() => {
    if (!orgChart.length) return []

    // Filter by department if selected
    const filterByDepartment = (nodes: OrgChartNode[]): OrgChartNode[] => {
      if (selectedDepartment === 'all') return nodes

      return nodes
        .map(node => ({
          ...node,
          children: filterByDepartment(node.children)
        }))
        .filter(node => 
          node.employee.department.id === selectedDepartment || 
          node.children.length > 0
        )
    }

    // Apply expansion state
    const applyExpansionState = (nodes: OrgChartNode[]): OrgChartNode[] => {
      return nodes.map(node => ({
        ...node,
        isExpanded: expandedNodes.has(node.employee.id),
        children: applyExpansionState(node.children)
      }))
    }

    let processed = filterByDepartment(orgChart)
    processed = applyExpansionState(processed)

    return processed
  }, [orgChart, selectedDepartment, expandedNodes])

  const handleToggleNode = useCallback((employeeId: string, isExpanded: boolean) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (isExpanded) {
        newSet.add(employeeId)
      } else {
        newSet.delete(employeeId)
      }
      return newSet
    })

    if (isExpanded) {
      onExpandNode?.(employeeId)
    } else {
      onCollapseNode?.(employeeId)
    }
  }, [onExpandNode, onCollapseNode])

  const handleEmployeeClick = useCallback((employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeModalOpen(true)
    onEmployeeSelect?.(employee)
  }, [onEmployeeSelect])

  const handleExpandAll = useCallback(() => {
    const getAllEmployeeIds = (nodes: OrgChartNode[]): string[] => {
      return nodes.reduce((ids, node) => {
        ids.push(node.employee.id)
        ids.push(...getAllEmployeeIds(node.children))
        return ids
      }, [] as string[])
    }

    const allIds = getAllEmployeeIds(orgChart)
    setExpandedNodes(new Set(allIds))
    setIsFullyExpanded(true)
  }, [orgChart])

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set())
    setIsFullyExpanded(false)
  }, [])

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organigramme</h2>
          <p className="text-sm text-muted-foreground">
            Structure organisationnelle de l'entreprise
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={isFullyExpanded ? handleCollapseAll : handleExpandAll}
          >
            {isFullyExpanded ? (
              <ShrinkIcon className="h-4 w-4 mr-2" />
            ) : (
              <ExpandIcon className="h-4 w-4 mr-2" />
            )}
            {isFullyExpanded ? 'Tout réduire' : 'Tout développer'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            )) || null}
          </SelectContent>
        </Select>
      </div>

      {/* Org Chart Tree */}
      {processedOrgChart.length > 0 ? (
        <div className="relative">
          <OrgChartTree
            nodes={processedOrgChart}
            onToggle={handleToggleNode}
            onEmployeeClick={handleEmployeeClick}
            searchTerm={searchTerm}
          />
        </div>
      ) : (
        <Card className="h-64 flex items-center justify-center">
          <div className="text-center">
            <BuildingIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun employé trouvé</h3>
            <p className="text-sm text-muted-foreground">
              {selectedDepartment !== 'all' 
                ? 'Aucun employé dans ce département'
                : 'Aucun employé ne correspond aux critères de recherche'
              }
            </p>
          </div>
        </Card>
      )}

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      />
    </div>
  )
}

OrgChart.displayName = 'OrgChart'