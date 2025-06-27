import Constants from 'expo-constants';

export const openaiConfig = {
  endpoint: Constants.expoConfig?.extra?.azureOpenaiEndpoint || process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: Constants.expoConfig?.extra?.azureOpenaiApiKey || process.env.AZURE_OPENAI_API_KEY,
  deployment: Constants.expoConfig?.extra?.azureOpenaiDeployment || process.env.AZURE_OPENAI_DEPLOYMENT
};

// Debug logging (remove in production)
console.log('OpenAI Config:', {
  endpoint: openaiConfig.endpoint ? 'Set' : 'Not set',
  apiKey: openaiConfig.apiKey ? 'Set' : 'Not set', 
  deployment: openaiConfig.deployment ? 'Set' : 'Not set',
  source: Constants.expoConfig?.extra ? 'Constants' : 'process.env'
}); 