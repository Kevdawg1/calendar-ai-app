import { IResponseParser } from '../interfaces/IResponseParser';

/**
 * Specialized parser for subtask responses
 * Follows Single Responsibility Principle
 */
export class SubtaskParser {
  constructor(private responseParser: IResponseParser) {}

  parseSubtasks(response: string): any[] {
    const parsedResponse = this.responseParser.parse(response);
    
    // Handle the object structure where each component is a key with an array of subtasks
    if (typeof parsedResponse === 'object' && !Array.isArray(parsedResponse)) {
      const tasksObject = parsedResponse.tasks || parsedResponse;
      
      // Handle the case where tasks is an array of component objects
      if (Array.isArray(tasksObject)) {
        return tasksObject.flatMap((componentObj: any) => {
          const componentName = componentObj.component || 'Unknown';
          const subtasks = componentObj.subtasks || [];
          
          if (!Array.isArray(subtasks)) {
            console.warn('Subtasks is not an array for component:', componentName);
            return [];
          }
          
          return subtasks.map((subtask: any) => ({
            ...subtask,
            component: componentName
          }));
        });
      } else {
        // Handle the case where tasks is an object with component keys
        return Object.entries(tasksObject).flatMap(([component, subtasks]) => {
          if (!Array.isArray(subtasks)) {
            console.warn('Subtasks is not an array for component:', component);
            return [];
          }
          
          return subtasks.map((subtask: any) => ({
            ...subtask,
            component
          }));
        });
      }
    } else if (Array.isArray(parsedResponse)) {
      return parsedResponse;
    } else {
      // Fallback: try to extract any array-like structure
      if (parsedResponse && typeof parsedResponse === 'object') {
        const allKeys = Object.keys(parsedResponse);
        const arrayKeys = allKeys.filter(key => Array.isArray(parsedResponse[key]));
        
        if (arrayKeys.length > 0) {
          console.log('Found array keys:', arrayKeys);
          return arrayKeys.flatMap(key => {
            const items = parsedResponse[key];
            return items.map((item: any) => ({
              ...item,
              component: key
            }));
          });
        } else {
          throw new Error('No valid array structure found in response');
        }
      } else {
        throw new Error('Invalid subtasks format');
      }
    }
  }
}

