// Mock hook for HR data until services are properly configured

export const useHRMock = () => {
  const mockOrgChart = [
    {
      id: 'root',
      employee: {
        id: 'mock-user-admin',
        firstName: 'Admin',
        lastName: 'Système',
        position: { title: 'Directeur Général', level: 'director' },
        department: { id: '1', name: 'Direction' },
        email: 'admin@entrepriseos.com',
        avatar: null,
        status: 'active',
        hireDate: '2020-01-01',
        performanceRating: 4.8,
        employmentType: 'fullTime'
      },
      children: [
        {
          id: 'hr-dept',
          employee: {
            id: 'mock-user-hr',
            firstName: 'Sophie',
            lastName: 'RH',
            position: { title: 'Responsable RH', level: 'manager' },
            department: { id: '4', name: 'Ressources Humaines' },
            email: 'hr@entrepriseos.com',
            avatar: null,
            status: 'active',
            hireDate: '2021-03-15',
            performanceRating: 4.5,
            employmentType: 'fullTime'
          },
          children: []
        },
        {
          id: 'sales-dept',
          employee: {
            id: 'mock-user-manager',
            firstName: 'Marie',
            lastName: 'Manager',
            position: { title: 'Manager Commercial', level: 'manager' },
            department: { id: '2', name: 'Ventes' },
            email: 'manager@entrepriseos.com',
            avatar: null,
            status: 'active',
            hireDate: '2020-06-01',
            performanceRating: 4.2,
            employmentType: 'fullTime'
          },
          children: [
            {
              id: 'employee-1',
              employee: {
                id: 'mock-user-employee',
                firstName: 'Jean',
                lastName: 'Employé',
                position: { title: 'Commercial', level: 'employee' },
                department: { id: '2', name: 'Ventes' },
                email: 'employee@entrepriseos.com',
                avatar: null,
                status: 'active',
                hireDate: '2022-09-01',
                performanceRating: 3.8,
                employmentType: 'fullTime'
              },
              children: []
            }
          ]
        }
      ]
    }
  ];

  const mockDepartments = [
    { id: '1', name: 'Direction', managerId: 'mock-user-admin', employeeCount: 1 },
    { id: '2', name: 'Ventes', managerId: 'mock-user-manager', employeeCount: 5 },
    { id: '3', name: 'Production', managerId: 'mock-user-manager', employeeCount: 8 },
    { id: '4', name: 'Ressources Humaines', managerId: 'mock-user-hr', employeeCount: 3 },
    { id: '5', name: 'Finance', managerId: 'mock-user-finance', employeeCount: 4 }
  ];

  const mockEmployees = [
    {
      id: 'mock-user-admin',
      firstName: 'Admin',
      lastName: 'Système',
      email: 'admin@entrepriseos.com',
      position: 'Directeur Général',
      department: 'Direction',
      status: 'active',
      hireDate: '2020-01-01',
      performanceRating: 4.8,
      employmentType: 'fullTime'
    },
    {
      id: 'mock-user-hr',
      firstName: 'Sophie',
      lastName: 'RH',
      email: 'hr@entrepriseos.com',
      position: 'Responsable RH',
      department: 'Ressources Humaines',
      status: 'active',
      hireDate: '2021-03-15',
      performanceRating: 4.5,
      employmentType: 'fullTime'
    },
    {
      id: 'mock-user-manager',
      firstName: 'Marie',
      lastName: 'Manager',
      email: 'manager@entrepriseos.com',
      position: 'Manager Commercial',
      department: 'Ventes',
      status: 'active',
      hireDate: '2020-06-01',
      performanceRating: 4.2,
      employmentType: 'fullTime'
    },
    {
      id: 'mock-user-employee',
      firstName: 'Jean',
      lastName: 'Employé',
      email: 'employee@entrepriseos.com',
      position: 'Commercial',
      department: 'Ventes',
      status: 'active',
      hireDate: '2022-09-01',
      performanceRating: 3.8,
      employmentType: 'fullTime'
    }
  ];

  return {
    orgChart: mockOrgChart,
    departments: mockDepartments,
    employees: mockEmployees,
    isLoading: false,
    error: null
  };
};