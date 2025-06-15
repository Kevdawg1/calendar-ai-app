import { UserPreferences } from '../services/userPreferencesService';

export function getAvailableTimeBlocks(userPreferences?: UserPreferences): string {
  if (!userPreferences) return '';
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const wake = userPreferences.wakeUpTime ? new Date(userPreferences.wakeUpTime) : null;
  const sleep = userPreferences.sleepTime ? new Date(userPreferences.sleepTime) : null;
  let result = '=== AVAILABLE TIME BLOCKS ===\n';
  result += 'IMPORTANT: Only schedule tasks during these available time blocks:\n\n';
  days.forEach(day => {
    let blocks: string[] = [];
    // If work schedule exists for this day, block out work
    const work = userPreferences.hasWorkSchedule && userPreferences.workSchedule && userPreferences.workSchedule[day];
    if (wake && sleep) {
      // If work exists, split into before work and after work
      if (work && work.startTime && work.endTime) {
        const workStart = new Date(work.startTime);
        const workEnd = new Date(work.endTime);
        // Before work
        if (wake < workStart) {
          blocks.push(`${wake.getHours().toString().padStart(2, '0')}:${wake.getMinutes().toString().padStart(2, '0')}–${workStart.getHours().toString().padStart(2, '0')}:${workStart.getMinutes().toString().padStart(2, '0')}`);
        }
        // After work
        if (workEnd < sleep) {
          blocks.push(`${workEnd.getHours().toString().padStart(2, '0')}:${workEnd.getMinutes().toString().padStart(2, '0')}–${sleep.getHours().toString().padStart(2, '0')}:${sleep.getMinutes().toString().padStart(2, '0')}`);
        }
      } else {
        // No work, available from wake to sleep
        blocks.push(`${wake.getHours().toString().padStart(2, '0')}:${wake.getMinutes().toString().padStart(2, '0')}–${sleep.getHours().toString().padStart(2, '0')}:${sleep.getMinutes().toString().padStart(2, '0')}`);
      }
    }
    result += `- ${day}: ${blocks.length > 0 ? blocks.join(', ') : 'N/A'}\n`;
  });
  result += '\nDO NOT schedule tasks outside these time blocks.\n';
  result += '=== END AVAILABLE TIME BLOCKS ===\n';
  return result;
}

export const OPENAI_CONFIG = {
  endpoint: 'https://calendar-ai.openai.azure.com/',
  apiKey: 'E5iUsb1W3fHZgYHoxYagSAPHqEe9l9hInO1wJYnD2Th4JOhCPaCiJQQJ99BFACL93NaXJ3w3AAAAACOGKXdj',
  deployment: 'gpt-35-turbo',
  maxTokens: 2000,
  temperature: 0.7
}; 