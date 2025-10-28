import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';

export const useChat = () => {
  const { state, dispatch } = useApp();
  const [showHelpers, setShowHelpers] = useState(true);
  const [helpersMinimized, setHelpersMinimized] = useState(false);
  const [activeHelper, setActiveHelper] = useState(null);

  const addMessage = (message) => {
    const messageWithId = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
      timestamp: message.timestamp || new Date().toISOString()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: messageWithId });
  };

  // Conversations (basic): create a new conversation on first message if none exists
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) return;
    // Could load conversations here in future
  }, []);

  return {
    showHelpers,
    setShowHelpers,
    helpersMinimized,
    setHelpersMinimized,
    activeHelper,
    setActiveHelper,
    addMessage,
    messages: state.messages
  };
};