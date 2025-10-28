import React from 'react';
import { Minimize2, Maximize2, ChevronDown, ChevronUp, BookOpen, Brain, Zap, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useChat } from '../../hooks/useChat';
import { HELPER_PROMPTS } from '../../utils/helpers/constants';

const QuickHelpers = () => {
  const { state, dispatch } = useApp();
  const { darkMode } = useTheme();
  const { showHelpers, helpersMinimized, setActiveHelper, setShowHelpers, setHelpersMinimized, addMessage } = useChat();

  const themeClasses = {
    card: darkMode 
      ? 'bg-gray-800/90 text-white border-gray-700' 
      : 'bg-white/90 text-gray-800 border-white/20',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textMuted: darkMode ? 'text-gray-300' : 'text-gray-600'
  };

  const toggleShowHelpers = () => {
    setShowHelpers(!showHelpers);
  };

  const toggleHelpersMinimized = () => {
    setHelpersMinimized(!helpersMinimized);
  };

  const handleHelperClick = async (helperType, prompt) => {
    console.log('Helper clicked:', helperType, prompt);
    
    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMessage);
    setActiveHelper(null);
    setShowHelpers(false);

    // Set typing state
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      // Get API key and selected AI
      const { selectedAI, apiKeys, selectedModels } = state;
      const apiKey = apiKeys[selectedAI];

      if (!apiKey || apiKey.trim() === '') {
        throw new Error(`${selectedAI} API key not configured. Please add your API key in AI Settings.`);
      }

      // Get the context from recent messages
      const context = state.messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Import the API service
      const { sendMessage } = await import('../../services/apiService');
      
      // Send the message to AI
      const response = await sendMessage(prompt, apiKey, selectedAI, context, selectedModels);
      
      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      addMessage(aiMessage);
    } catch (error) {
      console.error('Quick helper error:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: `❌ **Error**\n\n${error.message}\n\nPlease check your AI Settings and try again.`,
        timestamp: new Date().toISOString()
      };
      addMessage(errorMessage);
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  const helperConfigs = {
    study: { 
      icon: BookOpen, 
      color: 'blue', 
      borderColor: 'blue-500',
      title: 'Study Helper',
      description: 'Get help with studying, time management, and academic success'
    },
    mindfulness: { 
      icon: Brain, 
      color: 'green', 
      borderColor: 'green-500',
      title: 'Mindfulness Helper',
      description: 'Practice mindfulness, meditation, and stress relief techniques'
    },
    wellness: { 
      icon: Zap, 
      color: 'pink', 
      borderColor: 'pink-500',
      title: 'Wellness Helper', 
      description: 'Get support for stress, anxiety, sleep, and daily wellness'
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleShowHelpers}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
            showHelpers ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
          }`}
        >
          {showHelpers ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="text-sm font-medium">Quick Helpers</span>
        </button>
        
        {showHelpers && (
          <button
            onClick={toggleHelpersMinimized}
            className="p-2 hover:bg-pink-500/10 rounded-lg transition hover:scale-110 duration-200"
            title={helpersMinimized ? 'Expand Helpers' : 'Minimize Helpers'}
          >
            {helpersMinimized ? <ChevronDown className="w-5 h-5 text-pink-500" /> : <ChevronUp className="w-5 h-5 text-pink-500" />}
          </button>
        )}
      </div>

      {showHelpers && (
        <div className={`transition-all duration-500 ease-in-out ${
          helpersMinimized ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
        } overflow-hidden`}>
          <h2 className={`text-xl font-bold mb-6 ${themeClasses.text} flex items-center gap-2 animate-fade-in`}>
            <Sparkles className="w-6 h-6 text-pink-500 animate-spin-slow" />
            Quick Helpers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(helperConfigs).map(([helperType, config]) => {
              const Icon = config.icon;
              const prompts = HELPER_PROMPTS[helperType] || [];
              
              return (
                <div
                  key={helperType}
                  className={`${themeClasses.card} p-6 rounded-2xl shadow-lg border border-${config.borderColor}/20 hover:border-${config.borderColor}/40 transition-all duration-300 hover:scale-105 group`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 bg-${config.color}-500/20 rounded-xl group-hover:bg-${config.color}-500/30 transition-colors animate-pulse group-hover:animate-bounce`}>
                      <Icon className={`w-6 h-6 text-${config.color}-500`} />
                    </div>
                    <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
                      {config.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${themeClasses.textMuted} mb-4`}>
                    {config.description}
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
                    {prompts.slice(0, 4).map((prompt, index) => (
                      <button
                        key={`${helperType}-${index}`}
                        onClick={() => handleHelperClick(helperType, prompt)}
                        className={`w-full text-left text-sm bg-${config.color}-500/10 text-${config.color}-700 dark:text-${config.color}-300 px-3 py-2 rounded-lg hover:bg-${config.color}-500/20 transition-all duration-200 hover:scale-105 cursor-pointer border border-${config.color}-500/20 hover:border-${config.color}-500/40`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickHelpers;