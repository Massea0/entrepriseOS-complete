import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { Resend } from 'npm:resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationEmailRequest {
  userId: string
  type: string
  title: string
  message: string
  actionUrl?: string
  priority?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { userId, type, title, message, actionUrl, priority = 'medium' }: NotificationEmailRequest = await req.json()

    console.log('📧 Processing notification email for user:', userId)

    // Récupérer les informations de l'utilisateur et ses préférences
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      throw new Error('User not found')
    }

    // Vérifier les préférences de notification
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_enabled, types_enabled, quiet_hours_start, quiet_hours_end, timezone')
      .eq('user_id', userId)
      .single()

    // Si les emails sont désactivés, ne pas envoyer
    if (preferences && !preferences.email_enabled) {
      console.log('📧 Email notifications disabled for user:', userId)
      return new Response(JSON.stringify({ success: true, skipped: 'Email disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Vérifier si le type de notification est activé
    if (preferences && preferences.types_enabled && !preferences.types_enabled.includes(type)) {
      console.log('📧 Notification type disabled for user:', userId, 'type:', type)
      return new Response(JSON.stringify({ success: true, skipped: 'Type disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Construire l'email
    const priorityEmoji = {
      low: '🔵',
      medium: '🟡', 
      high: '🟠',
      urgent: '🔴'
    }[priority] || '🟡'

    const typeEmoji = {
      project: '📋',
      task: '✅',
      support: '🎫',
      workflow: '⚡',
      system: '⚙️'
    }[type] || '📬'

    const emailSubject = `${priorityEmoji} ${title} - Arcadis Entreprise OS`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center; }
            .content { padding: 24px; }
            .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
            .priority-low { background: #dbeafe; color: #1e40af; }
            .priority-medium { background: #fef3c7; color: #92400e; }
            .priority-high { background: #fed7aa; color: #ea580c; }
            .priority-urgent { background: #fecaca; color: #dc2626; }
            .action-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px; }
            .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">${typeEmoji} Arcadis Entreprise OS</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Notification système</p>
            </div>
            <div class="content">
              <div class="priority-badge priority-${priority}">${priorityEmoji} ${priority.toUpperCase()}</div>
              <h2 style="margin: 0 0 16px 0; color: #1e293b;">${title}</h2>
              <p style="margin: 0 0 16px 0; color: #475569;">${message}</p>
              ${actionUrl ? `<a href="${actionUrl}" class="action-button">Voir dans l'application</a>` : ''}
            </div>
            <div class="footer">
              <p style="margin: 0;">© 2025 Arcadis Technologies - Entreprise OS</p>
              <p style="margin: 4px 0 0 0;">Vous recevez cet email car vous êtes inscrit aux notifications.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Envoyer l'email via Resend
    const emailResponse = await resend.emails.send({
      from: 'Arcadis Entreprise OS <onboarding@resend.dev>',
      to: [user.email],
      subject: emailSubject,
      html: emailHtml,
    })

    console.log('✅ Email sent successfully:', emailResponse.id)

    // Enregistrer l'activité d'envoi dans les logs
    await supabase
      .from('client_activity_logs')
      .insert({
        user_id: userId,
        activity_type: 'notification_email_sent',
        details: {
          email_id: emailResponse.id,
          type,
          title,
          priority,
          timestamp: new Date().toISOString()
        }
      })

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.id,
      message: 'Email sent successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error sending notification email:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})