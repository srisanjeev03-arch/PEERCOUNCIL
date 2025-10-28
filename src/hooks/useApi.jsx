import { useState } from 'react';

// Export this validation function
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

// Groq API Integration
const callGroqAPI = async (message, apiKey, context = [], model = 'llama-3.1-8b-instant') => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          ...context,
          { role: 'user', content: message }
        ],
        model: model,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI';
  } catch (err) {
    throw new Error(`Groq API Error: ${err.message}`);
  }
};

// Gemini API Integration
const callGeminiAPI = async (message, apiKey, context = [], model = 'gemini-2.0-flash', imageData) => {
  try {
    const parts = [
      {
        text: `You are a helpful mental wellness assistant. Provide supportive, empathetic responses while maintaining professional boundaries. Context from previous messages: ${context.map(msg => `${msg.role}: ${msg.content}`).join(' | ')}. Current message: ${message}`
      }
    ];

    if (imageData?.dataUrl && imageData?.mimeType) {
      const base64 = imageData.dataUrl.split(',')[1];
      parts.push({
        inline_data: {
          mime_type: imageData.mimeType,
          data: base64
        }
      });
    }

    const contents = [{ parts }];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response from AI';
  } catch (err) {
    throw new Error(`Gemini API Error: ${err.message}`);
  }
};

// ChatGPT/OpenAI API Integration
const callChatGPTAPI = async (message, apiKey, context = [], model = 'gpt-3.5-turbo', imageData) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful mental wellness assistant. Provide supportive, empathetic responses while maintaining professional boundaries. Focus on active listening, validation, and practical suggestions.'
          },
          ...context,
          {
            role: 'user',
            content: imageData?.dataUrl
              ? [
                  { type: 'text', text: message },
                  { type: 'image_url', image_url: imageData.dataUrl }
                ]
              : message
          }
        ],
        model: imageData?.dataUrl ? (model || 'gpt-4o-mini') : model,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI';
  } catch (err) {
    throw new Error(`OpenAI API Error: ${err.message}`);
  }
};

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const sendMessage = async (message, apiKey, aiProvider, context = [], selectedModels = {}, imageData) => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      let response;
      if (backendUrl) {
        const r = await fetch(`${backendUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: aiProvider,
            message,
            context,
            model: selectedModels?.[aiProvider],
            image: imageData
          })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Backend error');
        response = data.message;
        return response;
      }

      // Validate API key (direct mode only)
      if (!apiKey || apiKey.trim() === '') {
        throw new Error(`${aiProvider} API key is required. Please configure it in AI Settings or set VITE_BACKEND_URL to use the backend.`);
      }
      const validation = validateApiKey(aiProvider, apiKey);
      if (!validation.isValid) {
        throw new Error(`Invalid ${aiProvider} API key: ${validation.message}`);
      }

      // Direct provider calls
      
      
      // Call the appropriate API based on provider
      switch (aiProvider) {
        case 'chatgpt':
          response = await callChatGPTAPI(message, apiKey, context, selectedModels?.chatgpt, imageData);
          break;
        case 'gemini':
          response = await callGeminiAPI(message, apiKey, context, selectedModels?.gemini, imageData);
          break;
        case 'groq':
          response = await callGroqAPI(message, apiKey, context, selectedModels?.groq);
          break;
        default:
          throw new Error(`Unsupported AI provider: ${aiProvider}`);
      }

      if (!response || response.trim() === '') {
        throw new Error('Empty response from AI service');
      }

      return response;

    } catch (err) {
      const errorMessage = err.message || `Failed to connect to ${aiProvider}. Please check your API key and internet connection.`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Test API key function
  const testApiKey = async (apiKey, aiProvider) => {
    setTesting(true);
    setError(null);

    try {
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('API key is required');
      }

      const validation = validateApiKey(aiProvider, apiKey);
      if (!validation.isValid) {
        throw new Error(`Invalid API key format: ${validation.message}`);
      }

      // Test message for API validation
      const testMessage = "Hello! Please respond with just 'OK' to confirm the API is working.";
      
      let response;
      switch (aiProvider) {
        case 'chatgpt':
          response = await callChatGPTAPI(testMessage, apiKey, []);
          break;
        case 'gemini':
          response = await callGeminiAPI(testMessage, apiKey, []);
          break;
        case 'groq':
          response = await callGroqAPI(testMessage, apiKey, []);
          break;
        default:
          throw new Error(`Unsupported AI provider: ${aiProvider}`);
      }

      if (response && response.includes('OK')) {
        return {
          success: true,
          message: `✅ ${aiProvider} API key is valid and working!`
        };
      } else {
        return {
          success: true,
          message: `✅ ${aiProvider} API key is valid! Response received.`
        };
      }

    } catch (err) {
      const errorMessage = err.message || `Failed to test ${aiProvider} API key`;
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setTesting(false);
    }
  };

  return {
    sendMessage,
    testApiKey,
    loading,
    testing,
    error,
    clearError
  };
};

export default useApi;