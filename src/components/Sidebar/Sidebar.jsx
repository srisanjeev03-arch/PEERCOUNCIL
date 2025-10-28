import React, { useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Settings, 
  Image,
  ChevronLeft,
  ChevronRight,
  User,
  Bot
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { darkMode } = useTheme();

  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: 'AI Chat', color: 'text-blue-500' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'text-green-500' },
    { id: 'journal', icon: BookOpen, label: 'Journal', color: 'text-purple-500' },
    { id: 'background', icon: Image, label: 'Background', color: 'text-pink-500' },
    { id: 'ai-settings', icon: Bot, label: 'AI Settings', color: 'text-orange-500' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'text-gray-500 dark:text-gray-400' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm h-full flex flex-col border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Peer Council
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 text-gray-600 dark:text-gray-300"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center p-3 rounded-lg mb-1 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : `text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105`
              }`}
            >
              <Icon 
                className={`${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                  isActive ? 'text-white' : item.color
                }`} 
                size={20} 
              />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                Welcome Back
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Ready to continue your journey
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;