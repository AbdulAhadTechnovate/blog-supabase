import type { GraphQLResponse } from './types';

/**
 * GraphQL client for Supabase GraphQL API
 */
export class GraphQLClient {
  private url: string;
  private anonKey: string;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required',
      );
    }

    this.url = `${url}/graphql/v1`;
    this.anonKey = anonKey;
  }

  /**
   * Execute a GraphQL query or mutation with retry logic
   */
  async request<T>(
    query: string,
    variables?: Record<string, unknown>,
    headers?: Record<string, string>,
    retries = 2,
  ): Promise<GraphQLResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(this.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: this.anonKey,
            Authorization: `Bearer ${this.anonKey}`,
            ...headers,
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        });

        // Handle HTTP errors
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `GraphQL request failed: ${response.statusText}`;
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            // If parsing fails, use the text as is
            if (errorText) {
              errorMessage = errorText;
            }
          }

          // Retry on 5xx errors (server errors)
          if (response.status >= 500 && attempt < retries) {
            await this.delay(1000 * (attempt + 1)); // Exponential backoff
            continue;
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();

        // Handle GraphQL errors
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          const errorMessages = result.errors.map(
            (e: { message: string; path?: Array<string | number> }) => {
              const path = e.path ? ` at ${e.path.join('.')}` : '';
              return `${e.message}${path}`;
            },
          ).join(', ');
          
          throw new Error(`GraphQL errors: ${errorMessages}`);
        }

        return result as GraphQLResponse<T>;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Retry on network errors
        if (
          (error instanceof TypeError || error instanceof Error) &&
          (error.message.includes('fetch') || error.message.includes('network')) &&
          attempt < retries
        ) {
          await this.delay(1000 * (attempt + 1)); // Exponential backoff
          continue;
        }

        // Don't retry on other errors
        throw lastError;
      }
    }

    throw lastError || new Error('GraphQL request failed after retries');
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute a GraphQL query or mutation with authentication token
   */
  async authenticatedRequest<T>(
    query: string,
    token: string,
    variables?: Record<string, unknown>,
  ): Promise<GraphQLResponse<T>> {
    return this.request<T>(query, variables, {
      Authorization: `Bearer ${token}`,
    });
  }
}

/**
 * Create a new GraphQL client instance
 */
export function createGraphQLClient() {
  return new GraphQLClient();
}

