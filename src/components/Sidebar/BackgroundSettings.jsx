import React, { useState, useEffect } from 'react';
import { Image, Upload, Trash2, Palette, Download } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const BackgroundSettings = () => {
  const [currentImage, setCurrentImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { darkMode, setDarkMode } = useTheme();

  const themeClasses = {
    card: darkMode 
      ? 'bg-gray-800/90 border-gray-700' 
      : 'bg-white/90 border-gray-200',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textMuted: darkMode ? 'text-gray-300' : 'text-gray-600'
  };

  const predefinedBackgrounds = [
    {
      id: 1,
      name: 'Sunset Gradient',
      url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      name: 'Ocean Breeze',
      url: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)'
    },
    {
      id: 3,
      name: 'Pink Dreams',
      url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 4,
      name: 'Deep Space',
      url: 'linear-gradient(135deg, #0c0c0c 0%, #2d3436 100%)'
    },
    {
      id: 5,
      name: 'Forest Mist',
      url: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)'
    },
    {
      id: 6,
      name: 'Warm Sunset',
      url: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  // Function to apply background to entire app
  const applyBackgroundToApp = (backgroundType, backgroundValue) => {
    const appContainer = document.querySelector('.app-container');
    const mainLayout = document.querySelector('.main-layout');
    
    if (backgroundType === 'image' && backgroundValue) {
      // Apply image background
      if (appContainer) {
        appContainer.style.backgroundImage = `url(${backgroundValue})`;
        appContainer.style.backgroundSize = 'cover';
        appContainer.style.backgroundAttachment = 'fixed';
        appContainer.style.backgroundPosition = 'center';
      }
      if (mainLayout) {
        mainLayout.style.background = 'transparent';
      }
    } else if (backgroundType === 'gradient' && backgroundValue) {
      // Apply gradient background
      if (appContainer) {
        appContainer.style.backgroundImage = backgroundValue;
        appContainer.style.backgroundSize = 'cover';
        appContainer.style.backgroundAttachment = 'fixed';
      }
      if (mainLayout) {
        mainLayout.style.background = 'transparent';
      }
    } else {
      // Reset to default
      if (appContainer) {
        appContainer.style.backgroundImage = '';
        appContainer.style.backgroundSize = '';
        appContainer.style.backgroundAttachment = '';
      }
      if (mainLayout) {
        mainLayout.style.background = '';
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        setUploading(false);
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        setUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setCurrentImage(imageData);
        localStorage.setItem('customBackground', imageData);
        localStorage.setItem('backgroundType', 'image');
        applyBackgroundToApp('image', imageData);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCurrentImage(null);
    localStorage.removeItem('customBackground');
    localStorage.removeItem('backgroundType');
    applyBackgroundToApp('reset');
  };

  const applyPredefinedBackground = (background) => {
    setCurrentImage(null);
    localStorage.setItem('predefinedBackground', JSON.stringify(background));
    localStorage.setItem('backgroundType', 'gradient');
    localStorage.removeItem('customBackground');
    applyBackgroundToApp('gradient', background.url);
  };

  const resetBackground = () => {
    setCurrentImage(null);
    localStorage.removeItem('customBackground');
    localStorage.removeItem('predefinedBackground');
    localStorage.removeItem('backgroundType');
    applyBackgroundToApp('reset');
  };

  // Load saved background on component mount
  useEffect(() => {
    const savedCustomBg = localStorage.getItem('customBackground');
    const savedPredefinedBg = localStorage.getItem('predefinedBackground');
    const backgroundType = localStorage.getItem('backgroundType');
    
    if (backgroundType === 'image' && savedCustomBg) {
      setCurrentImage(savedCustomBg);
      applyBackgroundToApp('image', savedCustomBg);
    } else if (backgroundType === 'gradient' && savedPredefinedBg) {
      const bg = JSON.parse(savedPredefinedBg);
      applyBackgroundToApp('gradient', bg.url);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Image className="text-pink-500" />
            Background Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Customize your app appearance with backgrounds
          </p>
        </div>
        
        <button
          onClick={resetBackground}
          className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors text-lg font-medium"
        >
          Reset to Default
        </button>
      </div>

      {/* Theme Toggle */}
      <div className={`${themeClasses.card} border rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-lg`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <Palette className="text-purple-500" />
          Theme Settings
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-lg">Dark Mode</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Switch between light and dark themes
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              darkMode ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Custom Image Upload */}
      <div className={`${themeClasses.card} border rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-lg`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <Upload className="text-blue-500" />
          Upload Custom Background
        </h3>

        {currentImage ? (
          <div className="text-center">
            <div 
              className="w-full h-64 rounded-2xl mb-6 bg-cover bg-center border-2 border-dashed border-gray-300 shadow-lg"
              style={{ backgroundImage: `url(${currentImage})` }}
            />
            <button
              onClick={handleRemoveImage}
              className="flex items-center gap-3 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all mx-auto text-lg font-medium"
            >
              <Trash2 size={20} />
              Remove Image
            </button>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => document.getElementById('background-upload').click()}
          >
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-xl mb-3">Upload Background Image</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
              Click to select an image from your device
            </p>
            <div className="flex items-center gap-3 justify-center text-blue-500 text-lg font-medium">
              <Upload size={20} />
              <span>Choose Image</span>
            </div>
          </div>
        )}
        
        <input
          id="background-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <p className="text-gray-500 dark:text-gray-400 text-center mt-6 text-lg">
          Supported formats: JPG, PNG, GIF • Max size: 5MB
        </p>
      </div>

      {/* Predefined Backgrounds */}
      <div className={`${themeClasses.card} border rounded-2xl p-6 backdrop-blur-sm shadow-lg`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <Download className="text-green-500" />
          Predefined Backgrounds
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {predefinedBackgrounds.map((background) => (
            <div
              key={background.id}
              className="cursor-pointer group"
              onClick={() => applyPredefinedBackground(background)}
            >
              <div
                className="h-32 rounded-2xl mb-3 border-2 border-transparent group-hover:border-white group-hover:scale-105 transition-all shadow-lg"
                style={{ background: background.url }}
              />
              <p className="text-center font-medium text-gray-700 dark:text-gray-300 text-lg">
                {background.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettings;