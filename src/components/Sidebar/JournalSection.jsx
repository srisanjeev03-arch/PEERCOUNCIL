import React, { useState } from 'react';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const JournalSection = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [mood, setMood] = useState('neutral');
  const { darkMode } = useTheme();

  const themeClasses = {
    card: darkMode 
      ? 'bg-gray-800/90 border-gray-700 text-white' 
      : 'bg-white/90 border-gray-200 text-gray-800',
    input: darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textMuted: darkMode ? 'text-gray-300' : 'text-gray-600'
  };

  const moods = [
    { value: 'happy', label: '😊 Happy', color: 'text-yellow-500' },
    { value: 'neutral', label: '😐 Neutral', color: 'text-gray-500' },
    { value: 'sad', label: '😔 Sad', color: 'text-blue-500' },
    { value: 'anxious', label: '😰 Anxious', color: 'text-orange-500' },
    { value: 'excited', label: '🎉 Excited', color: 'text-green-500' }
  ];

  const addEntry = () => {
    if (newEntry.trim()) {
      const entry = {
        id: Date.now().toString(),
        content: newEntry,
        mood,
        date: new Date().toISOString(),
        timestamp: new Date().toLocaleTimeString()
      };
      setEntries([entry, ...entries]);
      setNewEntry('');
      const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      localStorage.setItem('journalEntries', JSON.stringify([entry, ...savedEntries]));
    }
  };

  const deleteEntry = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
  };

  React.useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    setEntries(savedEntries);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <BookOpen className="text-purple-500" />
            Mental Health Journal
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Record your thoughts, feelings, and progress
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {entries.length} entries
          </p>
        </div>
      </div>

      {/* New Entry Form */}
      <div className={`${themeClasses.card} border rounded-2xl p-6 mb-8 backdrop-blur-sm shadow-lg`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus size={24} />
          New Journal Entry
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">How are you feeling?</label>
          <div className="flex gap-2 flex-wrap">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  mood === m.value
                    ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 hover:shadow-md text-gray-700 dark:text-gray-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Write about your day, your feelings, or anything on your mind..."
          className={`w-full h-40 p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-lg ${themeClasses.input}`}
        />

        <button
          onClick={addEntry}
          disabled={!newEntry.trim()}
          className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Save Entry
        </button>
      </div>

      {/* Journal Entries */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Recent Entries</h3>
        
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No journal entries yet. Start writing to track your mental wellness journey.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`${themeClasses.card} border rounded-2xl p-6 backdrop-blur-sm shadow-lg`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {moods.find(m => m.value === entry.mood)?.label.split(' ')[0]}
                  </span>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {entry.timestamp}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JournalSection;