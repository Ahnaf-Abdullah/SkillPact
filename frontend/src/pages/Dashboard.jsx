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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SkillPact</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {currentUser?.displayName || currentUser?.email}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Invitations</h2>
            <div className="bg-white shadow rounded-lg divide-y">
              {invitations.map((invitation) => (
                <div key={invitation.invitationId} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{invitation.planTitle}</h3>
                    <p className="text-sm text-gray-600">{invitation.planDescription}</p>
                    <p className="text-xs text-gray-500 mt-1">Invited by: {invitation.invitedBy}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptInvitation(invitation.invitationId, invitation.planId)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectInvitation(invitation.invitationId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Plans Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Learning Plans</h2>
          <button
            onClick={() => navigate('/create-plan')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create New Plan
          </button>
        </div>

        {learningPlans.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">No learning plans yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow relative"
              >
                <div onClick={() => navigate(`/plan/${plan.id}`)} className="cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{plan.ownerId === currentUser.uid ? 'Owner' : 'Member'}</span>
                    <span>{plan.createdAt && new Date(plan.createdAt.toDate()).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  {plan.ownerId === currentUser.uid ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id);
                      }}
                      className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete Plan
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeavePlan(plan.id);
                      }}
                      className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Leave Plan
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
