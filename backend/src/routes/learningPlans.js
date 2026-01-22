import express from 'express';
import { db } from '../config/firebase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all learning plans for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get plans owned by user
    const ownedPlans = await db.collection('learningPlans')
      .where('ownerId', '==', userId)
      .get();
    
    const plans = ownedPlans.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ plans });
  } catch (error) {
    console.error('Error fetching learning plans:', error);
    res.status(500).json({ error: 'Failed to fetch learning plans' });
  }
});

// Get a specific learning plan
router.get('/:planId', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const planDoc = await db.collection('learningPlans').doc(planId).get();
    
    if (!planDoc.exists) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    const plan = { id: planDoc.id, ...planDoc.data() };
    res.json({ plan });
  } catch (error) {
    console.error('Error fetching learning plan:', error);
    res.status(500).json({ error: 'Failed to fetch learning plan' });
  }
});

// Create a new learning plan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.uid;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const planData = {
      title,
      description: description || '',
      ownerId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const planRef = await db.collection('learningPlans').add(planData);
    
    res.status(201).json({ 
      id: planRef.id,
      ...planData 
    });
  } catch (error) {
    console.error('Error creating learning plan:', error);
    res.status(500).json({ error: 'Failed to create learning plan' });
  }
});

// Update a learning plan
router.put('/:planId', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const { title, description } = req.body;
    const userId = req.user.uid;
    
    const planDoc = await db.collection('learningPlans').doc(planId).get();
    
    if (!planDoc.exists) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    if (planDoc.data().ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this plan' });
    }
    
    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      updatedAt: new Date()
    };
    
    await db.collection('learningPlans').doc(planId).update(updateData);
    
    res.json({ message: 'Learning plan updated successfully' });
  } catch (error) {
    console.error('Error updating learning plan:', error);
    res.status(500).json({ error: 'Failed to update learning plan' });
  }
});

// Delete a learning plan
router.delete('/:planId', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.uid;
    
    const planDoc = await db.collection('learningPlans').doc(planId).get();
    
    if (!planDoc.exists) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    if (planDoc.data().ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this plan' });
    }
    
    await db.collection('learningPlans').doc(planId).delete();
    
    res.json({ message: 'Learning plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting learning plan:', error);
    res.status(500).json({ error: 'Failed to delete learning plan' });
  }
});

export default router;
