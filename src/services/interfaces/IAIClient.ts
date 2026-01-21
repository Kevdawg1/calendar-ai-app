/**
 * Interface for AI client implementations
 * Follows Dependency Inversion Principle - high-level modules depend on abstractions
 */
export interface IAIClient {
  /**
   * Makes a request to the AI service
   * @param systemPrompt System message for the AI
   * @param userPrompt User message/prompt
   * @param options Optional configuration for the request
   */
  makeRequest(
    systemPrompt: string,
    userPrompt: string,
    options?: AIRequestOptions
  ): Promise<string>;
}

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'json_object' | 'text';
  apiVersion?: string;
}

