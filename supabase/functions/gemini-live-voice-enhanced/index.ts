import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration des voix disponibles (les meilleures pour le français)
const VOICE_CONFIGS = {
  french: {
    male: "Kore", // Voix masculine française naturelle
    female: "Aoede", // Voix féminine française naturelle
    professional: "Charon" // Voix professionnelle neutre
  },
  english: {
    male: "Puck",
    female: "Fenrir",
    professional: "Charon"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let geminiWs: WebSocket | null = null;
  
  // Contexte de l'utilisateur et de l'entreprise
  let userContext = {
    userId: '',
    language: 'fr',
    voicePreference: 'professional',
    module: 'dashboard'
  };

  // Client Supabase pour récupérer les données
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  socket.onopen = () => {
    console.log("Client connecté à Gemini Live Enhanced");
  };

  // Fonction pour initialiser Gemini avec le contexte
  const initializeGemini = async (context: any) => {
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${geminiApiKey}`;
    
    geminiWs = new WebSocket(geminiUrl);
    
    geminiWs.onopen = async () => {
      console.log("Connecté à Gemini Live API");
      
      // Récupérer les données contextuelles de l'entreprise
      let contextData = {
        projects: 0,
        tasks: 0,
        employees: 0,
        revenue: 0
      };

      try {
        // Récupération intelligente des données selon le contexte
        const [projectsRes, tasksRes, employeesRes, invoicesRes] = await Promise.all([
          supabase.from('projects').select('id,name,status').limit(5),
          supabase.from('tasks').select('id,title,status').limit(10),
          supabase.from('employees').select('id,first_name,last_name').limit(5),
          supabase.from('invoices').select('amount,status').eq('status', 'paid').limit(10)
        ]);

        contextData = {
          projects: projectsRes.data?.length || 0,
          tasks: tasksRes.data?.length || 0,
          employees: employeesRes.data?.length || 0,
          revenue: invoicesRes.data?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
        };
      } catch (error) {
        console.error("Erreur récupération contexte:", error);
      }

      // Configuration optimale pour Gemini avec voix naturelle
      const setupMessage = {
        setup: {
          model: "models/gemini-2.0-flash-exp",
          generation_config: {
            response_modalities: ["AUDIO", "TEXT"], // Audio ET texte pour debug
            speech_config: {
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: VOICE_CONFIGS[context.language === 'fr' ? 'french' : 'english'][context.voicePreference] || "Aoede"
                }
              },
              audio_encoding: "LINEAR16", // Meilleure qualité audio
              speaking_rate: 1.0, // Vitesse naturelle
              pitch: 0, // Pitch normal
              volume_gain_db: 0 // Volume normal
            },
            temperature: 0.8, // Plus de variabilité pour plus naturel
            candidate_count: 1
          },
          system_instruction: {
            parts: [
              {
                text: `Tu es Synapse, l'assistant IA vocal d'Arcadis Technologies.
                
VOIX ET TON:
- Parle de manière TRÈS naturelle et conversationnelle
- Utilise des pauses naturelles, des "euh", "hmm" parfois
- Varie ton intonation selon le contexte
- Sois chaleureux et professionnel

CONTEXTE ENTREPRISE ACTUEL:
- ${contextData.projects} projets en cours
- ${contextData.tasks} tâches actives  
- ${contextData.employees} employés
- Chiffre d'affaires : ${contextData.revenue} FCFA
- Module actuel : ${context.module}

INSTRUCTIONS:
- Réponds en ${context.language === 'fr' ? 'français' : 'anglais'}
- Sois concis mais naturel (comme une vraie conversation)
- Utilise les données réelles dans tes réponses
- Adapte ton ton selon le contexte (plus formel pour finance, plus décontracté pour général)
- IMPORTANT: Ne liste JAMAIS tes capacités sauf si demandé`
              }
            ]
          },
          tools: []
        }
      };
      
      geminiWs.send(JSON.stringify(setupMessage));
      
      // Envoyer confirmation au client
      socket.send(JSON.stringify({
        type: 'gemini_connected',
        voice: VOICE_CONFIGS[context.language === 'fr' ? 'french' : 'english'][context.voicePreference],
        contextLoaded: true,
        stats: contextData
      }));
    };

    geminiWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Log pour debug
        if (data.serverContent?.modelTurn?.parts) {
          for (const part of data.serverContent.modelTurn.parts) {
            if (part.text) {
              console.log("Réponse texte Gemini:", part.text);
            }
            if (part.inlineData?.mimeType === 'audio/pcm') {
              console.log("Audio reçu, taille:", part.inlineData.data.length);
            }
          }
        }
        
        // Transférer la réponse au client
        socket.send(event.data);
      } catch (error) {
        console.error("Erreur parsing réponse Gemini:", error);
      }
    };

    geminiWs.onerror = (error) => {
      console.error("Erreur WebSocket Gemini:", error);
      socket.send(JSON.stringify({ 
        error: "Erreur de connexion avec Gemini Live",
        details: error.message
      }));
    };

    geminiWs.onclose = () => {
      console.log("WebSocket Gemini fermé");
    };
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Gestion des messages de configuration
      if (message.type === 'init') {
        userContext = {
          ...userContext,
          ...message.context
        };
        
        // Initialiser Gemini avec le contexte utilisateur
        await initializeGemini(userContext);
        return;
      }

      // Gestion du changement de voix
      if (message.type === 'change_voice') {
        userContext.voicePreference = message.voicePreference;
        
        // Réinitialiser Gemini avec la nouvelle voix
        if (geminiWs) {
          geminiWs.close();
        }
        await initializeGemini(userContext);
        return;
      }
      
      // Transférer le message à Gemini
      if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        // Enrichir le message avec le contexte si c'est une question
        if (message.client_content?.turns?.[0]?.parts?.[0]?.text) {
          const userText = message.client_content.turns[0].parts[0].text;
          
          // Ajouter des instructions contextuelles invisibles
          message.client_content.turns[0].parts[0].text = `[Context: Module ${userContext.module}] ${userText}`;
        }
        
        geminiWs.send(JSON.stringify(message));
      } else {
        // Auto-initialiser si pas connecté
        if (!geminiWs) {
          await initializeGemini(userContext);
          
          // Réessayer l'envoi après connexion
          setTimeout(() => {
            if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
              geminiWs.send(JSON.stringify(message));
            }
          }, 1000);
        } else {
          socket.send(JSON.stringify({ 
            error: "Gemini pas encore prêt, veuillez réessayer"
          }));
        }
      }
    } catch (error) {
      console.error("Erreur traitement message client:", error);
      socket.send(JSON.stringify({ 
        error: "Erreur de traitement",
        details: error.message
      }));
    }
  };

  socket.onclose = () => {
    console.log("Client déconnecté");
    if (geminiWs) {
      geminiWs.close();
    }
  };

  socket.onerror = (error) => {
    console.error("Erreur WebSocket client:", error);
  };

  return response;
});