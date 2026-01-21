/**
 * Interface for response parsers
 * Follows Single Responsibility Principle
 */
export interface IResponseParser {
  /**
   * Parse the raw response string into a structured object
   */
  parse<T = any>(response: string): T;

  /**
   * Validate and extract array from response
   */
  extractArray<T = any>(response: any, key?: string): T[];

  /**
   * Validate task array structure
   */
  validateTaskArray(tasks: any[], context: string): any[];
}

