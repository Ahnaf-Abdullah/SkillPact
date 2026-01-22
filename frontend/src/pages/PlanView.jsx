import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc,
  query,
  orderBy,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';

const PlanView = () => {
  const { planId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showWeekForm, setShowWeekForm] = useState(false);
  const [weekTitle, setWeekTitle] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchPlanData();
  }, [planId, currentUser]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      
      // Fetch plan
      const planDoc = await getDoc(doc(db, 'learningPlans', planId));
      if (!planDoc.exists()) {
        navigate('/dashboard');
        return;
      }
      
      const planData = { id: planDoc.id, ...planDoc.data() };
      setPlan(planData);
      setIsOwner(planData.ownerId === currentUser.uid);
      
      // Fetch weeks
      const weeksQuery = query(
        collection(db, 'learningPlans', planId, 'weeks'),
        orderBy('weekNumber', 'asc')
      );
      const weeksSnapshot = await getDocs(weeksQuery);
      const weeksData = [];
      
      for (const weekDoc of weeksSnapshot.docs) {
        const tasksSnapshot = await getDocs(
          collection(db, 'learningPlans', planId, 'weeks', weekDoc.id, 'tasks')
        );
        const tasks = tasksSnapshot.docs.map(taskDoc => ({
          id: taskDoc.id,
          ...taskDoc.data()
        }));
        
        weeksData.push({
          id: weekDoc.id,
          ...weekDoc.data(),
          tasks
        });
      }
      
      setWeeks(weeksData);
      
      // Fetch members
      const membersSnapshot = await getDocs(
        collection(db, 'learningPlans', planId, 'members')
      );
      const membersData = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(membersData.filter(m => m.status === 'accepted'));
      
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeek = async (e) => {
    e.preventDefault();
    try {
      const weekNumber = weeks.length + 1;
      await addDoc(collection(db, 'learningPlans', planId, 'weeks'), {
        weekNumber,
        title: weekTitle || `Week ${weekNumber}`,
        createdAt: new Date()
      });
      setWeekTitle('');
      setShowWeekForm(false);
      fetchPlanData();
    } catch (error) {
      console.error('Error adding week:', error);
    }
  };

  const handleAddTask = async (e, weekId) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'learningPlans', planId, 'weeks', weekId, 'tasks'), {
        title: taskTitle,
        description: taskDescription,
        completedBy: [],
        createdAt: new Date()
      });
      setTaskTitle('');
      setTaskDescription('');
      setShowTaskForm(null);
      fetchPlanData();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (weekId, taskId, completedBy) => {
    try {
      const taskRef = doc(db, 'learningPlans', planId, 'weeks', weekId, 'tasks', taskId);
      const isCompleted = completedBy.includes(currentUser.uid);
      
      await updateDoc(taskRef, {
        completedBy: isCompleted 
          ? arrayRemove(currentUser.uid) 
          : arrayUnion(currentUser.uid)
      });
      
      fetchPlanData();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      // Create invitation in userInvitations collection
      await addDoc(collection(db, 'userInvitations'), {
        planId: planId,
        planTitle: plan.title,
        planDescription: plan.description,
        invitedEmail: inviteEmail,
        invitedBy: currentUser.email,
        invitedByUserId: currentUser.uid,
        status: 'pending',
        invitedAt: new Date()
      });
      setInviteEmail('');
      setShowInviteForm(false);
      alert('Invitation sent!');
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to send invitation: ' + error.message);
    }
  };

  const calculateProgress = (userId) => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    weeks.forEach(week => {
      week.tasks.forEach(task => {
        totalTasks++;
        if (task.completedBy.includes(userId)) {
          completedTasks++;
        }
      });
    });
    
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl font-semibold text-gray-700">Loading plan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold mb-3 flex items-center space-x-1 transition duration-200"
              >
                <span>←</span><span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">📚</span>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{plan?.title}</h1>
              </div>
              <p className="text-gray-600 text-lg">{plan?.description}</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition duration-200"
            >
              👤 Profile
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-2xl">📊</span>
            <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
          </div>
          <div className="space-y-5">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-indigo-900">🎯 You</span>
                <span className="font-bold text-indigo-700">{calculateProgress(currentUser.uid)}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full shadow-sm transition-all duration-500"
                  style={{ width: `${calculateProgress(currentUser.uid)}%` }}
                />
              </div>
            </div>
            {members.map(member => (
              <div key={member.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition duration-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-800">👤 {member.email}</span>
                  <span className="font-semibold text-gray-600">{calculateProgress(member.userId)}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full shadow-sm transition-all duration-500"
                    style={{ width: `${calculateProgress(member.userId)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {isOwner && (
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="mt-6 px-5 py-2.5 text-sm bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 font-semibold transition duration-200 flex items-center space-x-2"
            >
              <span>✉️</span><span>Invite Member</span>
            </button>
          )}
          
          {showInviteForm && (
            <form onSubmit={handleInviteMember} className="mt-4 flex space-x-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-md transition duration-200"
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-100 transition duration-200"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Weeks Section */}
        <div className="space-y-6">
          {weeks.map(week => (
            <div key={week.id} className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-2 mb-5">
                <span className="text-2xl">📅</span>
                <h3 className="text-xl font-bold text-gray-900">{week.title}</h3>
              </div>
              
              <div className="space-y-3">
                {week.tasks.map(task => {
                  const isCompleted = task.completedBy.includes(currentUser.uid);
                  return (
                    <div key={task.id} className={`flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 ${isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200 hover:border-indigo-300'}`}>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggleTask(week.id, task.id, task.completedBy)}
                        className="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className={`font-semibold text-base ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {isCompleted && '✓ '}{task.title}
                        </p>
                        {task.description && (
                          <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>{task.description}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            👥 {task.completedBy.length} completed
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {isOwner && (
                <>
                  {showTaskForm === week.id ? (
                    <form onSubmit={(e) => handleAddTask(e, week.id)} className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-3">
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Task title"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                        required
                      />
                      <textarea
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Task description (optional)"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 resize-none"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-md transition duration-200"
                        >
                          ➕ Add Task
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTaskForm(null)}
                          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-100 transition duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowTaskForm(week.id)}
                      className="mt-5 px-5 py-2.5 text-sm bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 font-semibold transition duration-200 flex items-center space-x-1"
                    >
                      <span>➕</span><span>Add Task</span>
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          
          {isOwner && (
            <>
              {showWeekForm ? (
                <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
                  <form onSubmit={handleAddWeek} className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">✨</span>
                      <h3 className="text-lg font-bold text-gray-900">Add New Week</h3>
                    </div>
                    <input
                      type="text"
                      value={weekTitle}
                      onChange={(e) => setWeekTitle(e.target.value)}
                      placeholder={`Week ${weeks.length + 1}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg transition duration-200 transform hover:scale-105"
                      >
                        🚀 Add Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWeekForm(false)}
                        className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowWeekForm(true)}
                  className="w-full py-6 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 font-semibold text-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <span>➕</span><span>Add New Week</span>
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlanView;
