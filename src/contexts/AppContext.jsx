import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  messages: [],
  isTyping: false,
  selectedAI: 'chatgpt',
  selectedModels: {
    chatgpt: 'gpt-3.5-turbo',
    gemini: 'gemini-2.0-flash',
    groq: 'llama-3.1-8b-instant'
  },
  apiKeys: {},
  events: [],
  currentAuthPage: 'login',
  userPreferences: {
    fontSize: 'md',
    fontFamily: 'Inter, ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji',
    surfaceOpacity: 0.9,
    counselingStyle: 'supportive',
    reducedMotion: false
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_SELECTED_AI':
      return { ...state, selectedAI: action.payload };
    case 'SET_SELECTED_MODELS':
      return { ...state, selectedModels: action.payload };
    case 'SET_API_KEYS':
      return { ...state, apiKeys: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'SET_AUTH_PAGE':
      return { ...state, currentAuthPage: action.payload };
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_SAVED_STATE', payload: parsedState });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      selectedAI: state.selectedAI,
      selectedModels: state.selectedModels,
      apiKeys: state.apiKeys,
      messages: state.messages,
      events: state.events,
      userPreferences: state.userPreferences
    };
    localStorage.setItem('appState', JSON.stringify(stateToSave));
  }, [state.selectedAI, state.selectedModels, state.apiKeys, state.messages, state.events, state.userPreferences]);

  // Apply userPreferences to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const { fontSize, fontFamily, surfaceOpacity, reducedMotion } = state.userPreferences;

    // Font family
    root.style.setProperty('--app-font-family', fontFamily);

    // Font size scale
    const sizeMap = { sm: '14px', md: '16px', lg: '18px', xl: '20px' };
    const baseSize = sizeMap[fontSize] || '16px';
    root.style.setProperty('--app-font-size', baseSize);

    // Surface opacity for cards/toolbars using backdrop
    root.style.setProperty('--surface-opacity', String(surfaceOpacity));

    // Reduced motion
    if (reducedMotion) {
      root.style.setProperty('--motion-duration', '0ms');
    } else {
      root.style.setProperty('--motion-duration', '300ms');
    }
  }, [state.userPreferences]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};