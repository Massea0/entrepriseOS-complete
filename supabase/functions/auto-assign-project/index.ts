// Supabase Edge Function - Auto-assign Project
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmployeeSkills {
  id: string
  full_name: string
  skills: string[]
  currentWorkload: number
  availability: number
  successRate: number
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { projectId } = await req.json()
    
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    // 1. Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      throw new Error('Project not found')
    }

    // 2. Get all active employees with their workload
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        *,
        tasks:tasks(count)
      `)
      .eq('status', 'active')

    if (employeesError) {
      throw new Error('Failed to fetch employees')
    }

    // 3. Calculate scores for each employee
    const scoredEmployees = employees.map(employee => {
      const skills = extractSkills(employee)
      const projectSkills = extractProjectSkills(project)
      
      // Calculate skill match score (0-40)
      const matchingSkills = skills.filter(skill => 
        projectSkills.includes(skill)
      ).length
      const skillScore = projectSkills.length > 0
        ? (matchingSkills / projectSkills.length) * 40
        : 20 // Default if no specific skills required

      // Calculate availability score (0-30)
      const taskCount = employee.tasks?.[0]?.count || 0
      const workload = Math.min(100, taskCount * 10) // Assume 10 tasks = 100% workload
      const availability = Math.max(0, 100 - workload)
      const availabilityScore = (availability / 100) * 30

      // Success rate score (0-20)
      const successScore = 20 // Default as we don't track this yet

      // Specialty bonus (0-10)
      let specialtyBonus = 0
      if (project.priority === 'critical' && employee.position?.includes('Senior')) {
        specialtyBonus = 10
      } else if (project.priority === 'high' && employee.position?.includes('Lead')) {
        specialtyBonus = 5
      }

      const totalScore = skillScore + availabilityScore + successScore + specialtyBonus

      return {
        ...employee,
        score: Math.round(totalScore),
        skills,
        workload,
        availability,
        reasons: generateReasons(employee, project, {
          skillScore,
          availabilityScore,
          specialtyBonus,
          matchingSkills
        })
      }
    })

    // 4. Sort by score and get top recommendation
    const recommendations = scoredEmployees
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(emp => ({
        employeeId: emp.id,
        employeeName: emp.full_name,
        score: emp.score,
        reasons: emp.reasons,
        workloadAfter: emp.workload + 10
      }))

    // 5. Auto-assign to best candidate if score > 60
    const bestMatch = recommendations[0]
    let assigned = false

    if (bestMatch && bestMatch.score > 60) {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          assignedTo: bestMatch.employeeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (!updateError) {
        assigned = true
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        assigned,
        projectId,
        projectName: project.name,
        recommendations,
        bestMatch: assigned ? bestMatch : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper functions
function extractSkills(employee: any): string[] {
  const skills: string[] = []
  const position = employee.position?.toLowerCase() || ''
  const department = employee.department?.toLowerCase() || ''
  
  // Extract from position
  if (position.includes('frontend')) skills.push('frontend', 'react', 'ui/ux')
  if (position.includes('backend')) skills.push('backend', 'api', 'database')
  if (position.includes('fullstack')) skills.push('frontend', 'backend', 'fullstack')
  if (position.includes('mobile')) skills.push('mobile', 'react-native')
  if (position.includes('devops')) skills.push('devops', 'ci/cd', 'cloud')
  if (position.includes('design')) skills.push('design', 'ui/ux', 'figma')
  if (position.includes('manager')) skills.push('management', 'leadership')
  
  // Extract from department
  if (department.includes('tech')) skills.push('technical')
  if (department.includes('product')) skills.push('product', 'planning')
  
  return [...new Set(skills)]
}

function extractProjectSkills(project: any): string[] {
  const skills: string[] = []
  const name = project.name?.toLowerCase() || ''
  const description = project.description?.toLowerCase() || ''
  const combined = `${name} ${description}`
  
  if (combined.includes('web') || combined.includes('site')) {
    skills.push('frontend', 'backend')
  }
  if (combined.includes('mobile') || combined.includes('app')) {
    skills.push('mobile')
  }
  if (combined.includes('api')) {
    skills.push('backend', 'api')
  }
  if (combined.includes('design') || combined.includes('ui')) {
    skills.push('design', 'ui/ux')
  }
  if (combined.includes('cloud') || combined.includes('devops')) {
    skills.push('cloud', 'devops')
  }
  
  return [...new Set(skills)]
}

function generateReasons(
  employee: any, 
  project: any, 
  scores: any
): string[] {
  const reasons: string[] = []
  
  if (scores.matchingSkills > 0) {
    reasons.push(`Compétences correspondantes: ${scores.matchingSkills}`)
  }
  
  if (employee.availability > 70) {
    reasons.push(`Haute disponibilité (${Math.round(employee.availability)}%)`)
  } else if (employee.availability > 40) {
    reasons.push(`Disponibilité modérée (${Math.round(employee.availability)}%)`)
  }
  
  if (scores.specialtyBonus > 0) {
    if (project.priority === 'critical') {
      reasons.push('Expert senior pour projet critique')
    } else if (project.priority === 'high') {
      reasons.push('Lead technique pour projet prioritaire')
    }
  }
  
  if (employee.workload > 60) {
    reasons.push(`⚠️ Charge actuelle: ${Math.round(employee.workload)}%`)
  }
  
  return reasons
}