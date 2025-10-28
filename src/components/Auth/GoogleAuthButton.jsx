import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const GoogleAuthButton = ({ onGoogleAuth, loading = false, type = "signin" }) => {
  return (
    <button
      onClick={onGoogleAuth}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 smooth-scroll"
    >
      <FcGoogle className="w-6 h-6" />
      {loading ? 'Signing in...' : `Continue with Google`}
    </button>
  );
};

export default GoogleAuthButton;