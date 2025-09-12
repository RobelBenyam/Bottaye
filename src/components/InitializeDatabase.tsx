import React, { useState } from 'react';
import { Database, Loader2 } from 'lucide-react';
import { initializeLocalData } from '../services/localInitialize';

export default function InitializeDatabase() {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    try {
      // Use local storage for now (safe fallback)
      const success = await initializeLocalData();
      
      if (success) {
        setCompleted(true);
        
        // Don't reload page - just notify parent to refresh data
        setTimeout(() => {
          // Trigger a custom event to refresh the properties list
          window.dispatchEvent(new CustomEvent('dataInitialized'));
        }, 1000);
      } else {
        console.error('Failed to initialize data');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="h-8 w-8 text-success-600" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
          Database Initialized! 🎉
        </h3>
        <p className="text-secondary-600 dark:text-secondary-400 mb-4">
          Sample properties and units have been created successfully!
        </p>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Data will appear below in a moment...
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Database className="h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
        Initialize Your Database
      </h3>
      <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-md mx-auto">
        Get started by setting up sample properties and units in your Firestore database.
      </p>
      <button
        onClick={handleInitialize}
        disabled={loading}
        className="btn-primary flex items-center mx-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Setting up database...
          </>
        ) : (
          <>
            <Database className="h-5 w-5 mr-2" />
            Initialize Database
          </>
        )}
      </button>
      
      <div className="mt-6 text-sm text-secondary-500 dark:text-secondary-400 max-w-lg mx-auto">
        <p className="font-medium mb-2">This will create:</p>
        <ul className="space-y-1">
          <li>• Kilimani Heights Apartments (3 sample units)</li>
          <li>• Westlands Plaza (2 commercial units)</li>
          <li>• Ready for you to add tenants and track payments</li>
        </ul>
      </div>
    </div>
  );
} 