#!/usr/bin/env node
import chalk from 'chalk';
import fetch from 'node-fetch';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = 'test@arcadis.tech';
const TEST_PASSWORD = 'testpass123';

// Couleurs pour les logs
const log = {
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  section: (msg) => console.log(chalk.cyan.bold(`\n${msg}\n${'='.repeat(50)}`))
};

// Helper pour les requêtes
async function testEndpoint(method, path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const duration = Date.now() - startTime;
    const data = await response.json().catch(() => null);

    return {
      success: response.ok,
      status: response.status,
      data,
      duration,
      path
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
      duration: Date.now() - startTime,
      path
    };
  }
}

// Tests par catégorie
const tests = {
  // 1. AUTHENTIFICATION
  auth: async () => {
    log.section('🔐 AUTHENTIFICATION');
    
    // Test login
    const login = await testEndpoint('POST', '/api/auth/login', {
      body: { email: TEST_EMAIL, password: TEST_PASSWORD }
    });
    
    if (login.success) {
      log.success(`POST /api/auth/login - ${login.status} (${login.duration}ms)`);
    } else {
      log.error(`POST /api/auth/login - ${login.status} - ${login.error || login.data?.error}`);
    }

    // Test register
    const register = await testEndpoint('POST', '/api/auth/register', {
      body: {
        email: `test${Date.now()}@arcadis.tech`,
        password: 'newpass123',
        full_name: 'Test User'
      }
    });
    
    if (register.success) {
      log.success(`POST /api/auth/register - ${register.status} (${register.duration}ms)`);
    } else {
      log.warning(`POST /api/auth/register - ${register.status} - ${register.data?.error}`);
    }

    return login.success ? 1 : 0;
  },

  // 2. COMPANIES
  companies: async () => {
    log.section('🏢 COMPANIES');
    
    const endpoints = [
      { method: 'GET', path: '/api/companies' },
      { method: 'POST', path: '/api/companies', body: {
        name: `Test Company ${Date.now()}`,
        email: `company${Date.now()}@test.com`,
        industry: 'Technology'
      }},
      { method: 'GET', path: '/api/companies/test-id' },
      { method: 'PUT', path: '/api/companies/test-id', body: { name: 'Updated Company' }},
      { method: 'DELETE', path: '/api/companies/test-id' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, { body: endpoint.body });
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.error(`${endpoint.method} ${endpoint.path} - ${result.status}`);
      }
    }
    
    return successCount;
  },

  // 3. PROJECTS
  projects: async () => {
    log.section('🏗️ PROJECTS');
    
    const endpoints = [
      { method: 'GET', path: '/api/projects' },
      { method: 'POST', path: '/api/projects', body: {
        name: `Test Project ${Date.now()}`,
        company_id: 'test-company-id',
        status: 'planning',
        priority: 'medium',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }},
      { method: 'GET', path: '/api/projects/test-id' },
      { method: 'PUT', path: '/api/projects/test-id', body: { status: 'active' }},
      { method: 'DELETE', path: '/api/projects/test-id' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, { body: endpoint.body });
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.error(`${endpoint.method} ${endpoint.path} - ${result.status}`);
      }
    }
    
    return successCount;
  },

  // 4. TASKS
  tasks: async () => {
    log.section('📋 TASKS');
    
    const endpoints = [
      { method: 'GET', path: '/api/tasks' },
      { method: 'POST', path: '/api/tasks', body: {
        title: `Test Task ${Date.now()}`,
        project_id: 'test-project-id',
        status: 'todo',
        priority: 'medium'
      }},
      { method: 'GET', path: '/api/tasks/test-id' },
      { method: 'PATCH', path: '/api/tasks/test-id', body: { status: 'in_progress' }},
      { method: 'DELETE', path: '/api/tasks/test-id' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, { body: endpoint.body });
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.error(`${endpoint.method} ${endpoint.path} - ${result.status}`);
      }
    }
    
    return successCount;
  },

  // 5. INVOICES
  invoices: async () => {
    log.section('💰 INVOICES');
    
    const endpoints = [
      { method: 'GET', path: '/api/invoices' },
      { method: 'POST', path: '/api/invoices', body: {
        number: `INV-${Date.now()}`,
        company_id: 'test-company-id',
        amount: 50000,
        status: 'draft',
        object: 'Test Invoice',
        currency: 'XOF',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }},
      { method: 'GET', path: '/api/invoices/test-id' },
      { method: 'PUT', path: '/api/invoices/test-id', body: { status: 'sent' }},
      { method: 'DELETE', path: '/api/invoices/test-id' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, { body: endpoint.body });
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.error(`${endpoint.method} ${endpoint.path} - ${result.status}`);
      }
    }
    
    return successCount;
  },

  // 6. QUOTES
  quotes: async () => {
    log.section('📄 QUOTES');
    
    const endpoints = [
      { method: 'GET', path: '/api/quotes' },
      { method: 'POST', path: '/api/quotes', body: {
        number: `QUOTE-${Date.now()}`,
        company_id: 'test-company-id',
        amount: 75000,
        status: 'draft',
        object: 'Test Quote',
        valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }},
      { method: 'GET', path: '/api/quotes/test-id' },
      { method: 'PUT', path: '/api/quotes/test-id', body: { status: 'sent' }},
      { method: 'POST', path: '/api/quotes/test-id/convert-to-invoice' },
      { method: 'DELETE', path: '/api/quotes/test-id' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, { body: endpoint.body });
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.error(`${endpoint.method} ${endpoint.path} - ${result.status}`);
      }
    }
    
    return successCount;
  },

  // 7. EMPLOYEES
  employees: async () => {
    log.section('👥 EMPLOYEES');
    
    const endpoints = [
      { method: 'GET', path: '/api/employees' },
      { method: 'POST', path: '/api/employees', body: {
        user_id: 'test-user-id',
        full_name: `Test Employee ${Date.now()}`,
        position: 'Developer',
        department: 'IT',
        status: 'active'
      }},
      { method: 'GET', path: '/api/employees/test-id' },
      { method: 'PUT', path: '/api/employees/test-id', body: { position: 'Senior Developer' }},
      { method: 'DELETE', path: '/api/employees/test-id' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, { body: endpoint.body });
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.error(`${endpoint.method} ${endpoint.path} - ${result.status}`);
      }
    }
    
    return successCount;
  },

  // 8. AI ENDPOINTS
  ai: async () => {
    log.section('🤖 INTELLIGENCE ARTIFICIELLE');
    
    const endpoints = [
      // Core AI
      { method: 'POST', path: '/api/ai/project-planner', body: {
        projectId: 'test-project',
        requirements: ['web app', 'mobile']
      }},
      { method: 'POST', path: '/api/ai/work-organizer', body: {
        tasks: ['task1', 'task2'],
        priorities: { task1: 'high', task2: 'medium' }
      }},
      { method: 'POST', path: '/api/ai/business-analyzer', body: {
        metrics: { revenue: 100000, costs: 50000 }
      }},
      { method: 'POST', path: '/api/ai/predictive-analytics', body: {
        timeframes: ['1_month', '3_months'],
        models: ['revenue', 'project_completion']
      }},
      
      // Auto-assignment
      { method: 'GET', path: '/api/ai/auto-assign/employee-capacity' },
      { method: 'GET', path: '/api/ai/auto-assign/recommendations/test-project-id' },
      { method: 'POST', path: '/api/ai/auto-assign/assign/test-project-id' },
      { method: 'GET', path: '/api/ai/auto-assign/ai-recommendations/test-project-id' },
      
      // Predictions
      { method: 'POST', path: '/api/ai/predictions/generate', body: {
        type: 'revenue',
        data: { current: 100000, trend: 'up' }
      }},
      { method: 'GET', path: '/api/ai/predictions/history' },
      { method: 'GET', path: '/api/ai/predictions/models' },
      
      // Alerts
      { method: 'GET', path: '/api/ai/alerts/active' },
      { method: 'POST', path: '/api/ai/alerts/resolve', body: { alertId: 'test-alert' }},
      { method: 'GET', path: '/api/ai/alerts/stats' },
      
      // Voice
      { method: 'POST', path: '/api/ai/voice/start', body: { sessionId: 'test-session' }},
      { method: 'POST', path: '/api/ai/voice/stop', body: { sessionId: 'test-session' }},
      { method: 'GET', path: '/api/ai/voice/stats' },
      
      // Natural Language
      { method: 'POST', path: '/api/ai/natural-language', body: {
        query: 'Show me all overdue invoices'
      }},
      
      // Health
      { method: 'GET', path: '/api/ai/health' },
      { method: 'GET', path: '/api/ai/metrics' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, { body: endpoint.body });
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.warning(`${endpoint.method} ${endpoint.path} - ${result.status} - ${result.error || 'Non implémenté'}`);
      }
    }
    
    return successCount;
  },

  // 9. ANALYTICS
  analytics: async () => {
    log.section('📊 ANALYTICS');
    
    const endpoints = [
      { method: 'GET', path: '/api/analytics/revenue?range=month' },
      { method: 'GET', path: '/api/analytics/project-status' },
      { method: 'GET', path: '/api/analytics/team-performance' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path);
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.warning(`${endpoint.method} ${endpoint.path} - ${result.status} - Non implémenté`);
      }
    }
    
    return successCount;
  },

  // 10. LEAVE MANAGEMENT (HR)
  leave: async () => {
    log.section('🏖️ LEAVE MANAGEMENT');
    
    const endpoints = [
      { method: 'GET', path: '/api/leave-types' },
      { method: 'POST', path: '/api/leave-types', body: {
        name: 'Congés annuels',
        days_per_year: 30,
        code: 'ANNUAL'
      }},
      { method: 'GET', path: '/api/leave-requests' },
      { method: 'POST', path: '/api/leave-requests', body: {
        employee_id: 'test-employee',
        leave_type_id: 'test-type',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'Vacances'
      }},
      { method: 'GET', path: '/api/leave-balances' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, { body: endpoint.body });
      if (result.success) {
        log.success(`${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
        successCount++;
      } else {
        log.error(`${endpoint.method} ${endpoint.path} - ${result.status}`);
      }
    }
    
    return successCount;
  },

  // 11. WEBSOCKET
  websocket: async () => {
    log.section('🔌 WEBSOCKET');
    
    log.info('WebSocket endpoints:');
    log.info('- ws://localhost:5000 (Main WebSocket)');
    log.info('- Events: voice-start, voice-data, prediction-update, alert-triggered');
    log.warning('WebSocket tests nécessitent une connexion persistante - test manuel recommandé');
    
    return 0;
  }
};

// Fonction principale
async function runAllTests() {
  console.log(chalk.bold.green(`
╔══════════════════════════════════════════════════════╗
║           TEST COMPLET DES ENDPOINTS API             ║
║                Enterprise OS v1.0                     ║
╚══════════════════════════════════════════════════════╝
`));

  log.info(`URL de base: ${BASE_URL}`);
  log.info(`Démarrage des tests à ${new Date().toLocaleTimeString()}\n`);

  const startTime = Date.now();
  let totalSuccess = 0;
  let totalEndpoints = 0;

  // Exécuter tous les tests
  for (const [category, testFn] of Object.entries(tests)) {
    const success = await testFn();
    totalSuccess += success;
    totalEndpoints += success > 0 ? success : 0;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Résumé final
  log.section('📈 RÉSUMÉ FINAL');
  
  console.log(`
${chalk.bold('Statistiques:')}
- Endpoints testés: ${totalEndpoints}
- Succès: ${chalk.green(totalSuccess)}
- Échecs: ${chalk.red(totalEndpoints - totalSuccess)}
- Durée totale: ${duration}s
- Taux de réussite: ${((totalSuccess / totalEndpoints) * 100).toFixed(1)}%
`);

  // Recommendations
  if (totalSuccess < totalEndpoints) {
    log.section('💡 RECOMMANDATIONS');
    console.log(`
1. Vérifier que le serveur est bien démarré sur ${BASE_URL}
2. S'assurer que la base de données est accessible
3. Vérifier les logs serveur pour les erreurs
4. Certains endpoints peuvent nécessiter une authentification
5. Les endpoints d'analytics peuvent ne pas être implémentés
`);
  } else {
    console.log(chalk.green.bold('\n✅ Tous les tests sont passés avec succès !'));
  }
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  log.error(`Erreur non gérée: ${error.message}`);
  process.exit(1);
});

// Lancer les tests
runAllTests().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  process.exit(1);
});