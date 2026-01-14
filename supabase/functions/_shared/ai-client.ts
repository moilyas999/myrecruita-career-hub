/**
 * Centralized Lovable AI Gateway client with error handling and retry logic
 */

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-3-flash-preview';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

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
  code: 'RATE_LIMIT' | 'PAYMENT_REQUIRED' | 'AI_ERROR' | 'NETWORK_ERROR';
  status?: number;
  retryable: boolean;
}

function createError(message: string, code: AIClientError['code'], status?: number): AIClientError {
  const error = new Error(message) as AIClientError;
  error.code = code;
  error.status = status;
  error.retryable = code === 'RATE_LIMIT' || code === 'NETWORK_ERROR';
  return error;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call the Lovable AI Gateway with automatic retry and error handling
 */
export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw createError('LOVABLE_API_KEY is not configured', 'AI_ERROR');
  }

  const model = options.model || DEFAULT_MODEL;
  let lastError: AIClientError | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(AI_GATEWAY_URL, {
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI Gateway error (attempt ${attempt + 1}):`, response.status, errorText);

        if (response.status === 429) {
          lastError = createError('Rate limit exceeded. Please try again later.', 'RATE_LIMIT', 429);
          if (attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`Rate limited, retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        if (response.status === 402) {
          throw createError('Payment required. Please add credits to your Lovable AI workspace.', 'PAYMENT_REQUIRED', 402);
        }

        throw createError(`AI gateway error: ${errorText}`, 'AI_ERROR', response.status);
      }

      const data: AIResponse = await response.json();
      return data;

    } catch (error) {
      if ((error as AIClientError).code) {
        throw error; // Re-throw our custom errors
      }

      // Network or other errors
      console.error(`Network error (attempt ${attempt + 1}):`, error);
      lastError = createError(`Network error: ${error instanceof Error ? error.message : 'Unknown'}`, 'NETWORK_ERROR');
      
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || createError('Failed after max retries', 'AI_ERROR');
}

/**
 * Extract tool call arguments from AI response
 */
export function extractToolCallArguments<T>(response: AIResponse, toolName: string): T | null {
  const toolCall = response.choices[0]?.message?.tool_calls?.find(
    tc => tc.function.name === toolName
  );

  if (!toolCall) {
    console.error(`Tool call '${toolName}' not found in response`);
    return null;
  }

  try {
    return JSON.parse(toolCall.function.arguments) as T;
  } catch (error) {
    console.error('Failed to parse tool call arguments:', error);
    return null;
  }
}

/**
 * Extract text content from AI response
 */
export function extractTextContent(response: AIResponse): string | null {
  return response.choices[0]?.message?.content || null;
}
