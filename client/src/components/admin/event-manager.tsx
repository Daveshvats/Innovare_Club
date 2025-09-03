import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  tags?: string[];
  imageUrl?: string;
  featured: boolean;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface EventManagerProps {
  isAdmin?: boolean;
}

export const EventManager: React.FC<EventManagerProps> = ({ isAdmin = false }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const eventsData: Event[] = await response.json();
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Toggle featured status
  const toggleFeatured = async (eventId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, featured: !currentFeatured }
            : { ...event, featured: false } // Ensure only one event is featured
        )
      );
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-xl font-tech font-bold mb-4">Loading Events...</div>
          <div className="animate-pulse text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-tech font-bold text-gray-900 dark:text-white mb-2">
          Event Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage events and set featured events
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-tech font-bold text-gray-900 dark:text-white">
                    {event.title}
                  </h3>
                  {event.featured && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>📅 {formatDate(event.date)}</span>
                  <span>📍 {event.location}</span>
                  <span>👥 {event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</span>
                </div>
              </div>
                             <div className="flex gap-2">
                 <button
                   onClick={() => toggleFeatured(event.id, event.featured)}
                   className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                     event.featured
                       ? 'bg-blue-600 text-white hover:bg-blue-700'
                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                   }`}
                 >
                   {event.featured ? 'Unfeature' : 'Feature'}
                 </button>
               </div>
            </div>

            {event.imageUrl && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Event Image:</p>
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>


    </div>
  );
};
