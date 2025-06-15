export const openaiConfig = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://calendar-ai.openai.azure.com/',
  apiKey: process.env.AZURE_OPENAI_API_KEY || 'E5iUsb1W3fHZgYHoxYagSAPHqEe9l9hInO1wJYnD2Th4JOhCPaCiJQQJ99BFACL93NaXJ3w3AAAAACOGKXdj',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo'
}; 