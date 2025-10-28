// API Key validation utility
export const validateApiKey = (provider, key) => {
  if (!key || key.trim() === '') {
    return { isValid: false, message: 'API key is required' };
  }

  switch (provider) {
    case 'chatgpt':
      if (!key.startsWith('sk-')) {
        return { isValid: false, message: 'OpenAI keys must start with "sk-"' };
      }
      if (key.length < 20) {
        return { isValid: false, message: 'OpenAI keys are typically 51 characters' };
      }
      break;
    case 'groq':
      if (!key.startsWith('gsk_')) {
        return { isValid: false, message: 'Groq keys must start with "gsk_"' };
      }
      if (key.length < 20) {
        return { isValid: false, message: 'Groq keys are typically longer' };
      }
      break;
    case 'gemini':
      if (!key.startsWith('AIza') && key.length < 20) {
        return { isValid: false, message: 'Gemini keys should be longer' };
      }
      break;
  }

  return { isValid: true, message: 'Valid API key format' };
};