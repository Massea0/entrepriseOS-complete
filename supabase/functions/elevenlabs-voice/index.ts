import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration des voix ElevenLabs pour le français
const ELEVENLABS_VOICES = {
  french: {
    rachel: "21m00Tcm4TlvDq8ikWAM", // Rachel - Voix féminine française naturelle
    bella: "EXAVITQu4vr4xnSDxMaL", // Bella - Voix féminine jeune
    antoni: "ErXwobaYiN019PkySvjV", // Antoni - Voix masculine
    clyde: "2EiwWnXFnvU5JabPnv8n", // Clyde - Voix masculine grave
  },
  english: {
    adam: "pNInz6obpgDQGcFmaJgB",
    nicole: "piTKgcLEGmPE4e6mEKli",
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'rachel', language = 'fr', stream = true } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!elevenLabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sélectionner la voix appropriée
    const voiceId = ELEVENLABS_VOICES[language]?.[voice] || ELEVENLABS_VOICES.french.rachel;

    // Configuration optimale pour une voix naturelle
    const voiceSettings = {
      stability: 0.5,          // Équilibre entre stabilité et expressivité
      similarity_boost: 0.75,  // Fidélité à la voix originale
      style: 0.5,             // Style expressif
      use_speaker_boost: true  // Amélioration de la qualité
    };

    // Endpoint pour streaming ou non-streaming
    const endpoint = stream 
      ? `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`
      : `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    // Appel à l'API ElevenLabs
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
        'Accept': stream ? 'audio/mpeg' : 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2", // Meilleur modèle pour le français
        voice_settings: voiceSettings,
        optimize_streaming_latency: stream ? 3 : 0, // Optimisation pour streaming
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return new Response(
        JSON.stringify({ error: 'Text-to-speech generation failed', details: error }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pour le streaming, transférer directement l'audio
    if (stream) {
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Pour non-streaming, retourner le base64
    const audioData = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData)));

    return new Response(
      JSON.stringify({
        audio: base64Audio,
        voice_id: voiceId,
        character_count: text.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in elevenlabs-voice function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/* 
UTILISATION FRONTEND:

// 1. Appel simple (non-streaming)
const response = await supabase.functions.invoke('elevenlabs-voice', {
  body: {
    text: "Bonjour, comment puis-je vous aider aujourd'hui ?",
    voice: 'rachel',
    language: 'fr',
    stream: false
  }
});

// Jouer l'audio
const audioBlob = new Blob([atob(response.data.audio)], { type: 'audio/mpeg' });
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
await audio.play();

// 2. Streaming (pour réduire la latence)
const streamResponse = await fetch(
  `${supabaseUrl}/functions/v1/elevenlabs-voice`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: "Voici votre rapport mensuel...",
      voice: 'rachel',
      stream: true
    })
  }
);

// Jouer le stream audio
const audioUrl = URL.createObjectURL(streamResponse.body);
const audio = new Audio(audioUrl);
audio.play();

// 3. Composant React avec ElevenLabs
export const ElevenLabsVoice = ({ text, onComplete }) => {
  const playElevenLabsVoice = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-voice', {
        body: { text, voice: 'rachel', language: 'fr' }
      });
      
      if (error) throw error;
      
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], 
        { type: 'audio/mpeg' }
      );
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      audio.onended = () => onComplete?.();
      await audio.play();
      
    } catch (error) {
      console.error('ElevenLabs error:', error);
      // Fallback to Web Speech API
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      speechSynthesis.speak(utterance);
    }
  };
  
  return <Button onClick={playElevenLabsVoice}>Lire avec ElevenLabs</Button>;
};
*/