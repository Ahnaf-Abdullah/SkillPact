import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [learningPlans, setLearningPlans] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      console.log('Fetching data for user:', currentUser.uid, currentUser.email);
      
      // Fetch user's own learning plans
      const plansQuery = query(
        collection(db, 'learningPlans'),
        where('ownerId', '==', currentUser.uid)
      );
      const plansSnapshot = await getDocs(plansQuery);
      console.log('Found owned plans:', plansSnapshot.docs.length);
      
      const plansData = plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch accepted invitations - use the data stored in invitations
      const acceptedInvitationsQuery = query(
        collection(db, 'userInvitations'),
        where('invitedEmail', '==', currentUser.email),
        where('status', '==', 'accepted')
      );
      const acceptedSnapshot = await getDocs(acceptedInvitationsQuery);
      console.log('Found accepted invitations:', acceptedSnapshot.docs.length);
      
      // Use invitation data directly (plan info is stored there)
      const memberPlans = acceptedSnapshot.docs.map(doc => {
        const invData = doc.data();
        return {
          id: invData.planId,
          title: invData.planTitle,
          description: invData.planDescription,
          ownerId: invData.invitedByUserId
        };
      });

      // Fetch pending invitations
      const invitationsQuery = query(
        collection(db, 'userInvitations'),
        where('invitedEmail', '==', currentUser.email),
        where('status', '==', 'pending')
      );
      const invitationsSnapshot = await getDocs(invitationsQuery);
      console.log('Found pending invitations:', invitationsSnapshot.docs.length);
      
      const invitationsData = invitationsSnapshot.docs.map(doc => ({
        invitationId: doc.id,
        ...doc.data()
      }));

      console.log('Plans data:', plansData);
      console.log('Member plans:', memberPlans);
      console.log('Invitations data:', invitationsData);
      
      setLearningPlans([...plansData, ...memberPlans]);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.message, error.code);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleAcceptInvitation = async (invitationId, planId) => {
    try {
      // Update the invitation status
      await updateDoc(doc(db, 'userInvitations', invitationId), {
        status: 'accepted',
        respondedAt: new Date()
      });
      
      // Add user as a member to the plan with userId as document ID
      await setDoc(doc(db, 'learningPlans', planId, 'members', currentUser.uid), {
        userId: currentUser.uid,
        email: currentUser.email,
        status: 'accepted',
        joinedAt: new Date()
      });
      
      fetchData();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await updateDoc(doc(db, 'userInvitations', invitationId), {
        status: 'rejected',
        respondedAt: new Date()
      });
      fetchData();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'learningPlans', planId));
      fetchData();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan: ' + error.message);
    }
  };

  const handleLeavePlan = async (planId) => {
    if (!confirm('Are you sure you want to leave this plan?')) {
      return;
    }
    
    try {
      // Find and update the accepted invitation
      const invitationsQuery = query(
        collection(db, 'userInvitations'),
        where('invitedEmail', '==', currentUser.email),
        where('planId', '==', planId),
        where('status', '==', 'accepted')
      );
      const snapshot = await getDocs(invitationsQuery);
      
      if (!snapshot.empty) {
        await updateDoc(doc(db, 'userInvitations', snapshot.docs[0].id), {
          status: 'left',
          leftAt: new Date()
        });
      }
      
      fetchData();
    } catch (error) {
      console.error('Error leaving plan:', error);
      alert('Failed to leave plan: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SkillPact</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition duration-200"
            >
              👤 {currentUser?.displayName || currentUser?.email}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Invitations Section */}
        {invitations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">✉️</span>
              <h2 className="text-xl font-bold text-gray-900">Pending Invitations</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">{invitations.length}</span>
            </div>
            <div className="bg-white shadow-lg rounded-2xl divide-y border border-gray-200">
              {invitations.map((invitation) => (
                <div key={invitation.invitationId} className="p-5 flex justify-between items-center hover:bg-gray-50 transition duration-200">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{invitation.planTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">{invitation.planDescription}</p>
                    <p className="text-xs text-gray-500 mt-2">📨 Invited by: <span className="font-medium">{invitation.invitedBy}</span></p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleAcceptInvitation(invitation.invitationId, invitation.planId)}
                      className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 text-sm font-semibold shadow-md transition duration-200 transform hover:scale-105"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleRejectInvitation(invitation.invitationId)}
                      className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-sm font-semibold transition duration-200"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Plans Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl font-bold text-gray-900">My Learning Plans</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">{learningPlans.length}</span>
          </div>
          <button
            onClick={() => navigate('/create-plan')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg transition duration-200 transform hover:scale-105"
          >
            ✨ Create New Plan
          </button>
        </div>

        {learningPlans.length === 0 ? (
          <div className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-gray-600 text-lg font-medium">No learning plans yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first plan to start your learning journey!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 relative border border-gray-200 group hover:-translate-y-1"
              >
                <div onClick={() => navigate(`/plan/${plan.id}`)} className="cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition duration-200">{plan.title}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${plan.ownerId === currentUser.uid ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {plan.ownerId === currentUser.uid ? '👑 Owner' : '👥 Member'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>📅 {plan.createdAt && new Date(plan.createdAt.toDate()).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {plan.ownerId === currentUser.uid ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id);
                      }}
                      className="w-full px-3 py-2.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-600 hover:text-white font-semibold transition duration-200"
                    >
                      🗑️ Delete Plan
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeavePlan(plan.id);
                      }}
                      className="w-full px-3 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-600 hover:text-white font-semibold transition duration-200"
                    >
                      👋 Leave Plan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
