import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../Sidebar/Sidebar';
import ChatInterface from '../Chat/ChatInterface';
import CalendarView from '../Calendar/CalendarView';
import JournalSection from '../Sidebar/JournalSection';
import BackgroundSettings from '../Sidebar/BackgroundSettings';
import AISettings from '../Sidebar/AISettings';
import UserSettings from '../Settings/UserSettings';
import ApiSettings from '../Settings/ApiSettings';

const MainLayout = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');

  // Load active tab from localStorage on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const renderMainContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface />;
      case 'calendar':
        return <CalendarView />;
      case 'journal':
        return <JournalSection />;
      case 'background':
        return <BackgroundSettings />;
      case 'ai-settings':
        return <AISettings />;
      case 'settings':
        return (
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserSettings />
              <ApiSettings />
            </div>
          </div>
        );
      default:
        return <ChatInterface />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'chat': return 'AI Chat';
      case 'calendar': return 'Wellness Calendar';
      case 'journal': return 'Mental Health Journal';
      case 'background': return 'Background Settings';
      case 'ai-settings': return 'AI Settings';
      case 'settings': return 'Settings';
      default: return 'Peer Council';
    }
  };

  return (
    <div className="app-container flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-layout flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Header */}
        <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {getPageTitle()}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Active Tab Indicator */}
                <div className="hidden sm:block">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    {activeTab.toUpperCase()}
                  </span>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? '🌙' : '☀️'}
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-transparent">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;