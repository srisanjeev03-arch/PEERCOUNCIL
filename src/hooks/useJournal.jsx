import { useApp } from '../contexts/AppContext';

export const useJournal = () => {
  const { state, dispatch } = useApp();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const addEntry = (entry) => {
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: newEntry });
    if (backendUrl) {
      fetch(`${backendUrl}/api/journals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {});
    }
  };

  const updateEntry = (entryId, updates) => {
    const updatedEntry = {
      ...state.journalEntries.find(entry => entry.id === entryId),
      ...updates,
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_JOURNAL_ENTRY', payload: updatedEntry });
    if (backendUrl) {
      fetch(`${backendUrl}/api/journals/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(() => {});
    }
  };

  const deleteEntry = (entryId) => {
    dispatch({ type: 'DELETE_JOURNAL_ENTRY', payload: entryId });
    if (backendUrl) {
      fetch(`${backendUrl}/api/journals/${entryId}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  return {
    entries: state.journalEntries,
    addEntry,
    updateEntry,
    deleteEntry
  };
};