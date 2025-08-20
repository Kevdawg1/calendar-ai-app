import axios from 'axios';
import { Task, Meeting } from '../types';
import { openaiConfig } from '../config/openai';

export interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  keywords: string[];
  overallSentiment: 'positive' | 'negative' | 'neutral';
}

export interface ConnectionAnalysis {
  meetingId: string;
  taskId: string;
  connectionStrength: number; // 0-1 scale
  connectionType: 'thematic' | 'temporal' | 'goal-related' | 'weak';
  reasoning: string;
}

export const sentimentAnalysisService = {
  /**
   * Analyze sentiment of a text (meeting or task title/description)
   */
  analyzeSentiment: async (text: string): Promise<SentimentAnalysis> => {
    try {
      console.log('Analyzing sentiment for:', text);

      const response = await axios.post(
        `${openaiConfig.endpoint}/openai/deployments/${openaiConfig.deployment}/chat/completions?api-version=2024-02-15-preview`,
        {
          messages: [
            {
              role: "system",
              content: "You are a sentiment analysis expert. Analyze the given text and return a JSON object with sentiment scores and keywords."
            },
            {
              role: "user",
              content: `Analyze the sentiment of this text: "${text}"
              
              Return a JSON object with:
              - positive: number (0-1, how positive the sentiment is)
              - negative: number (0-1, how negative the sentiment is) 
              - neutral: number (0-1, how neutral the sentiment is)
              - keywords: array of strings (key terms that indicate sentiment)
              - overallSentiment: string ("positive", "negative", or "neutral")
              
              Consider context, tone, and emotional indicators in the text.`
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': openaiConfig.apiKey
          }
        }
      );

      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      const content = response.data.choices[0].message.content;
      const analysis = JSON.parse(content);
      
      console.log('Sentiment analysis result:', analysis);
      return analysis;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Return neutral sentiment as fallback
      return {
        positive: 0.33,
        negative: 0.33,
        neutral: 0.34,
        keywords: [],
        overallSentiment: 'neutral'
      };
    }
  },

  /**
   * Find connections between meetings and tasks based on sentiment and content analysis
   */
  findMeetingTaskConnections: async (
    meetings: Meeting[],
    tasks: Task[]
  ): Promise<ConnectionAnalysis[]> => {
    try {
      console.log('Finding connections between meetings and tasks');

      const connections: ConnectionAnalysis[] = [];

      for (const meeting of meetings) {
        for (const task of tasks) {
          const connection = await analyzeConnection(meeting, task);
          if (connection.connectionStrength > 0.3) { // Only include meaningful connections
            connections.push(connection);
          }
        }
      }

      console.log('Found connections:', connections);
      return connections;
    } catch (error) {
      console.error('Error finding meeting-task connections:', error);
      return [];
    }
  },

  /**
   * Get tasks that should be completed before a specific meeting
   */
  getPrerequisiteTasks: async (
    meeting: Meeting,
    tasks: Task[]
  ): Promise<Task[]> => {
    try {
      console.log('Finding prerequisite tasks for meeting:', meeting.title);

      const response = await axios.post(
        `${openaiConfig.endpoint}/openai/deployments/${openaiConfig.deployment}/chat/completions?api-version=2024-02-15-preview`,
        {
          messages: [
            {
              role: "system",
              content: "You are an intelligent task prioritization assistant. Analyze which tasks should be completed before a meeting based on content, goals, and logical dependencies."
            },
            {
              role: "user",
              content: `Meeting: "${meeting.title}"
              ${meeting.description ? `Description: ${meeting.description}` : ''}
              Type: ${meeting.type}
              Priority: ${meeting.priority}
              
              Available Tasks:
              ${tasks.map(task => `
                - ${task.title}
                  Description: ${task.description || 'N/A'}
                  Goal: ${task.goalId}
                  Category: ${task.category || 'N/A'}
                  Priority: ${task.priority || 'medium'}
              `).join('\n')}
              
              Return a JSON array of task IDs that should be completed before this meeting. Consider:
              1. Tasks that prepare for the meeting topic
              2. Tasks that align with the meeting's goals
              3. Tasks that would make the meeting more productive
              4. Tasks that are prerequisites for meeting outcomes
              
              Only include tasks that have a clear logical connection to the meeting.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': openaiConfig.apiKey
          }
        }
      );

      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);
      
      const prerequisiteTaskIds = Array.isArray(result) ? result : result.taskIds || [];
      const prerequisiteTasks = tasks.filter(task => prerequisiteTaskIds.includes(task.id));
      
      console.log('Prerequisite tasks for meeting:', prerequisiteTasks);
      return prerequisiteTasks;
    } catch (error) {
      console.error('Error finding prerequisite tasks:', error);
      return [];
    }
  },

  /**
   * Update meeting sentiment analysis
   */
  updateMeetingSentiment: async (meeting: Meeting): Promise<Meeting> => {
    try {
      const textToAnalyze = `${meeting.title} ${meeting.description || ''}`;
      const sentiment = await sentimentAnalysisService.analyzeSentiment(textToAnalyze);
      
      return {
        ...meeting,
        sentiment,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating meeting sentiment:', error);
      return meeting;
    }
  }
};

async function analyzeConnection(meeting: Meeting, task: Task): Promise<ConnectionAnalysis> {
  try {
    const response = await axios.post(
      `${openaiConfig.endpoint}/openai/deployments/${openaiConfig.deployment}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages: [
          {
            role: "system",
            content: "You are a connection analysis expert. Analyze the relationship between a meeting and a task."
          },
          {
            role: "user",
            content: `Meeting: "${meeting.title}"
            ${meeting.description ? `Description: ${meeting.description}` : ''}
            Type: ${meeting.type}
            
            Task: "${task.title}"
            ${task.description ? `Description: ${task.description}` : ''}
            Goal: ${task.goalId}
            Category: ${task.category || 'N/A'}
            
            Analyze the connection between this meeting and task. Return a JSON object with:
            - connectionStrength: number (0-1, how strong the connection is)
            - connectionType: string ("thematic", "temporal", "goal-related", or "weak")
            - reasoning: string (explanation of the connection)
            
            Consider:
            1. Thematic similarity (same topic, goal, or context)
            2. Temporal relationship (task prepares for meeting or follows from meeting)
            3. Goal alignment (both relate to same objective)
            4. Content overlap (similar keywords, concepts, or outcomes)`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': openaiConfig.apiKey
        }
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const content = response.data.choices[0].message.content;
    const analysis = JSON.parse(content);
    
    return {
      meetingId: meeting.id,
      taskId: task.id,
      connectionStrength: analysis.connectionStrength || 0,
      connectionType: analysis.connectionType || 'weak',
      reasoning: analysis.reasoning || 'No clear connection'
    };
  } catch (error) {
    console.error('Error analyzing connection:', error);
    return {
      meetingId: meeting.id,
      taskId: task.id,
      connectionStrength: 0,
      connectionType: 'weak',
      reasoning: 'Error analyzing connection'
    };
  }
} 