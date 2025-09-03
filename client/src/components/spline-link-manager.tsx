import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplineLinkManagerProps {
  eventId: string;
  currentSplineUrl?: string;
  onSplineUrlChange: (url: string) => void;
  isAdmin?: boolean;
}

export const SplineLinkManager: React.FC<SplineLinkManagerProps> = ({
  eventId,
  currentSplineUrl,
  onSplineUrlChange,
  isAdmin = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSplineUrl, setNewSplineUrl] = useState(currentSplineUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!newSplineUrl.trim()) {
      setError('Please enter a valid Spline URL');
      return;
    }

    // Validate Spline URL format
    if (!newSplineUrl.includes('spline.design') && !newSplineUrl.includes('.splinecode')) {
      setError('Please enter a valid Spline URL (should contain spline.design or .splinecode)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/spline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ splineUrl: newSplineUrl.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update Spline URL');
      }

      onSplineUrlChange(newSplineUrl.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating Spline URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to update Spline URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewSplineUrl(currentSplineUrl || '');
    setIsEditing(false);
    setError(null);
  };

  if (!isAdmin) {
    return null; // Only show for admins
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-tech font-semibold text-gray-900 dark:text-white">
          Spline 3D Scene
        </h4>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-sm bg-tech-blue text-white rounded-lg hover:bg-tech-green transition-colors"
        >
          {currentSplineUrl ? 'Edit' : 'Add'} Spline
        </button>
      </div>

      <AnimatePresence>
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Spline URL
              </label>
              <input
                type="url"
                value={newSplineUrl}
                onChange={(e) => setNewSplineUrl(e.target.value)}
                placeholder="https://prod.spline.design/your-scene.splinecode"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/20"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the URL of your Spline 3D scene
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-tech-blue text-white rounded-lg hover:bg-tech-green transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {currentSplineUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Spline URL:
                </p>
                <div className="p-2 bg-white dark:bg-gray-700 rounded border text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                  {currentSplineUrl}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  ✓ Spline 3D scene is configured
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No Spline 3D scene configured. Click "Add Spline" to add one.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
