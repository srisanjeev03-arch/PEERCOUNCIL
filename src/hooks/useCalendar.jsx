import { useState, useEffect } from 'react';

export const useCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      fetch(`${backendUrl}/api/events`).then(r => r.json()).then(setEvents).catch(() => {});
    } else {
      const savedEvents = localStorage.getItem('calendarEvents');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    }
  }, []);

  const saveEvents = (newEvents) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
    }
    setEvents(newEvents);
  };

  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString()
    };
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      fetch(`${backendUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }).then(r => r.json()).then(serverEvent => setEvents(prev => [...prev, serverEvent])).catch(() => {});
    } else {
      const newEvents = [...events, newEvent];
      saveEvents(newEvents);
    }
  };

  const updateEvent = (eventId, eventData) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      fetch(`${backendUrl}/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }).then(r => r.json()).then(updated => setEvents(prev => prev.map(e => e.id === eventId ? updated : e))).catch(() => {});
    } else {
      const newEvents = events.map(event => 
        event.id === eventId ? { ...event, ...eventData } : event
      );
      saveEvents(newEvents);
    }
  };

  const deleteEvent = (eventId) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      fetch(`${backendUrl}/api/events/${eventId}`, { method: 'DELETE' }).then(() => setEvents(prev => prev.filter(e => e.id !== eventId))).catch(() => {});
    } else {
      const newEvents = events.filter(event => event.id !== eventId);
      saveEvents(newEvents);
    }
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent
  };
};