import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@/contexts/theme-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioItem } from '@/components/ui/radio'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarActions } from '@/components/ui/navbar'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsBadge } from '@/components/ui/tabs'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalClose, Dialog } from '@/components/ui/modal'
import { ToasterWithInit, toast, useToast } from '@/components/ui/toast'
import { Alert, AlertTitle, AlertDescription, AlertLink } from '@/components/ui/alert'
import { Badge, BadgeGroup, Tag, StatusBadge } from '@/components/ui/badge'
import { Progress, CircularProgress, MultiProgress } from '@/components/ui/progress'
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'
import { Spinner, SpinnerOverlay, LoadingButton, LoadingDots } from '@/components/ui/spinner'
import { Avatar, AvatarGroup, AvatarWithText } from '@/components/ui/avatar'
import { Container, Grid, Stack, Divider } from '@/components/layout'
import { Search, Mail, Lock, ArrowRight, Heart, MessageCircle, Share2, Home, Users, Settings, BarChart3, Package, ShoppingCart, Info, AlertCircle, Zap, Star, TrendingUp, Activity, UsersIcon } from 'lucide-react'
import '@/styles/globals.css'
import { 
  Table, 
  TableContainer, 
  TableHeader, 
  TableBody, 
  TableFooter,
  TableRow, 
  TableHead, 
  TableCell,
  DataTable,
  type ColumnDefinition 
} from '@/components/ui/table'

// Sample data for tables
interface Employee {
  id: number
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending'
  salary: number
  joinDate: string
  avatar?: string
}

const sampleEmployees: Employee[] = [
  {
    id: 1,
    name: 'Alice Martin',
    email: 'alice.martin@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    status: 'active',
    salary: 75000,
    joinDate: '2023-01-15',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150'
  },
  {
    id: 2,
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    role: 'Product Manager',
    department: 'Product',
    status: 'active',
    salary: 85000,
    joinDate: '2022-08-22'
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol.davis@company.com',
    role: 'UX Designer',
    department: 'Design',
    status: 'pending',
    salary: 65000,
    joinDate: '2024-01-10',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'Sales Manager',
    department: 'Sales',
    status: 'active',
    salary: 70000,
    joinDate: '2021-11-05'
  },
  {
    id: 5,
    name: 'Eva Brown',
    email: 'eva.brown@company.com',
    role: 'Marketing Specialist',
    department: 'Marketing',
    status: 'inactive',
    salary: 55000,
    joinDate: '2023-06-18',
    avatar: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=150'
  }
]

