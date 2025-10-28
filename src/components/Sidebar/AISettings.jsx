import React, { useState, useEffect } from 'react';
import { Key, Bot, Cpu, Shield, Save, Eye, EyeOff, ExternalLink, Trash2, TestTube, CheckCircle, XCircle, CpuIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useApp } from '../../contexts/AppContext';
import  useApi  from '../../hooks/useApi';

const AISettings = () => {
  const { state, dispatch } = useApp();
  const { darkMode } = useTheme();
  const { testApiKey, testing, error, clearError } = useApi();
  
  const [apiKeys, setApiKeys] = useState(state.apiKeys || {});
  const [selectedAI, setSelectedAI] = useState(state.selectedAI || 'chatgpt');
  const [saved, setSaved] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [testResults, setTestResults] = useState({});
  const [selectedModels, setSelectedModels] = useState(state.selectedModels || {});

  const themeClasses = {
    card: darkMode 
      ? 'bg-gray-800/90 border-gray-700' 
      : 'bg-white/90 border-gray-200',
    input: darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textMuted: darkMode ? 'text-gray-300' : 'text-gray-600'
  };

  const aiProviders = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      description: 'OpenAI GPT models',
      icon: Bot,
      color: 'text-green-500',
      keyFormat: 'Starts with "sk-"',
      docsUrl: 'https://platform.openai.com/api-keys',
      models: [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' },
        { id: 'gpt-4', name: 'GPT-4', description: 'More capable and creative' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest GPT-4 version' }
      ]
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'Google AI models',
      icon: Cpu,
      color: 'text-blue-500',
      keyFormat: 'AIzaSy... format',
      docsUrl: 'https://aistudio.google.com/app/apikey',
      models: [
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast and versatile' },
        { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', description: 'More capable model' }
      ]
    },
    {
      id: 'groq',
      name: 'Groq',
      description: 'High-speed inference',
      icon: CpuIcon,
      color: 'text-purple-500',
      keyFormat: 'Starts with "gsk_"',
      docsUrl: 'https://console.groq.com/keys',
      models: [
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Fast and efficient' },
        { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', description: 'More capable' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'High quality responses' }
      ]
    }
  ];

  // Validate API key format
  const validateApiKey = (provider, key) => {
    if (!key || key.trim() === '') {
      return { isValid: false, message: 'API key is required' };
    }

    switch (provider) {
      case 'chatgpt':
        if (!key.startsWith('sk-')) {
          return { isValid: false, message: 'OpenAI keys start with "sk-"' };
        }
        if (key.length < 20) {
          return { isValid: false, message: 'OpenAI keys are typically 51 characters' };
        }
        break;
      case 'groq':
        if (!key.startsWith('gsk_')) {
          return { isValid: false, message: 'Groq keys start with "gsk_"' };
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

    return { isValid: true, message: 'Valid format' };
  };

  const handleSave = () => {
    const errors = {};
    let hasErrors = false;

    // Validate all configured keys
    Object.keys(apiKeys).forEach(provider => {
      if (apiKeys[provider].trim() !== '') {
        const validation = validateApiKey(provider, apiKeys[provider]);
        if (!validation.isValid) {
          errors[provider] = validation.message;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    // Clear errors if validation passes
    setValidationErrors({});

    // Save to global state
    dispatch({ type: 'SET_API_KEYS', payload: apiKeys });
    dispatch({ type: 'SET_SELECTED_AI', payload: selectedAI });
    dispatch({ type: 'SET_SELECTED_MODELS', payload: selectedModels });
    
    // Save to localStorage
    localStorage.setItem('aiSettings', JSON.stringify({
      apiKeys,
      selectedAI,
      selectedModels,
      timestamp: new Date().toISOString()
    }));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));

    // Clear validation error and test result for this provider when user types
    if (validationErrors[provider]) {
      setValidationErrors(prev => ({
        ...prev,
        [provider]: null
      }));
    }
    if (testResults[provider]) {
      setTestResults(prev => ({
        ...prev,
        [provider]: null
      }));
    }
  };

  const handleModelChange = (provider, modelId) => {
    setSelectedModels(prev => ({
      ...prev,
      [provider]: modelId
    }));
  };

  const toggleApiKeyVisibility = (provider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const clearApiKey = (provider) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: ''
    }));
    setValidationErrors(prev => ({
      ...prev,
      [provider]: null
    }));
    setTestResults(prev => ({
      ...prev,
      [provider]: null
    }));
  };

  const testApiKeyHandler = async (provider) => {
    const apiKey = apiKeys[provider];
    if (!apiKey || apiKey.trim() === '') {
      setValidationErrors(prev => ({
        ...prev,
        [provider]: 'API key is required for testing'
      }));
      return;
    }

    const validation = validateApiKey(provider, apiKey);
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [provider]: validation.message
      }));
      return;
    }

    // Clear previous errors
    setValidationErrors(prev => ({
      ...prev,
      [provider]: null
    }));

    const result = await testApiKey(apiKey, provider);
    setTestResults(prev => ({
      ...prev,
      [provider]: result
    }));
  };

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      try {
        const { apiKeys: savedApiKeys, selectedAI: savedSelectedAI, selectedModels: savedSelectedModels } = JSON.parse(savedSettings);
        console.log('Loading saved API keys:', savedApiKeys);
        setApiKeys(savedApiKeys || {});
        setSelectedAI(savedSelectedAI || 'chatgpt');
        setSelectedModels(savedSelectedModels || {});
      } catch (error) {
        console.error('Error loading AI settings:', error);
      }
    }
  }, []);

  // Save to global state whenever apiKeys change
  useEffect(() => {
    dispatch({ type: 'SET_API_KEYS', payload: apiKeys });
    dispatch({ type: 'SET_SELECTED_MODELS', payload: selectedModels });
  }, [apiKeys, selectedModels, dispatch]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <Bot className="text-orange-500" />
            AI Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Configure your AI providers and API keys
          </p>
        </div>
        
        <button
          onClick={handleSave}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium"
        >
          <Save size={20} />
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
          <p className="text-green-600 dark:text-green-400 text-lg font-medium">
            ✅ Settings saved successfully!
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </p>
        </div>
      )}

      {/* AI Provider Selection */}
      <div className={`${themeClasses.card} border rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-lg`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
          <Cpu className="text-blue-500" />
          Select AI Provider
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiProviders.map((provider) => {
            const Icon = provider.icon;
            const apiKey = apiKeys[provider.id] || '';
            const isConfigured = apiKey.trim() !== '';
            const validation = isConfigured ? validateApiKey(provider.id, apiKey) : { isValid: false, message: 'Not configured' };
            const testResult = testResults[provider.id];
            
            return (
              <div
                key={provider.id}
                onClick={() => setSelectedAI(provider.id)}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                  selectedAI === provider.id
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 hover:shadow-md'
                } ${
                  isConfigured && !validation.isValid ? 'border-red-300 bg-red-500/5' : ''
                } ${
                  testResult?.success ? 'border-green-500 bg-green-500/5' : ''
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <Icon className={provider.color} size={28} />
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{provider.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {provider.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {testResult ? (
                        <span className={`flex items-center gap-1 ${
                          testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {testResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {testResult.success ? 'Test Passed' : 'Test Failed'}
                        </span>
                      ) : isConfigured ? (
                        <span className={`flex items-center gap-1 ${
                          validation.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            validation.isValid ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          {validation.message}
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">Not configured</span>
                      )}
                    </span>
                    
                    {selectedAI === provider.id && (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Selected
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Format: {provider.keyFormat}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Selection */}
      {selectedAI && (
        <div className={`${themeClasses.card} border rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-lg`}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
            <CpuIcon className="text-purple-500" />
            Model Selection
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiProviders.find(p => p.id === selectedAI)?.models.map((model) => (
              <div
                key={model.id}
                onClick={() => handleModelChange(selectedAI, model.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedModels[selectedAI] === model.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">{model.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {model.description}
                </p>
                {selectedModels[selectedAI] === model.id && (
                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs mt-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Key Configuration */}
      <div className={`${themeClasses.card} border rounded-2xl p-6 backdrop-blur-sm shadow-lg`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
          <Key className="text-yellow-500" />
          API Keys Configuration
        </h3>
        
        <div className="space-y-6">
          {aiProviders.map((provider) => {
            const apiKey = apiKeys[provider.id] || '';
            const isVisible = showApiKeys[provider.id];
            const validation = apiKey ? validateApiKey(provider.id, apiKey) : { isValid: false, message: '' };
            const testResult = testResults[provider.id];
            const isTesting = testing && Object.keys(testResults).includes(provider.id);
            
            return (
              <div key={provider.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-medium text-gray-900 dark:text-white">
                    {provider.name} API Key
                  </label>
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Get API Key
                    <ExternalLink size={14} />
                  </a>
                </div>
                
                <div className="relative">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                    placeholder={`Enter your ${provider.name} API key...`}
                    className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 pr-32 text-lg transition-colors ${
                      themeClasses.input
                    } ${
                      validationErrors[provider.id] || (apiKey && !validation.isValid)
                        ? 'border-red-500 focus:ring-red-400'
                        : apiKey && validation.isValid
                        ? 'border-green-500 focus:ring-green-400'
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      testResult?.success ? 'border-green-500 focus:ring-green-400' : ''
                    }`}
                  />
                  
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {/* Clear Button */}
                    {apiKey && (
                      <button
                        type="button"
                        onClick={() => clearApiKey(provider.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear API key"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    
                    {/* Test Button */}
                    {apiKey && (
                      <button
                        type="button"
                        onClick={() => testApiKeyHandler(provider.id)}
                        disabled={isTesting}
                        className={`p-1 transition-colors ${
                          isTesting 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-blue-500'
                        }`}
                        title="Test API key"
                      >
                        {isTesting ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <TestTube size={16} />
                        )}
                      </button>
                    )}
                    
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility(provider.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title={isVisible ? 'Hide API key' : 'Show API key'}
                    >
                      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    <Key className="text-gray-400" size={16} />
                  </div>
                </div>
                
                {/* Validation and Test Messages */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {validationErrors[provider.id] ? (
                      <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                        ❌ {validationErrors[provider.id]}
                      </p>
                    ) : apiKey && !validation.isValid ? (
                      <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                        ❌ Invalid API key format
                      </p>
                    ) : testResult ? (
                      <p className={`text-sm flex items-center gap-1 ${
                        testResult.success 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {testResult.success ? '✅' : '❌'} {testResult.message}
                      </p>
                    ) : apiKey && validation.isValid ? (
                      <p className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                        ✅ Valid API key format
                      </p>
                    ) : null}
                  </div>
                  
                  {/* Character Count */}
                  {apiKey && (
                    <span className={`text-xs ${
                      apiKey.length > 50 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {apiKey.length} chars
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-400 mb-1">Security Note</h4>
              <p className="text-sm text-blue-400/80">
                Your API keys are stored locally in your browser and never sent to our servers. 
                They are only used to communicate directly with the AI providers you configure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;