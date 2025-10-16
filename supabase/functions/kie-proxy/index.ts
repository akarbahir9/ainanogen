import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const KIE_API_URL = 'https://api.kie.ai/api/v1';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main function logic
async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { action, payload } = await req.json();
    const kieApiKey = Deno.env.get('KIE_API_KEY');

    if (!kieApiKey) {
      throw new Error('KIE_API_KEY is not set in Supabase secrets.');
    }

    const authHeaders = {
      'Authorization': `Bearer ${kieApiKey}`,
      'Content-Type': 'application/json',
    };

    let response;

    switch (action) {
      case 'create': {
        const apiPayload = {
          model: 'google/nano-banana',
          input: payload,
        };
        response = await fetch(`${KIE_API_URL}/jobs/createTask`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(apiPayload),
        });
        break;
      }
      case 'edit': {
        const apiPayload = {
          model: 'google/nano-banana-edit',
          input: payload,
        };
        response = await fetch(`${KIE_API_URL}/jobs/createTask`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(apiPayload),
        });
        break;
      }
      case 'status': {
        if (!payload.taskId) {
          throw new Error('taskId is required for status check.');
        }
        response = await fetch(`${KIE_API_URL}/jobs/recordInfo?taskId=${payload.taskId}`, {
          method: 'GET',
          headers: authHeaders,
        });
        break;
      }
      case 'proxy-download': {
        if (!payload.imageUrl) {
          return new Response(JSON.stringify({ error: 'imageUrl is required for proxy download.' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
        try {
          const imageResponse = await fetch(payload.imageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from source. Status: ${imageResponse.status}`);
          }
          // Return the image response directly. The browser will interpret this as a blob.
          return new Response(imageResponse.body, {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': imageResponse.headers.get('Content-Type') || 'application/octet-stream',
              'Content-Length': imageResponse.headers.get('Content-Length') || '',
            },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: `Proxy fetch failed: ${e.message}` }), {
            status: 502, // Bad Gateway
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid action specified.' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.msg || 'An error occurred with the kie.ai API.');
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

// Start the server
serve(handler);
