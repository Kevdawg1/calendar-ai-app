import { IPromptBuilder } from '../interfaces/IPromptBuilder';
import { UserPreferences } from '../userPreferencesService';

/**
 * Base prompt builder that handles user preferences
 * Follows Single Responsibility Principle
 */
export class PromptBuilder implements IPromptBuilder {
  buildPrompt(basePrompt: string, userPreferences?: UserPreferences): string {
    if (!userPreferences) {
      return basePrompt;
    }

    const availableBlocksText = this.getAvailableTimeBlocks(userPreferences);
    return `${basePrompt}\n${availableBlocksText}\n`;
  }

  private getAvailableTimeBlocks(userPreferences: UserPreferences): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const wake = userPreferences.wakeUpTime ? new Date(userPreferences.wakeUpTime) : null;
    const sleep = userPreferences.sleepTime ? new Date(userPreferences.sleepTime) : null;
    
    let result = '=== AVAILABLE TIME BLOCKS ===\n';
    result += 'IMPORTANT: Only schedule tasks during these available time blocks:\n\n';
    
    days.forEach((day) => {
      let blocks: string[] = [];
      const work = userPreferences.hasWorkSchedule && 
                   userPreferences.workSchedule && 
                   userPreferences.workSchedule[day];
      
      if (wake && sleep) {
        if (work && work.startTime && work.endTime) {
          const workStart = new Date(work.startTime);
          const workEnd = new Date(work.endTime);
          
          if (wake < workStart) {
            blocks.push(
              `${this.formatTime(wake)}–${this.formatTime(workStart)}`
            );
          }
          
          if (workEnd < sleep) {
            blocks.push(
              `${this.formatTime(workEnd)}–${this.formatTime(sleep)}`
            );
          }
        } else {
          blocks.push(`${this.formatTime(wake)}–${this.formatTime(sleep)}`);
        }
      }
      
      result += `- ${day}: ${blocks.length > 0 ? blocks.join(', ') : 'N/A'}\n`;
    });
    
    result += '\nDO NOT schedule tasks outside these time blocks.\n';
    result += '=== END AVAILABLE TIME BLOCKS ===\n';
    return result;
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}