const App = () => {
  const [selectedEmployees, setSelectedEmployees] = React.useState<Set<string | number>>(new Set())
  const [loading, setLoading] = React.useState(false)

  // Column definitions for DataTable
  const employeeColumns: ColumnDefinition<Employee>[] = [
    {
      key: 'name',
      title: 'Employé',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" name={row.name} src={row.avatar} />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Poste',
      sortable: true
    },
    {
      key: 'department',
      title: 'Département',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value === 'active' ? 'online' : value === 'pending' ? 'away' : 'offline'}
          variant={value === 'active' ? 'success' : value === 'pending' ? 'warning' : 'secondary'}
        >
          {value === 'active' ? 'Actif' : value === 'pending' ? 'En attente' : 'Inactif'}
        </StatusBadge>
      )
    },
    {
      key: 'salary',
      title: 'Salaire',
      sortable: true,
      align: 'right',
      render: (value) => `${value.toLocaleString('fr-FR')} €`
    },
    {
      key: 'joinDate',
      title: 'Date d\'embauche',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR')
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      width: 120,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <ThemeProvider>
      <ToasterWithInit position="bottom-right" duration={5000}>
        <div className="min-h-screen bg-background transition-colors">
        {/* Navbar Demo */}
        <Navbar variant="blur">
          <NavbarBrand href="/">
            <Typography variant="h5" weight="semibold">
              Enterprise OS
            </Typography>
          </NavbarBrand>
          <NavbarContent>
            <NavbarItem href="#" active>Dashboard</NavbarItem>
            <NavbarItem href="#">Products</NavbarItem>
            <NavbarItem href="#">Customers</NavbarItem>
            <NavbarItem href="#">Analytics</NavbarItem>
          </NavbarContent>
          <NavbarActions>
            <Button variant="ghost" size="sm" iconOnly>
              <Search className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Button size="sm">Sign In</Button>
          </NavbarActions>
        </Navbar>

                {/* Main Content */}
        <main className="py-12">
          <Container size="narrow">
            <Stack spacing={8}>
              <div className="text-center space-y-4">
                <Typography variant="h1" className="gradient-text">
                  Modern Frontend Architecture
                </Typography>
                <Typography variant="subtitle1" color="muted">
                  Un SaaS CRM/ERP stable, performant et moderne
                </Typography>
              </div>

              {/* Navigation Components Demo */}
              <section className="space-y-6">
                <Typography variant="h2">Navigation Components</Typography>

                {/* Breadcrumb Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Breadcrumb</Typography>
                  
                  <Card>
                    <CardContent>
                      <Stack spacing={4}>
                        <div>
                          <Typography variant="caption" color="muted" gutterBottom>
                            Basic Breadcrumb
                          </Typography>
                          <Breadcrumb>
                            <BreadcrumbItem href="/">Home</BreadcrumbItem>
                            <BreadcrumbItem href="/products">Products</BreadcrumbItem>
                            <BreadcrumbItem href="/products/electronics">Electronics</BreadcrumbItem>
                            <BreadcrumbItem current>Smartphones</BreadcrumbItem>
                          </Breadcrumb>
                        </div>

                        <div>
                          <Typography variant="caption" color="muted" gutterBottom>
                            With Home Icon
                          </Typography>
                          <Breadcrumb showHome>
                            <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
                            <BreadcrumbItem href="/analytics">Analytics</BreadcrumbItem>
                            <BreadcrumbItem current>Revenue Report</BreadcrumbItem>
                          </Breadcrumb>
                        </div>

                        <div>
                          <Typography variant="caption" color="muted" gutterBottom>
                            Custom Separator & Icons
                          </Typography>
                          <Breadcrumb separator="/">
                            <BreadcrumbItem href="/" icon={<Home className="h-4 w-4" />}>
                              Home
                            </BreadcrumbItem>
                            <BreadcrumbItem href="/users" icon={<Users className="h-4 w-4" />}>
                              Users
                            </BreadcrumbItem>
                            <BreadcrumbItem icon={<Settings className="h-4 w-4" />} current>
                              Settings
                            </BreadcrumbItem>
                          </Breadcrumb>
                        </div>

                        <div>
                          <Typography variant="caption" color="muted" gutterBottom>
                            Long Path (Responsive)
                          </Typography>
                          <Breadcrumb maxItemsMobile={2}>
                            <BreadcrumbItem href="/">Enterprise OS</BreadcrumbItem>
                            <BreadcrumbItem href="/crm">CRM</BreadcrumbItem>
                            <BreadcrumbItem href="/crm/customers">Customers</BreadcrumbItem>
                            <BreadcrumbItem href="/crm/customers/segments">Segments</BreadcrumbItem>
                            <BreadcrumbItem href="/crm/customers/segments/vip">VIP</BreadcrumbItem>
                            <BreadcrumbItem current>John Doe</BreadcrumbItem>
                          </Breadcrumb>
                        </div>
                      </Stack>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Tabs</Typography>
                  
                  <Grid cols={{ base: 1, md: 2 }} gap={4}>
                    {/* Default Tabs */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Default Tabs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="overview">
                          <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="reports">Reports</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overview">
                            <Typography variant="body2">
                              Overview content - View your dashboard summary and key metrics.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="analytics">
                            <Typography variant="body2">
                              Analytics content - Dive deep into your data and insights.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="reports">
                            <Typography variant="body2">
                              Reports content - Generate and download custom reports.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="notifications">
                            <Typography variant="body2">
                              Notifications content - Manage your alerts and notifications.
                            </Typography>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    {/* Pills Tabs */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Pills Variant</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="profile">
                          <TabsList variant="pills">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                            <TabsTrigger value="team">Team</TabsTrigger>
                            <TabsTrigger value="billing">Billing</TabsTrigger>
                          </TabsList>
                          <TabsContent value="profile">
                            <Typography variant="body2">
                              Update your profile information and preferences.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="password">
                            <Typography variant="body2">
                              Change your password and security settings.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="team">
                            <Typography variant="body2">
                              Manage your team members and permissions.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="billing">
                            <Typography variant="body2">
                              View and manage your billing information.
                            </Typography>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    {/* Underline Tabs */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Underline Variant</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="products">
                          <TabsList variant="underline">
                            <TabsTrigger value="products">
                              Products
                            </TabsTrigger>
                            <TabsTrigger value="inventory">
                              Inventory
                            </TabsTrigger>
                            <TabsTrigger value="orders">
                              Orders
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="products">
                            <Typography variant="body2">
                              Manage your product catalog and listings.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="inventory">
                            <Typography variant="body2">
                              Track inventory levels and stock movements.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="orders">
                            <Typography variant="body2">
                              View and process customer orders.
                            </Typography>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    {/* Tabs with Icons and Badges */}
                    <Card>
                      <CardHeader>
                        <CardTitle>With Icons & Badges</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="dashboard">
                          <TabsList>
                            <TabsTrigger 
                              value="dashboard"
                              icon={<BarChart3 className="h-4 w-4" />}
                            >
                              Dashboard
                            </TabsTrigger>
                            <TabsTrigger 
                              value="orders"
                              icon={<ShoppingCart className="h-4 w-4" />}
                              badge={<TabsBadge variant="destructive">12</TabsBadge>}
                            >
                              Orders
                            </TabsTrigger>
                            <TabsTrigger 
                              value="products"
                              icon={<Package className="h-4 w-4" />}
                              badge={<TabsBadge>New</TabsBadge>}
                            >
                              Products
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="dashboard">
                            <Typography variant="body2">
                              Dashboard with real-time metrics and KPIs.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="orders">
                            <Typography variant="body2">
                              You have 12 pending orders to process.
                            </Typography>
                          </TabsContent>
                          <TabsContent value="products">
                            <Typography variant="body2">
                              Check out the new product features!
                            </Typography>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </Grid>
                </div>

                {/* Navbar Variants */}
                <div className="space-y-4">
                  <Typography variant="h3">Navbar Variants</Typography>
                  <Typography variant="body2" color="muted">
                    The navbar at the top of the page demonstrates the blur variant. Other variants include:
                  </Typography>
                  <Stack spacing={2}>
                    <Typography variant="body2">• <strong>Default:</strong> Standard background with border</Typography>
                    <Typography variant="body2">• <strong>Transparent:</strong> No background (for hero sections)</Typography>
                    <Typography variant="body2">• <strong>Blur:</strong> Glassmorphism effect (current demo)</Typography>
                    <Typography variant="body2">• <strong>Filled:</strong> Card background color</Typography>
                                    </Stack>
                </div>
              </section>

              {/* Feedback Components Demo */}
              <section className="space-y-6">
                <Typography variant="h2">Feedback Components</Typography>

                {/* Modal/Dialog Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Modal & Dialog</Typography>
                  
                  <Grid cols={{ base: 1, md: 2 }} gap={4}>
                    {/* Basic Modal */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Modal</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={2}>
                          <Modal>
                            <ModalTrigger asChild>
                              <Button>Open Modal</Button>
                            </ModalTrigger>
                            <ModalContent>
                              <ModalHeader>
                                <ModalTitle>Modal Title</ModalTitle>
                                <ModalDescription>
                                  This is a basic modal with header, body, and footer.
                                </ModalDescription>
                              </ModalHeader>
                              <ModalBody>
                                <Typography variant="body2">
                                  Modal content goes here. You can put any content inside the modal body.
                                  The modal is fully accessible and keyboard navigable.
                                </Typography>
                              </ModalBody>
                              <ModalFooter>
                                <ModalClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </ModalClose>
                                <Button>Save changes</Button>
                              </ModalFooter>
                            </ModalContent>
                          </Modal>

                          <Modal>
                            <ModalTrigger asChild>
                              <Button variant="outline">Large Modal</Button>
                            </ModalTrigger>
                            <ModalContent size="2xl">
                              <ModalHeader>
                                <ModalTitle>Large Modal</ModalTitle>
                              </ModalHeader>
                              <ModalBody>
                                <Typography variant="body2">
                                  This is a larger modal with more space for content.
                                </Typography>
                              </ModalBody>
                            </ModalContent>
                          </Modal>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Dialog Component */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Pre-configured Dialog</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={2}>
                          <Dialog
                            trigger={<Button variant="danger">Delete Item</Button>}
                            title="Confirm Deletion"
                            description="Are you sure you want to delete this item?"
                            actions={
                              <>
                                <ModalClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </ModalClose>
                                <Button variant="danger">Delete</Button>
                              </>
                            }
                          >
                            <Typography variant="body2" color="muted">
                              This action cannot be undone. This will permanently delete the item
                              and remove all associated data.
                            </Typography>
                          </Dialog>

                          <Dialog
                            trigger={<Button variant="success">Save Changes</Button>}
                            title="Save Changes?"
                            description="You have unsaved changes."
                            actions={
                              <>
                                <ModalClose asChild>
                                  <Button variant="ghost">Discard</Button>
                                </ModalClose>
                                <ModalClose asChild>
                                  <Button variant="success">Save</Button>
                                </ModalClose>
                              </>
                            }
                          >
                            <Typography variant="body2">
                              Do you want to save your changes before leaving?
                            </Typography>
                          </Dialog>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Modal Positions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Modal Positions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={2}>
                          <Modal>
                            <ModalTrigger asChild>
                              <Button variant="outline" size="sm">Bottom Sheet</Button>
                            </ModalTrigger>
                            <ModalContent position="bottom" size="full">
                              <ModalHeader>
                                <ModalTitle>Bottom Sheet Modal</ModalTitle>
                              </ModalHeader>
                              <ModalBody>
                                <Typography variant="body2">
                                  This modal slides up from the bottom, perfect for mobile interfaces.
                                </Typography>
                              </ModalBody>
                            </ModalContent>
                          </Modal>

                          <Modal>
                            <ModalTrigger asChild>
                              <Button variant="outline" size="sm">Side Panel</Button>
                            </ModalTrigger>
                            <ModalContent position="right">
                              <ModalHeader>
                                <ModalTitle>Side Panel</ModalTitle>
                                <ModalDescription>
                                  A slide-in panel from the right
                                </ModalDescription>
                              </ModalHeader>
                              <ModalBody>
                                <Typography variant="body2">
                                  Side panels are great for settings, filters, or additional information.
                                </Typography>
                              </ModalBody>
                            </ModalContent>
                          </Modal>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Advanced Modal Features */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={2}>
                          <Modal>
                            <ModalTrigger asChild>
                              <Button variant="outline" size="sm">No Overlay Blur</Button>
                            </ModalTrigger>
                            <ModalContent overlayBlur="none">
                              <ModalHeader>
                                <ModalTitle>No Blur Effect</ModalTitle>
                              </ModalHeader>
                              <ModalBody>
                                <Typography variant="body2">
                                  This modal has no backdrop blur effect.
                                </Typography>
                              </ModalBody>
                            </ModalContent>
                          </Modal>

                          <Modal>
                            <ModalTrigger asChild>
                              <Button variant="outline" size="sm">No Close Button</Button>
                            </ModalTrigger>
                            <ModalContent showCloseButton={false}>
                              <ModalHeader>
                                <ModalTitle>Forced Action</ModalTitle>
                              </ModalHeader>
                              <ModalBody>
                                <Typography variant="body2">
                                  This modal can only be closed by clicking the action buttons.
                                </Typography>
                              </ModalBody>
                              <ModalFooter>
                                <ModalClose asChild>
                                  <Button>I Understand</Button>
                                </ModalClose>
                              </ModalFooter>
                            </ModalContent>
                          </Modal>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </div>

                {/* Toast Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Toast Notifications</Typography>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Toast Examples</CardTitle>
                      <CardDescription>Click the buttons to trigger different toast notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Grid cols={{ base: 2, md: 4 }} gap={2}>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => toast.success('Success!', 'Your changes have been saved.')}
                        >
                          Success Toast
                        </Button>
                        
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => toast.error('Error!', 'Something went wrong. Please try again.')}
                        >
                          Error Toast
                        </Button>
                        
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => toast.warning('Warning!', 'Please check your input.')}
                        >
                          Warning Toast
                        </Button>
                        
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => toast.info('Info', 'New update available!')}
                        >
                          Info Toast
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.default('Default Toast', 'This is a default notification.')}
                        >
                          Default Toast
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.success('Quick Toast')
                          }}
                        >
                          Title Only
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.info('Long Duration', 'This toast will stay for 10 seconds', 10000)
                          }}
                        >
                          Long Duration
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: 'Custom Toast',
                              description: 'With custom content and icon',
                              variant: 'default',
                              duration: 3000,
                            })
                          }}
                        >
                          Custom Toast
                        </Button>
                      </Grid>

                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <Stack spacing={2}>
                          <Typography variant="body2" weight="medium">
                            Toast Features:
                          </Typography>
                          <Typography variant="caption" color="muted">
                            • Auto-dismiss after 5 seconds (configurable)
                          </Typography>
                          <Typography variant="caption" color="muted">
                            • Swipe to dismiss on mobile
                          </Typography>
                          <Typography variant="caption" color="muted">
                            • Maximum 3 toasts at once (older ones are removed)
                          </Typography>
                          <Typography variant="caption" color="muted">
                            • Positioned at bottom-right by default
                          </Typography>
                          <Typography variant="caption" color="muted">
                            • Accessible with screen readers
                          </Typography>
                        </Stack>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alert Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Alert Messages</Typography>
                  
                  <Stack spacing={3}>
                    <Alert>
                      <AlertTitle>Default Alert</AlertTitle>
                      <AlertDescription>
                        This is a default alert message. It can be used for general information.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="info">
                      <AlertTitle>Information</AlertTitle>
                      <AlertDescription>
                        New features have been added to your dashboard. <AlertLink href="#">Learn more</AlertLink>
                      </AlertDescription>
                    </Alert>

                    <Alert variant="success">
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>
                        Your changes have been saved successfully.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="warning">
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        Your session will expire in 5 minutes. Please save your work.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="error">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to connect to the server. Please check your internet connection.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="info" dismissible onDismiss={() => toast.info('Alert dismissed')}>
                      <AlertTitle>Dismissible Alert</AlertTitle>
                      <AlertDescription>
                        This alert can be dismissed by clicking the X button.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="info" size="sm">
                      <AlertTitle>Small Alert</AlertTitle>
                      <AlertDescription>
                        This is a small sized alert.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="info" size="lg" icon={<Zap className="h-6 w-6" />}>
                      <AlertTitle>Custom Icon Alert</AlertTitle>
                      <AlertDescription>
                        This alert has a custom icon and large size.
                      </AlertDescription>
                    </Alert>
                  </Stack>
                </div>

                {/* Badge & Tag Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Badges & Tags</Typography>
                  
                  <Grid cols={{ base: 1, md: 2 }} gap={4}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Badge Variants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BadgeGroup>
                          <Badge>Default</Badge>
                          <Badge variant="secondary">Secondary</Badge>
                          <Badge variant="destructive">Destructive</Badge>
                          <Badge variant="outline">Outline</Badge>
                          <Badge variant="success">Success</Badge>
                          <Badge variant="warning">Warning</Badge>
                          <Badge variant="error">Error</Badge>
                          <Badge variant="info">Info</Badge>
                        </BadgeGroup>

                        <Divider className="my-4" />

                        <Typography variant="body2" weight="medium" gutterBottom>
                          Sizes & Shapes
                        </Typography>
                        <BadgeGroup>
                          <Badge size="sm">Small</Badge>
                          <Badge size="md">Medium</Badge>
                          <Badge size="lg">Large</Badge>
                          <Badge rounded="none">Square</Badge>
                          <Badge rounded="full">Pill</Badge>
                        </BadgeGroup>

                        <Divider className="my-4" />

                        <Typography variant="body2" weight="medium" gutterBottom>
                          With Icons
                        </Typography>
                        <BadgeGroup>
                          <Badge icon={<Star className="h-3 w-3" />}>Featured</Badge>
                          <Badge variant="success" icon={<TrendingUp className="h-3 w-3" />}>
                            Trending
                          </Badge>
                          <Badge variant="warning" icon={<AlertCircle className="h-3 w-3" />}>
                            Beta
                          </Badge>
                        </BadgeGroup>

                        <Divider className="my-4" />

                        <Typography variant="body2" weight="medium" gutterBottom>
                          Removable Badges
                        </Typography>
                        <BadgeGroup>
                          <Badge removable onRemove={() => toast.info('Badge removed')}>
                            JavaScript
                          </Badge>
                          <Badge variant="success" removable onRemove={() => toast.info('Badge removed')}>
                            TypeScript
                          </Badge>
                          <Badge variant="info" removable onRemove={() => toast.info('Badge removed')}>
                            React
                          </Badge>
                        </BadgeGroup>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Tags & Status Badges</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Typography variant="body2" weight="medium" gutterBottom>
                          Colored Tags
                        </Typography>
                        <BadgeGroup>
                          <Tag color="gray">Gray</Tag>
                          <Tag color="red">Red</Tag>
                          <Tag color="yellow">Yellow</Tag>
                          <Tag color="green">Green</Tag>
                          <Tag color="blue">Blue</Tag>
                          <Tag color="indigo">Indigo</Tag>
                          <Tag color="purple">Purple</Tag>
                          <Tag color="pink">Pink</Tag>
                        </BadgeGroup>

                        <Divider className="my-4" />

                        <Typography variant="body2" weight="medium" gutterBottom>
                          Removable Tags
                        </Typography>
                        <BadgeGroup>
                          <Tag color="blue" removable onRemove={() => toast.info('Tag removed')}>
                            Technology
                          </Tag>
                          <Tag color="green" removable onRemove={() => toast.info('Tag removed')}>
                            Design
                          </Tag>
                          <Tag color="purple" removable onRemove={() => toast.info('Tag removed')}>
                            Marketing
                          </Tag>
                        </BadgeGroup>

                        <Divider className="my-4" />

                        <Typography variant="body2" weight="medium" gutterBottom>
                          Status Badges
                        </Typography>
                        <BadgeGroup wrap gap="md">
                          <StatusBadge status="online">Online</StatusBadge>
                          <StatusBadge status="offline">Offline</StatusBadge>
                          <StatusBadge status="away">Away</StatusBadge>
                          <StatusBadge status="busy">Busy</StatusBadge>
                          <StatusBadge status="online" pulse>Active Now</StatusBadge>
                          <StatusBadge status="error" pulse>Error</StatusBadge>
                        </BadgeGroup>

                        <Divider className="my-4" />

                        <Typography variant="body2" weight="medium" gutterBottom>
                          Truncated Badges
                        </Typography>
                        <BadgeGroup wrap={false}>
                          <Badge truncate maxWidth="100px">
                            This is a very long badge text that will be truncated
                          </Badge>
                          <Badge variant="info" truncate maxWidth="150px">
                            Another long text for demonstration
                          </Badge>
                        </BadgeGroup>
                      </CardContent>
                    </Card>
                  </Grid>
                </div>

                {/* Progress Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Progress Indicators</Typography>
                  
                  <Grid cols={{ base: 1, md: 2 }} gap={4}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Linear Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={4}>
                          <Progress value={25} />
                          <Progress value={50} variant="success" />
                          <Progress value={75} variant="warning" />
                          <Progress value={90} variant="error" />
                          
                          <Divider />

                          <Typography variant="body2" weight="medium">With Labels</Typography>
                          <Progress value={60} showLabel />
                          <Progress value={80} variant="info" showLabel />

                          <Divider />

                          <Typography variant="body2" weight="medium">Sizes</Typography>
                          <Progress value={40} size="sm" />
                          <Progress value={40} size="md" />
                          <Progress value={40} size="lg" />

                          <Divider />

                          <Typography variant="body2" weight="medium">Animated & Striped</Typography>
                          <Progress value={65} animated />
                          <Progress value={45} striped variant="success" />
                          <Progress value={70} animated striped variant="info" />
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Circular & Multi Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={4}>
                          <Typography variant="body2" weight="medium">Circular Progress</Typography>
                          <div className="flex flex-wrap gap-4">
                            <CircularProgress value={25} />
                            <CircularProgress value={50} variant="success" />
                            <CircularProgress value={75} variant="warning" showLabel />
                            <CircularProgress value={90} variant="error" showLabel />
                          </div>

                          <div className="flex flex-wrap gap-4">
                            <CircularProgress value={60} size={48} strokeWidth={3} showLabel />
                            <CircularProgress value={80} size={80} strokeWidth={6} variant="info" showLabel />
                          </div>

                          <Divider />

                          <Typography variant="body2" weight="medium">Multi-Segment Progress</Typography>
                          <MultiProgress
                            segments={[
                              { value: 25, variant: 'success', label: 'Completed' },
                              { value: 15, variant: 'info', label: 'In Progress' },
                              { value: 10, variant: 'warning', label: 'Pending' },
                            ]}
                            showLabel
                          />

                          <MultiProgress
                            segments={[
                              { value: 30, variant: 'success' },
                              { value: 20, variant: 'info' },
                              { value: 15, variant: 'warning' },
                              { value: 5, variant: 'error' },
                            ]}
                            max={100}
                            size="lg"
                          />

                          <Typography variant="body2" weight="medium">Storage Usage</Typography>
                          <MultiProgress
                            segments={[
                              { value: 45, variant: 'info', label: 'Documents (45GB)' },
                              { value: 30, variant: 'success', label: 'Images (30GB)' },
                              { value: 15, variant: 'warning', label: 'Videos (15GB)' },
                              { value: 5, variant: 'error', label: 'Other (5GB)' },
                            ]}
                            max={100}
                            showLabel
                            labelFormat={(value) => `${value}GB / 100GB`}
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </div>

                {/* Skeleton & Loading States Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Skeleton & Loading States</Typography>
                  
                  <Grid cols={{ base: 1, md: 2 }} gap={4}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Skeleton Variants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={4}>
                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Text Skeleton
                            </Typography>
                            <SkeletonText lines={3} />
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Avatar Skeletons
                            </Typography>
                            <div className="flex gap-2">
                              <SkeletonAvatar size="xs" />
                              <SkeletonAvatar size="sm" />
                              <SkeletonAvatar size="md" />
                              <SkeletonAvatar size="lg" />
                              <SkeletonAvatar size="xl" />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Button Skeletons
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              <SkeletonButton size="sm" />
                              <SkeletonButton size="md" />
                              <SkeletonButton size="lg" />
                              <SkeletonButton fullWidth />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Custom Skeletons
                            </Typography>
                            <Stack spacing={2}>
                              <Skeleton variant="rectangular" width="100%" height={60} />
                              <div className="flex gap-2">
                                <Skeleton variant="circular" width={40} height={40} />
                                <div className="flex-1">
                                  <Skeleton variant="text" width="60%" />
                                  <Skeleton variant="text" width="40%" />
                                </div>
                              </div>
                            </Stack>
                          </div>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Skeleton Presets</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={4}>
                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Card Skeleton
                            </Typography>
                            <SkeletonCard />
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Table Skeleton
                            </Typography>
                            <SkeletonTable rows={3} columns={4} />
                          </div>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </div>

                {/* Spinner Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Spinners & Loading Indicators</Typography>
                  
                  <Grid cols={{ base: 1, md: 2 }} gap={4}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Spinner Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={4}>
                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Icon Types
                            </Typography>
                            <div className="flex items-center gap-4">
                              <Spinner type="loader" />
                              <Spinner type="loader2" />
                              <Spinner type="refresh" />
                              <Spinner type="circular" />
                              <Spinner type="dots" />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Sizes
                            </Typography>
                            <div className="flex items-center gap-4">
                              <Spinner size="xs" />
                              <Spinner size="sm" />
                              <Spinner size="md" />
                              <Spinner size="lg" />
                              <Spinner size="xl" />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Colors
                            </Typography>
                            <div className="flex items-center gap-4">
                              <Spinner color="primary" />
                              <Spinner color="secondary" />
                              <Spinner color="success" />
                              <Spinner color="warning" />
                              <Spinner color="error" />
                              <Spinner color="info" />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Speeds
                            </Typography>
                            <div className="flex items-center gap-4">
                              <Spinner speed="slow" showLabel label="Slow" />
                              <Spinner speed="normal" showLabel label="Normal" />
                              <Spinner speed="fast" showLabel label="Fast" />
                            </div>
                          </div>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Loading Components</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={4}>
                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Loading Button
                            </Typography>
                            <div className="flex gap-2">
                              <LoadingButton
                                loading={false}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                              >
                                Not Loading
                              </LoadingButton>
                              <LoadingButton
                                loading={true}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                              >
                                Loading
                              </LoadingButton>
                              <LoadingButton
                                loading={true}
                                loadingText="Saving..."
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                              >
                                Save
                              </LoadingButton>
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Loading Dots
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Typography variant="body2">Processing</Typography>
                              <LoadingDots />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Spinner with Label
                            </Typography>
                            <Stack spacing={2}>
                              <Spinner showLabel label="Loading data..." />
                              <Spinner showLabel label="Please wait" labelPosition="bottom" />
                              <Spinner type="circular" size="lg" showLabel label="Uploading files..." labelPosition="right" />
                            </Stack>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Inline Loading
                            </Typography>
                            <Typography variant="body2">
                              The data is <Spinner size="xs" className="inline mx-1" /> being processed.
                            </Typography>
                          </div>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </div>

                {/* Avatar Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Avatar Components</Typography>
                  
                  <Grid cols={{ base: 1, md: 2 }} gap={4}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Avatar Variants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={4}>
                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Sizes
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Avatar size="xs" name="John Doe" />
                              <Avatar size="sm" name="John Doe" />
                              <Avatar size="md" name="John Doe" />
                              <Avatar size="lg" name="John Doe" />
                              <Avatar size="xl" name="John Doe" />
                              <Avatar size="2xl" name="John Doe" />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              With Images
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Avatar src="https://github.com/shadcn.png" alt="User" />
                              <Avatar src="https://github.com/vercel.png" alt="Vercel" shape="square" />
                              <Avatar src="https://github.com/invalid.png" name="Fallback User" />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Colors
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Avatar name="Default" />
                              <Avatar name="Primary" color="primary" />
                              <Avatar name="Success" color="success" />
                              <Avatar name="Warning" color="warning" />
                              <Avatar name="Error" color="error" />
                              <Avatar name="Info" color="info" />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              With Status
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Avatar name="Online" status="online" />
                              <Avatar name="Away" status="away" />
                              <Avatar name="Busy" status="busy" />
                              <Avatar name="Offline" status="offline" />
                              <Avatar name="DND" status="dnd" />
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Custom Icons
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Avatar fallbackIcon={<Users className="h-5 w-5" />} />
                              <Avatar fallbackIcon={<Activity className="h-5 w-5" />} color="success" />
                              <Avatar fallbackIcon={<Settings className="h-5 w-5" />} color="primary" />
                            </div>
                          </div>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Avatar Groups & Compositions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Stack spacing={4}>
                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Avatar Group
                            </Typography>
                            <AvatarGroup max={4}>
                              <Avatar name="John Doe" />
                              <Avatar name="Jane Smith" color="primary" />
                              <Avatar name="Bob Johnson" color="success" />
                              <Avatar name="Alice Brown" color="warning" />
                              <Avatar name="Charlie Wilson" color="error" />
                              <Avatar name="Diana Prince" color="info" />
                            </AvatarGroup>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Different Sizes
                            </Typography>
                            <Stack spacing={2}>
                              <AvatarGroup size="sm" max={5}>
                                <Avatar name="User 1" />
                                <Avatar name="User 2" />
                                <Avatar name="User 3" />
                                <Avatar name="User 4" />
                                <Avatar name="User 5" />
                                <Avatar name="User 6" />
                              </AvatarGroup>
                              <AvatarGroup size="lg" max={3}>
                                <Avatar src="https://github.com/shadcn.png" />
                                <Avatar src="https://github.com/vercel.png" />
                                <Avatar name="Third User" />
                                <Avatar name="Fourth User" />
                              </AvatarGroup>
                            </Stack>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Avatar with Text
                            </Typography>
                            <Stack spacing={3}>
                              <AvatarWithText
                                name="Sarah Connor"
                                primaryText="Sarah Connor"
                                secondaryText="Project Manager"
                                status="online"
                              />
                              <AvatarWithText
                                src="https://github.com/shadcn.png"
                                primaryText="John Smith"
                                secondaryText="Software Engineer"
                                status="busy"
                              />
                              <AvatarWithText
                                name="AI Assistant"
                                primaryText="AI Assistant"
                                secondaryText="Always here to help"
                                color="primary"
                                textPosition="bottom"
                              />
                            </Stack>
                          </div>

                          <Divider />

                          <div>
                            <Typography variant="body2" weight="medium" gutterBottom>
                              Square Avatars
                            </Typography>
                            <AvatarGroup shape="square" spacing={-12}>
                              <Avatar name="App 1" shape="square" color="primary" />
                              <Avatar name="App 2" shape="square" color="success" />
                              <Avatar name="App 3" shape="square" color="warning" />
                              <Avatar name="App 4" shape="square" color="error" />
                            </AvatarGroup>
                          </div>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </div>
              </section>

              {/* Data Tables Section */}
              <section className="space-y-8">
                <div className="space-y-2">
                  <Typography variant="h2">Tables & DataTables</Typography>
                  <Typography variant="body2" color="muted">
                    Composants pour l'affichage de données tabulaires avec tri, filtres et sélection
                  </Typography>
                </div>

                {/* Basic Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Table Basique</CardTitle>
                    <CardDescription>Table simple avec variantes et styles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Default Table */}
                    <div>
                      <Typography variant="h6" className="mb-3">Table par défaut</Typography>
                      <TableContainer>
                        <Table hover>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Rôle</TableHead>
                              <TableHead align="right">Salaire</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sampleEmployees.slice(0, 3).map((employee) => (
                              <TableRow key={employee.id}>
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>{employee.role}</TableCell>
                                <TableCell align="right">{employee.salary.toLocaleString('fr-FR')} €</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>

                    {/* Striped Table */}
                    <div>
                      <Typography variant="h6" className="mb-3">Table avec rayures</Typography>
                      <TableContainer>
                        <Table variant="striped" size="sm">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Département</TableHead>
                              <TableHead>Employés</TableHead>
                              <TableHead align="right">Budget</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Engineering</TableCell>
                              <TableCell>12</TableCell>
                              <TableCell align="right">450 000 €</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Marketing</TableCell>
                              <TableCell>8</TableCell>
                              <TableCell align="right">200 000 €</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Sales</TableCell>
                              <TableCell>15</TableCell>
                              <TableCell align="right">350 000 €</TableCell>
                            </TableRow>
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell className="font-medium">Total</TableCell>
                              <TableCell className="font-medium">35</TableCell>
                              <TableCell align="right" className="font-medium">1 000 000 €</TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </TableContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced DataTable */}
                <Card>
                  <CardHeader>
                    <CardTitle>DataTable Avancée</CardTitle>
                    <CardDescription>Table avec tri, recherche, sélection et actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={sampleEmployees}
                      columns={employeeColumns}
                      loading={loading}
                      selectable
                      selectedRows={selectedEmployees}
                      onSelectionChange={setSelectedEmployees}
                      filterable
                      exportable
                      onExport={(format) => toast.success(`Export ${format.toUpperCase()} déclenché`)}
                      onRowClick={(row) => toast.info(`Ligne cliquée: ${row.name}`)}
                    />
                    
                    <div className="flex gap-2 mt-4">
                      <Button onClick={simulateLoading} disabled={loading}>
                        {loading ? 'Chargement...' : 'Simuler chargement'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedEmployees(new Set())}
                        disabled={selectedEmployees.size === 0}
                      >
                        Désélectionner tout
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Empty State DataTable */}
                <Card>
                  <CardHeader>
                    <CardTitle>État vide</CardTitle>
                    <CardDescription>DataTable sans données</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={[]}
                      columns={employeeColumns.slice(0, 4)}
                      filterable
                      empty={
                        <div className="space-y-2">
                          <UsersIcon className="h-8 w-8 mx-auto opacity-50" />
                          <div className="text-sm">Aucun employé trouvé</div>
                          <Button size="sm" className="mt-2">Ajouter un employé</Button>
                        </div>
                      }
                    />
                  </CardContent>
                </Card>

                {/* Compact DataTable */}
                <Card>
                  <CardHeader>
                    <CardTitle>Table Compacte</CardTitle>
                    <CardDescription>Version condensée pour plus de densité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={sampleEmployees}
                      columns={[
                        {
                          key: 'name',
                          title: 'Nom',
                          sortable: true,
                          render: (value, row) => (
                            <div className="flex items-center gap-2">
                              <Avatar size="xs" name={row.name} src={row.avatar} />
                              <span className="font-medium">{value}</span>
                            </div>
                          )
                        },
                        { key: 'role', title: 'Poste', sortable: true },
                        { 
                          key: 'department', 
                          title: 'Département', 
                          render: (value) => <Badge variant="outline" className="text-xs">{value}</Badge>
                        },
                        { 
                          key: 'status', 
                          title: 'Statut',
                          render: (value) => (
                            <div className={`inline-flex h-2 w-2 rounded-full ${
                              value === 'active' ? 'bg-green-500' : 
                              value === 'pending' ? 'bg-yellow-500' : 
                              'bg-gray-400'
                            }`} />
                          )
                        }
                      ]}
                      size="sm"
                      maxHeight={300}
                      hover
                    />
                  </CardContent>
                </Card>
              </section>

              {/* Demo Section */}
              <section className="space-y-6">
                <Typography variant="h2">Design System Demo</Typography>
              
                              {/* Buttons Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Buttons</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

                              {/* Button Sizes */}
                <div className="space-y-4">
                  <Typography variant="h3">Button Sizes</Typography>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

                              {/* Loading States */}
                <div className="space-y-4">
                  <Typography variant="h3">Loading States</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button isLoading>Loading</Button>
                  <Button isLoading loadingText="Saving...">Save</Button>
                  <Button variant="success" isLoading>Success</Button>
                </div>
                              </div>

                {/* Typography Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Typography</Typography>
                  
                  {/* Headings */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Headings</Typography>
                    <Typography variant="h1">Heading 1</Typography>
                    <Typography variant="h2">Heading 2</Typography>
                    <Typography variant="h3">Heading 3</Typography>
                    <Typography variant="h4">Heading 4</Typography>
                    <Typography variant="h5">Heading 5</Typography>
                    <Typography variant="h6">Heading 6</Typography>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Body Text</Typography>
                    <Typography variant="body1" gutterBottom>
                      Body 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </Typography>
                    <Typography variant="body2">
                      Body 2: Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                      laboris nisi ut aliquip ex ea commodo consequat.
                    </Typography>
                  </div>

                  {/* Special Text */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Special Text</Typography>
                    <Typography variant="subtitle1">Subtitle 1: Emphasized text</Typography>
                    <Typography variant="subtitle2">Subtitle 2: Secondary emphasis</Typography>
                    <Typography variant="caption">Caption: Small descriptive text</Typography>
                    <Typography variant="overline">Overline: Category Label</Typography>
                  </div>

                  {/* Colors */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Colors</Typography>
                    <Typography color="primary">Primary color text</Typography>
                    <Typography color="secondary">Secondary color text</Typography>
                    <Typography color="success">Success color text</Typography>
                    <Typography color="warning">Warning color text</Typography>
                    <Typography color="error">Error color text</Typography>
                    <Typography color="info">Info color text</Typography>
                  </div>

                  {/* Text Alignment */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Alignment</Typography>
                    <Typography align="left">Left aligned text</Typography>
                    <Typography align="center">Center aligned text</Typography>
                    <Typography align="right">Right aligned text</Typography>
                  </div>
                </div>

                {/* Layout Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Layout System</Typography>
                  
                  {/* Grid Demo */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Grid Layout</Typography>
                    <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
                      <div className="rounded-lg border bg-accent p-4">
                        <Typography variant="body2">Grid Item 1</Typography>
                      </div>
                      <div className="rounded-lg border bg-accent p-4">
                        <Typography variant="body2">Grid Item 2</Typography>
                      </div>
                      <div className="rounded-lg border bg-accent p-4">
                        <Typography variant="body2">Grid Item 3</Typography>
                      </div>
                      <div className="rounded-lg border bg-accent p-4">
                        <Typography variant="body2">Grid Item 4</Typography>
                      </div>
                      <div className="rounded-lg border bg-accent p-4">
                        <Typography variant="body2">Grid Item 5</Typography>
                      </div>
                      <div className="rounded-lg border bg-accent p-4">
                        <Typography variant="body2">Grid Item 6</Typography>
                      </div>
                    </Grid>
                  </div>

                  {/* Stack Demo */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Stack Layout</Typography>
                    <Stack spacing={4}>
                      <div className="rounded-lg border bg-accent p-4">
                        <Typography variant="body2">Stack Item 1 (Vertical)</Typography>
                      </div>
                      <Stack direction="row" spacing={4} align="center">
                        <div className="rounded-lg border bg-accent p-4 flex-1">
                          <Typography variant="body2">Nested Stack Item 1</Typography>
                        </div>
                        <div className="rounded-lg border bg-accent p-4 flex-1">
                          <Typography variant="body2">Nested Stack Item 2</Typography>
                        </div>
                      </Stack>
                      <Divider />
                      <div className="rounded-lg border bg-accent p-4">
                        <Typography variant="body2">Stack Item 3</Typography>
                      </div>
                    </Stack>
                  </div>
                </div>

                {/* Form Components Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Form Components</Typography>
                  
                  {/* Input Variants */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Input Variants</Typography>
                    <Grid cols={{ base: 1, md: 2 }} gap={4}>
                      <Input
                        label="Default Input"
                        placeholder="Enter text..."
                        helperText="This is a helper text"
                      />
                      <Input
                        variant="filled"
                        label="Filled Input"
                        placeholder="Enter text..."
                      />
                      <Input
                        variant="flushed"
                        label="Flushed Input"
                        placeholder="Enter text..."
                      />
                      <Input
                        variant="ghost"
                        label="Ghost Input"
                        placeholder="Enter text..."
                      />
                    </Grid>
                  </div>

                  {/* Input with Icons */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Input with Icons</Typography>
                    <Grid cols={{ base: 1, md: 2 }} gap={4}>
                      <Input
                        leftElement={<Search className="h-4 w-4" />}
                        placeholder="Search..."
                      />
                      <Input
                        leftElement={<Mail className="h-4 w-4" />}
                        rightElement={<span className="text-xs text-muted-foreground">@example.com</span>}
                        placeholder="Email address"
                        type="email"
                      />
                    </Grid>
                  </div>

                  {/* Input States */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Input States</Typography>
                    <Grid cols={{ base: 1, md: 2 }} gap={4}>
                      <Input
                        label="Error State"
                        placeholder="Enter password..."
                        type="password"
                        leftElement={<Lock className="h-4 w-4" />}
                        errorMessage="Password must be at least 8 characters"
                      />
                      <Input
                        label="Disabled State"
                        placeholder="Cannot edit..."
                        disabled
                        value="Disabled input"
                      />
                    </Grid>
                  </div>

                  {/* Textarea */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Textarea</Typography>
                    <Grid cols={{ base: 1, md: 2 }} gap={4}>
                      <Textarea
                        label="Default Textarea"
                        placeholder="Enter your message..."
                        helperText="Maximum 500 characters"
                        rows={4}
                      />
                      <Textarea
                        label="Auto-resize Textarea"
                        placeholder="This textarea will grow as you type..."
                        autoResize
                        minRows={3}
                        maxRows={8}
                      />
                    </Grid>
                  </div>

                  {/* Select */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Select</Typography>
                    <Grid cols={{ base: 1, md: 2 }} gap={4}>
                      <Select
                        label="Country"
                        placeholder="Select a country"
                        options={[
                          { value: 'fr', label: 'France' },
                          { value: 'us', label: 'United States' },
                          { value: 'uk', label: 'United Kingdom' },
                          { value: 'de', label: 'Germany' },
                          { value: 'es', label: 'Spain' },
                        ]}
                        helperText="Select your country of residence"
                      />
                      <Select
                        label="Category"
                        placeholder="Choose a category"
                        options={[
                          { value: 'fruit-apple', label: 'Apple', group: 'Fruits' },
                          { value: 'fruit-banana', label: 'Banana', group: 'Fruits' },
                          { value: 'fruit-orange', label: 'Orange', group: 'Fruits' },
                          { value: 'veg-carrot', label: 'Carrot', group: 'Vegetables' },
                          { value: 'veg-broccoli', label: 'Broccoli', group: 'Vegetables' },
                          { value: 'dairy-milk', label: 'Milk', group: 'Dairy' },
                          { value: 'dairy-cheese', label: 'Cheese', group: 'Dairy' },
                        ]}
                      />
                    </Grid>
                  </div>

                  {/* Selection Controls */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Selection Controls</Typography>
                    <Grid cols={{ base: 1, md: 2 }} gap={6}>
                      {/* Checkbox Examples */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Checkbox</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Stack spacing={4}>
                            <Checkbox label="Default checkbox" />
                            <Checkbox 
                              label="With description" 
                              description="This is a helpful description text"
                            />
                            <Checkbox 
                              label="Required field" 
                              required
                              errorMessage="This field is required"
                            />
                            <Checkbox label="Disabled" disabled />
                            <Checkbox label="Checked by default" defaultChecked />
                            <div className="space-y-2">
                              <Typography variant="caption" color="muted">Variants:</Typography>
                              <Stack spacing={2}>
                                <Checkbox variant="outline" label="Outline" defaultChecked />
                                <Checkbox variant="filled" label="Filled" defaultChecked />
                                <Checkbox variant="ghost" label="Ghost" defaultChecked />
                              </Stack>
                            </div>
                            <div className="space-y-2">
                              <Typography variant="caption" color="muted">Colors:</Typography>
                              <Stack spacing={2}>
                                <Checkbox color="success" label="Success" defaultChecked />
                                <Checkbox color="warning" label="Warning" defaultChecked />
                                <Checkbox color="error" label="Error" defaultChecked />
                              </Stack>
                            </div>
                            <Checkbox 
                              indeterminate 
                              label="Indeterminate state"
                              description="Used for parent checkboxes with mixed children"
                            />
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Radio Examples */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Radio Group</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Stack spacing={4}>
                            <RadioGroup 
                              label="Select your plan" 
                              defaultValue="pro"
                              description="Choose the plan that best fits your needs"
                            >
                              <RadioItem value="free" label="Free" description="$0/month" />
                              <RadioItem value="pro" label="Pro" description="$10/month" />
                              <RadioItem value="enterprise" label="Enterprise" description="Contact us" />
                            </RadioGroup>

                            <Divider />

                            <RadioGroup label="Horizontal layout" direction="horizontal" defaultValue="1">
                              <RadioItem value="1" label="Option 1" />
                              <RadioItem value="2" label="Option 2" />
                              <RadioItem value="3" label="Option 3" />
                            </RadioGroup>

                            <Divider />

                            <RadioGroup label="Different variants" defaultValue="default">
                              <RadioItem value="default" label="Default" />
                              <RadioItem value="outline" label="Outline" variant="outline" />
                              <RadioItem value="filled" label="Filled" variant="filled" />
                              <RadioItem value="ghost" label="Ghost" variant="ghost" />
                            </RadioGroup>

                            <Divider />

                            <RadioGroup label="Colors" defaultValue="success">
                              <RadioItem value="success" label="Success" color="success" />
                              <RadioItem value="warning" label="Warning" color="warning" />
                              <RadioItem value="error" label="Error" color="error" />
                            </RadioGroup>
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Switch Examples */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Switch</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Stack spacing={4}>
                            <Switch label="Default switch" />
                            <Switch 
                              label="With description" 
                              description="Enable to receive notifications"
                            />
                            <Switch 
                              label="Error state" 
                              errorMessage="Something went wrong"
                            />
                            <Switch label="Disabled" disabled />
                            <Switch label="Checked by default" defaultChecked />
                            
                            <div className="space-y-2">
                              <Typography variant="caption" color="muted">Variants:</Typography>
                              <Stack spacing={2}>
                                <Switch variant="outline" label="Outline" defaultChecked />
                                <Switch variant="filled" label="Filled" defaultChecked />
                                <Switch variant="ghost" label="Ghost" defaultChecked />
                              </Stack>
                            </div>

                            <div className="space-y-2">
                              <Typography variant="caption" color="muted">Sizes:</Typography>
                              <Stack spacing={2}>
                                <Switch size="sm" label="Small" />
                                <Switch size="md" label="Medium" />
                                <Switch size="lg" label="Large" />
                              </Stack>
                            </div>

                            <div className="space-y-2">
                              <Typography variant="caption" color="muted">Colors:</Typography>
                              <Stack spacing={2}>
                                <Switch color="success" label="Success" defaultChecked />
                                <Switch color="warning" label="Warning" defaultChecked />
                                <Switch color="error" label="Error" defaultChecked />
                              </Stack>
                            </div>
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Mixed Form Example */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Form Example</CardTitle>
                          <CardDescription>Combining different form controls</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Stack spacing={4}>
                            <Input 
                              label="Project Name" 
                              placeholder="My awesome project"
                              required
                            />
                            
                            <Select
                              label="Project Type"
                              placeholder="Select a type"
                              options={[
                                { value: 'web', label: 'Web Application' },
                                { value: 'mobile', label: 'Mobile App' },
                                { value: 'api', label: 'API Service' },
                                { value: 'other', label: 'Other' },
                              ]}
                            />

                            <RadioGroup label="Visibility" defaultValue="private">
                              <RadioItem value="public" label="Public" description="Anyone can see this project" />
                              <RadioItem value="private" label="Private" description="Only you can see this project" />
                            </RadioGroup>

                            <Stack spacing={3}>
                              <Typography variant="body2" weight="medium">Features</Typography>
                              <Checkbox label="Enable CI/CD" defaultChecked />
                              <Checkbox label="Auto-deploy to production" />
                              <Checkbox label="Enable monitoring" defaultChecked />
                            </Stack>

                            <Switch 
                              label="Advanced settings" 
                              description="Show advanced configuration options"
                            />

                            <Stack direction="row" spacing={2} className="pt-4">
                              <Button variant="ghost">Cancel</Button>
                              <Button>Create Project</Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </div>
                </div>

                {/* Card Components Demo */}
                <div className="space-y-4">
                  <Typography variant="h3">Card Components</Typography>
                  
                  {/* Card Variants */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Card Variants</Typography>
                    <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
                      <Card>
                        <CardHeader>
                          <CardTitle>Default Card</CardTitle>
                          <CardDescription>This is a default card style</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Typography variant="body2">
                            Standard card with subtle shadow and background.
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      <Card variant="bordered">
                        <CardHeader>
                          <CardTitle>Bordered Card</CardTitle>
                          <CardDescription>Card with border</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Typography variant="body2">
                            This card has a visible border.
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      <Card variant="elevated">
                        <CardHeader>
                          <CardTitle>Elevated Card</CardTitle>
                          <CardDescription>Card with elevation</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Typography variant="body2">
                            Higher shadow for more emphasis.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </div>

                  {/* Interactive Cards */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Interactive Cards</Typography>
                    <Grid cols={{ base: 1, md: 2 }} gap={4}>
                      <Card interactive variant="bordered">
                        <CardHeader>
                          <CardTitle>Clickable Card</CardTitle>
                          <CardDescription>This entire card is interactive</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Typography variant="body2">
                            Hover and click me to see the interactive effects. Perfect for navigation cards.
                          </Typography>
                        </CardContent>
                        <CardFooter>
                          <Typography variant="body2" className="flex items-center gap-2 text-primary">
                            Learn more <ArrowRight className="h-4 w-4" />
                          </Typography>
                        </CardFooter>
                      </Card>
                      
                      <Card glass className="bg-gradient-to-br from-primary/10 to-purple-500/10">
                        <CardHeader>
                          <CardTitle>Glassmorphism Card</CardTitle>
                          <CardDescription>Modern glass effect</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Typography variant="body2">
                            This card uses backdrop blur and transparency for a modern glass effect.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </div>

                  {/* Complex Card Example */}
                  <div className="space-y-2">
                    <Typography variant="h4" color="muted">Complex Card Example</Typography>
                    <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
                      <Card>
                        <CardHeader divider>
                          <Stack direction="row" justify="between" align="start">
                            <div>
                              <CardTitle>Article Card</CardTitle>
                              <CardDescription>5 min read • By John Doe</CardDescription>
                            </div>
                            <Button size="sm" variant="ghost" iconOnly>
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </Stack>
                        </CardHeader>
                        <CardContent>
                          <Typography variant="body2" gutterBottom>
                            This is an example of a more complex card layout with multiple sections,
                            actions, and information hierarchy.
                          </Typography>
                          <Stack direction="row" spacing={4} className="text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" /> 42
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" /> 12
                            </span>
                          </Stack>
                        </CardContent>
                        <CardFooter divider align="between">
                          <Button size="sm" variant="ghost">Cancel</Button>
                          <Button size="sm">Read More</Button>
                        </CardFooter>
                      </Card>

                      <Card variant="filled" padding="none">
                        <div className="aspect-video bg-gradient-to-br from-primary to-purple-600" />
                        <CardHeader>
                          <CardTitle>Media Card</CardTitle>
                          <CardDescription>Card with media content</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Typography variant="body2">
                            Cards can contain images, videos, or other media elements.
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card variant="bordered" padding="sm">
                        <CardContent noPadding>
                          <Stack spacing={2}>
                            <Typography variant="h6">Quick Stats</Typography>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Typography variant="caption" color="muted">Revenue</Typography>
                                <Typography variant="h4">€42.5k</Typography>
                              </div>
                              <div>
                                <Typography variant="caption" color="muted">Growth</Typography>
                                <Typography variant="h4" color="success">+12%</Typography>
                              </div>
                            </div>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </div>
                </div>

                {/* Status Card */}
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Project Status</CardTitle>
                    <CardDescription>Enterprise OS Frontend Development</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing={3}>
                      <div>
                        <Typography variant="body1" className="flex items-center gap-2">
                          <span className="text-green-600">✅</span> Phase 1: Foundation & Setup
                        </Typography>
                        <Typography variant="caption" color="muted" className="ml-7">
                          Completed - All configuration and setup done
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body1" className="flex items-center gap-2">
                          <span className="text-green-600">✅</span> Phase 2: Design System Core
                        </Typography>
                        <Typography variant="caption" color="muted" className="ml-7">
                          Completed - Theme, Typography, Layout, Utilities
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body1" className="flex items-center gap-2">
                          <span className="text-yellow-600">🚧</span> Phase 3: Component Library
                        </Typography>
                        <Typography variant="caption" color="muted" className="ml-7">
                          In Progress - Building UI components
                        </Typography>
                      </div>
                    </Stack>
                  </CardContent>
                  <CardFooter divider>
                    <Typography variant="caption" color="muted">
                      Progress: 35% Complete
                    </Typography>
                  </CardFooter>
                </Card>
                          </section>
            </Stack>
                      </Container>
          </main>
        </div>
      </ToasterWithInit>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)