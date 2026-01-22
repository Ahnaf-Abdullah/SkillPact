import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CreatePlan = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return setError('Title is required');
    }
    
    if (!currentUser) {
      return setError('You must be logged in to create a plan');
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log('Creating plan for user:', currentUser.uid);
      
      const planData = {
        title: title.trim(),
        description: description.trim(),
        ownerId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Plan data:', planData);
      
      const docRef = await addDoc(collection(db, 'learningPlans'), planData);
      console.log('Plan created with ID:', docRef.id);
      
      navigate(`/plan/${docRef.id}`);
    } catch (err) {
      console.error('Error creating plan:', err);
      setError('Failed to create learning plan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold mb-3 flex items-center space-x-1 transition duration-200"
          >
            <span>←</span><span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✨</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Create Learning Plan</h1>
          </div>
          <p className="text-gray-600 mt-2">Design your personalized learning journey</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
              📝 Plan Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              placeholder="e.g., Master React in 30 Days"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
              📋 Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 resize-none"
              placeholder="Describe your learning goals, what you'll accomplish, and the skills you'll develop..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105"
            >
              {loading ? '⏳ Creating...' : '🚀 Create Plan'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreatePlan;
