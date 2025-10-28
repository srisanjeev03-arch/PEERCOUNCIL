import React, { useState, useRef } from 'react';
import { Send, AlertCircle, Key, Image, X, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../hooks/useTheme';
import useApi from '../../hooks/useApi';
import { useChat } from '../../hooks/useChat';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();
  
  const { state, dispatch } = useApp();
  const { darkMode } = useTheme();
  const { sendMessage, loading, error, clearError } = useApi();
  const { addMessage, setActiveHelper } = useChat();

  const { selectedAI, apiKeys, messages } = state;

  const themeClasses = {
    input: darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500',
    text: darkMode ? 'text-white' : 'text-gray-800',
    error: darkMode 
      ? 'bg-red-500/20 border-red-500/30 text-red-400' 
      : 'bg-red-500/10 border-red-500/20 text-red-600'
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (customMessage = null) => {
    const messageToSend = customMessage || input.trim();
    if ((!messageToSend && !uploadedImage) || loading) return;

    // Clear any previous errors
    clearError();

    const userMessage = {
      role: 'user',
      content: messageToSend,
      image: uploadedImage ? {
        name: uploadedImage.name,
        type: uploadedImage.type,
        size: uploadedImage.size,
        preview: imagePreview
      } : null,
      timestamp: new Date().toISOString()
    };

    addMessage(userMessage);
    setInput('');
    setUploadedImage(null);
    setImagePreview(null);
    setActiveHelper(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      const apiKey = apiKeys[selectedAI];
      
      if (!apiKey || apiKey.trim() === '') {
        throw new Error(`${selectedAI} API key not configured. Please add your API key in AI Settings.`);
      }

      const context = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Enhanced message for image context
      let enhancedMessage = messageToSend;
      if (uploadedImage) {
        enhancedMessage += ` [I've uploaded an image related to this: ${uploadedImage.name}. Please provide advice considering this visual context.]`;
      }

      const imageData = uploadedImage && imagePreview ? {
        dataUrl: imagePreview,
        mimeType: uploadedImage.type,
        name: uploadedImage.name,
        size: uploadedImage.size
      } : undefined;

      const response = await sendMessage(enhancedMessage, apiKey, selectedAI, context, state.selectedModels, imageData);
      
      const aiMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      addMessage(aiMessage);
    } catch (error) {
      console.error('Chat error:', error);
      
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isApiKeyMissing = !apiKeys[selectedAI] || apiKeys[selectedAI].trim() === '';

  return (
    <div className="max-w-5xl mx-auto smooth-scroll">
      {/* Error Display */}
      {error && (
        <div className={`mb-4 p-4 border rounded-xl animate-fade-in smooth-scroll ${themeClasses.error}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* API Key Missing Warning */}
      {isApiKeyMissing && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Key className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                {selectedAI} API Key Required
              </p>
              <p className="text-xs mt-1">
                Please configure your {selectedAI} API key in the AI Settings to start chatting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl relative">
          <div className="flex items-center gap-3">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {uploadedImage?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(uploadedImage?.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeImage}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 smooth-scroll">
        {/* Image Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="px-4 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 smooth-scroll"
          title="Upload image for context"
        >
          <Image className="w-6 h-6" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Message Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            clearError();
          }}
          onKeyPress={handleKeyPress}
          placeholder={"Share what's on your mind or upload an image for better advice... (Press Enter to send)"}
          className={`flex-1 px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition text-lg shadow-sm hover:scale-105 duration-200 smooth-scroll ${themeClasses.input}`}
          disabled={loading}
        />

        {/* Send Button */}
        <button
          onClick={() => handleSend()}
          disabled={(!input.trim() && !uploadedImage) || loading || isApiKeyMissing}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg font-semibold hover:from-pink-600 hover:to-purple-700 smooth-scroll"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>

      {/* Upload Hint */}
      {!isApiKeyMissing && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          💡 Upload study materials, notes, or any image for more accurate and personalized advice
        </p>
      )}
    </div>
  );
};

export default ChatInput;