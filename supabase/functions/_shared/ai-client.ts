/**
 * Centralized Lovable AI Gateway client with error handling and retry logic
 * Enhanced with timeout, malformed response retry, and structured logging
 */

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-3-flash-preview';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const DEFAULT_TIMEOUT_MS = 45000; // 45 second timeout

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | AIMessageContent[];
}

export interface AIMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIRequestOptions {
  model?: string;
  messages: AIMessage[];
  tools?: AITool[];
  tool_choice?: { type: 'function'; function: { name: string } };
  temperature?: number;
  max_tokens?: number;
  timeoutMs?: number;
  correlationId?: string;
}

export interface AIResponse {
  choices: Array<{
    message: {
      content?: string;
      tool_calls?: Array<{
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
}

export interface AIClientError extends Error {
  code: 'RATE_LIMIT' | 'PAYMENT_REQUIRED' | 'AI_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'MALFORMED_RESPONSE';
  status?: number;
  retryable: boolean;
  correlationId?: string;
}

function createError(
  message: string, 
  code: AIClientError['code'], 
  status?: number,
  correlationId?: string
): AIClientError {
  const error = new Error(message) as AIClientError;
  error.code = code;
  error.status = status;
  error.retryable = code === 'RATE_LIMIT' || code === 'NETWORK_ERROR' || code === 'MALFORMED_RESPONSE';
  error.correlationId = correlationId;
  return error;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate AI response structure
 */
function validateResponse(data: unknown, expectedToolName?: string): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Response is not an object' };
  }

  const response = data as AIResponse;
  
  if (!response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
    return { valid: false, error: 'Response has no choices' };
  }

  const message = response.choices[0]?.message;
  if (!message) {
    return { valid: false, error: 'Response has no message' };
  }

  // If we expected a tool call, validate it exists
  if (expectedToolName) {
    const toolCall = message.tool_calls?.find(tc => tc.function?.name === expectedToolName);
    if (!toolCall) {
      return { valid: false, error: `Expected tool call '${expectedToolName}' not found` };
    }
    
    // Try to parse the arguments
    try {
      JSON.parse(toolCall.function.arguments);
    } catch {
      return { valid: false, error: `Tool call '${expectedToolName}' has invalid JSON arguments` };
    }
  }

  return { valid: true };
}

/**
 * Call the Lovable AI Gateway with automatic retry, timeout, and error handling
 */
export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw createError('LOVABLE_API_KEY is not configured', 'AI_ERROR');
  }

  const model = options.model || DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const correlationId = options.correlationId || 'unknown';
  const expectedToolName = options.tool_choice?.function?.name;
  
  let lastError: AIClientError | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[${correlationId}] AI request attempt ${attempt + 1}/${MAX_RETRIES}`);
      
      const response = await fetchWithTimeout(
        AI_GATEWAY_URL,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: options.messages,
            tools: options.tools,
            tool_choice: options.tool_choice,
            temperature: options.temperature ?? 0.1,
            max_tokens: options.max_tokens ?? 4096,
          }),
        },
        timeoutMs
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${correlationId}] AI Gateway error (attempt ${attempt + 1}):`, response.status, errorText);

        if (response.status === 429) {
          lastError = createError('Rate limit exceeded. Please try again later.', 'RATE_LIMIT', 429, correlationId);
          if (attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`[${correlationId}] Rate limited, retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        if (response.status === 402) {
          throw createError('Payment required. Please add credits to your Lovable AI workspace.', 'PAYMENT_REQUIRED', 402, correlationId);
        }

        throw createError(`AI gateway error: ${errorText}`, 'AI_ERROR', response.status, correlationId);
      }

      const data: AIResponse = await response.json();
      
      // Validate response structure
      const validation = validateResponse(data, expectedToolName);
      if (!validation.valid) {
        console.warn(`[${correlationId}] Malformed response (attempt ${attempt + 1}): ${validation.error}`);
        lastError = createError(`Malformed AI response: ${validation.error}`, 'MALFORMED_RESPONSE', undefined, correlationId);
        
        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
          console.log(`[${correlationId}] Retrying after malformed response in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        throw lastError;
      }
      
      console.log(`[${correlationId}] AI request successful`);
      return data;

    } catch (error) {
      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[${correlationId}] Request timeout (attempt ${attempt + 1})`);
        lastError = createError(`Request timed out after ${timeoutMs}ms`, 'TIMEOUT', undefined, correlationId);
        
        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }
        throw lastError;
      }
      
      if ((error as AIClientError).code) {
        throw error; // Re-throw our custom errors
      }

      // Network or other errors
      console.error(`[${correlationId}] Network error (attempt ${attempt + 1}):`, error);
      lastError = createError(`Network error: ${error instanceof Error ? error.message : 'Unknown'}`, 'NETWORK_ERROR', undefined, correlationId);
      
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || createError('Failed after max retries', 'AI_ERROR', undefined, correlationId);
}

/**
 * Extract tool call arguments from AI response with validation
 */
export function extractToolCallArguments<T>(
  response: AIResponse, 
  toolName: string,
  correlationId?: string
): T | null {
  const toolCall = response.choices[0]?.message?.tool_calls?.find(
    tc => tc.function.name === toolName
  );

  if (!toolCall) {
    console.error(`[${correlationId || 'unknown'}] Tool call '${toolName}' not found in response`);
    return null;
  }

  try {
    const parsed = JSON.parse(toolCall.function.arguments) as T;
    console.log(`[${correlationId || 'unknown'}] Successfully parsed tool call '${toolName}'`);
    return parsed;
  } catch (error) {
    console.error(`[${correlationId || 'unknown'}] Failed to parse tool call arguments:`, error);
    return null;
  }
}

/**
 * Extract text content from AI response
 */
export function extractTextContent(response: AIResponse): string | null {
  return response.choices[0]?.message?.content || null;
}
