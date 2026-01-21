import { IAIClient, AIRequestOptions } from '../interfaces/IAIClient';
import { IHttpClient } from '../interfaces/IHttpClient';
import { openaiConfig } from '../../config/openai';

/**
 * Azure OpenAI client implementation
 * Follows Single Responsibility Principle - only handles AI API communication
 * Follows Dependency Inversion Principle - depends on IHttpClient abstraction
 */
export class AzureOpenAIClient implements IAIClient {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly deployment: string;
  private readonly defaultApiVersion = '2024-02-15-preview';

  constructor(
    private httpClient: IHttpClient,
    config?: {
      endpoint?: string;
      apiKey?: string;
      deployment?: string;
    }
  ) {
    this.endpoint = config?.endpoint || openaiConfig.endpoint || '';
    this.apiKey = config?.apiKey || openaiConfig.apiKey || '';
    this.deployment = config?.deployment || openaiConfig.deployment || '';

    if (!this.endpoint || !this.apiKey || !this.deployment) {
      throw new Error('Azure OpenAI configuration is missing');
    }
  }

  async makeRequest(
    systemPrompt: string,
    userPrompt: string,
    options: AIRequestOptions = {}
  ): Promise<string> {
    const {
      maxTokens = 2000,
      temperature = 0.7,
      responseFormat = 'json_object',
      apiVersion = this.defaultApiVersion,
    } = options;

    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await this.httpClient.post<{
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    }>(
      url,
      {
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
        response_format: { type: responseFormat },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    return response.data.choices[0].message.content;
  }
}

