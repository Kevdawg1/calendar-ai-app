import { IAIClient } from '../interfaces/IAIClient';
import { IHttpClient } from '../interfaces/IHttpClient';
import { IResponseParser } from '../interfaces/IResponseParser';
import { ITaskMetadataEnricher } from '../interfaces/ITaskMetadataEnricher';
import { HttpClient } from '../clients/HttpClient';
import { AzureOpenAIClient } from '../clients/AzureOpenAIClient';
import { ResponseParser } from '../parsers/ResponseParser';
import { TaskMetadataEnricher } from '../enrichers/TaskMetadataEnricher';

/**
 * Service factory for dependency injection
 * Follows Dependency Inversion Principle - provides abstractions
 */
export class ServiceFactory {
  private static httpClient: IHttpClient | null = null;
  private static aiClient: IAIClient | null = null;
  private static responseParser: IResponseParser | null = null;
  private static taskMetadataEnricher: ITaskMetadataEnricher | null = null;

  static getHttpClient(): IHttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient();
    }
    return this.httpClient;
  }

  static getAIClient(): IAIClient {
    if (!this.aiClient) {
      const httpClient = this.getHttpClient();
      this.aiClient = new AzureOpenAIClient(httpClient);
    }
    return this.aiClient;
  }

  static getResponseParser(): IResponseParser {
    if (!this.responseParser) {
      this.responseParser = new ResponseParser();
    }
    return this.responseParser;
  }

  static getTaskMetadataEnricher(): ITaskMetadataEnricher {
    if (!this.taskMetadataEnricher) {
      this.taskMetadataEnricher = new TaskMetadataEnricher();
    }
    return this.taskMetadataEnricher;
  }

  // Allow dependency injection for testing
  static setHttpClient(client: IHttpClient): void {
    this.httpClient = client;
  }

  static setAIClient(client: IAIClient): void {
    this.aiClient = client;
  }

  static setResponseParser(parser: IResponseParser): void {
    this.responseParser = parser;
  }

  static setTaskMetadataEnricher(enricher: ITaskMetadataEnricher): void {
    this.taskMetadataEnricher = enricher;
  }

  // Reset all services (useful for testing)
  static reset(): void {
    this.httpClient = null;
    this.aiClient = null;
    this.responseParser = null;
    this.taskMetadataEnricher = null;
  }
}

