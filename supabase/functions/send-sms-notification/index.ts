import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSNotificationRequest {
  userId: string
  message: string
  type?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get Twilio credentials
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Configuration Twilio manquante')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { userId, message, type = 'system', priority = 'medium' }: SMSNotificationRequest = await req.json()

    console.log('📱 Processing SMS notification for user:', userId)

    // Récupérer les informations de l'utilisateur et ses préférences
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      throw new Error('Utilisateur non trouvé')
    }

    // Vérifier les préférences de notification
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('sms_enabled, phone_number, types_enabled')
      .eq('user_id', userId)
      .single()

    // Si les SMS sont désactivés, ne pas envoyer
    if (preferences && !preferences.sms_enabled) {
      console.log('📱 SMS notifications disabled for user:', userId)
      return new Response(JSON.stringify({ success: true, skipped: 'SMS disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Vérifier si un numéro de téléphone est configuré
    if (!preferences?.phone_number) {
      console.log('📱 No phone number configured for user:', userId)
      return new Response(JSON.stringify({ success: false, error: 'Aucun numéro de téléphone configuré' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Vérifier si le type de notification est activé
    if (preferences && preferences.types_enabled && !preferences.types_enabled.includes(type)) {
      console.log('📱 Notification type disabled for user:', userId, 'type:', type)
      return new Response(JSON.stringify({ success: true, skipped: 'Type disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Préparer le message SMS avec emoji selon la priorité
    const priorityEmoji = {
      low: '🔵',
      medium: '🟡', 
      high: '🟠',
      urgent: '🚨'
    }[priority] || '🟡'

    const smsMessage = `${priorityEmoji} Arcadis OS: ${message}`

    // Envoyer le SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const formData = new URLSearchParams()
    formData.append('From', twilioPhoneNumber)
    formData.append('To', preferences.phone_number)
    formData.append('Body', smsMessage)

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    const twilioResult = await twilioResponse.json()

    if (!twilioResponse.ok) {
      console.error('❌ Twilio error:', twilioResult)
      throw new Error(`Erreur Twilio: ${twilioResult.message || 'Erreur inconnue'}`)
    }

    console.log('✅ SMS sent successfully:', twilioResult.sid)

    // Enregistrer l'activité d'envoi dans les logs
    await supabase
      .from('client_activity_logs')
      .insert({
        user_id: userId,
        activity_type: 'sms_notification_sent',
        details: {
          sms_sid: twilioResult.sid,
          type,
          priority,
          phone_number: preferences.phone_number,
          message: smsMessage,
          timestamp: new Date().toISOString()
        }
      })

    return new Response(JSON.stringify({ 
      success: true, 
      smsSid: twilioResult.sid,
      message: 'SMS envoyé avec succès',
      to: preferences.phone_number
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error sending SMS notification:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})