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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-indigo-600 hover:text-indigo-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{plan?.title}</h1>
              <p className="text-gray-600">{plan?.description}</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Profile
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Progress</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">You</span>
                <span>{calculateProgress(currentUser.uid)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${calculateProgress(currentUser.uid)}%` }}
                />
              </div>
            </div>
            {members.map(member => (
              <div key={member.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{member.email}</span>
                  <span>{calculateProgress(member.userId)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${calculateProgress(member.userId)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {isOwner && (
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Invite Member
            </button>
          )}
          
          {showInviteForm && (
            <form onSubmit={handleInviteMember} className="mt-4 flex space-x-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Weeks Section */}
        <div className="space-y-6">
          {weeks.map(week => (
            <div key={week.id} className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">{week.title}</h3>
              
              <div className="space-y-2">
                {week.tasks.map(task => {
                  const isCompleted = task.completedBy.includes(currentUser.uid);
                  return (
                    <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggleTask(week.id, task.id, task.completedBy)}
                        className="mt-1 h-5 w-5 text-indigo-600 rounded"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-600">{task.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Completed by: {task.completedBy.length} member(s)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {isOwner && (
                <>
                  {showTaskForm === week.id ? (
                    <form onSubmit={(e) => handleAddTask(e, week.id)} className="mt-4 space-y-2">
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Task title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                      <textarea
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Task description (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                        >
                          Add Task
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTaskForm(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowTaskForm(week.id)}
                      className="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Task
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          
          {isOwner && (
            <>
              {showWeekForm ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <form onSubmit={handleAddWeek} className="space-y-4">
                    <input
                      type="text"
                      value={weekTitle}
                      onChange={(e) => setWeekTitle(e.target.value)}
                      placeholder={`Week ${weeks.length + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Add Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWeekForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowWeekForm(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                >
                  + Add New Week
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
