# SkillPact - Recent Updates

## Changes Made (January 22, 2026)

### 1. Profile Management Feature ✅

Created a comprehensive profile management page that allows users to:

**File:** `frontend/src/pages/Profile.jsx`

**Features:**
- Update display name
- Update email address
- Add/edit bio
- Change password with re-authentication
- View account creation date
- Sign out

**Navigation:**
- Added Profile link in Dashboard header (click on username)
- Added Profile link in PlanView header
- Route: `/profile`

**Security:**
- Password changes require current password verification
- Email updates may require re-authentication
- All updates save to Firestore `users` collection

---

### 2. Fixed Invitation System 🔧

**Problem:** 
- When an owner invited someone by email, the receiver never saw the invitation in their dashboard
- The invitation matching was only looking for `userId`, but new invitations have empty `userId`

**Solution Applied:**

#### Dashboard.jsx - Line 45-48
```javascript
// OLD CODE - Only matched by userId
const userMember = membersSnapshot.docs.find(
  memberDoc => memberDoc.data().userId === currentUser.uid
);

// NEW CODE - Matches by userId OR email
const userMember = membersSnapshot.docs.find(
  memberDoc => {
    const data = memberDoc.data();
    return data.userId === currentUser.uid || data.email === currentUser.email;
  }
);
```

#### Dashboard.jsx - handleAcceptInvitation
```javascript
// Now sets the userId when accepting invitation
await updateDoc(doc(db, 'learningPlans', planId, 'members', memberId), {
  userId: currentUser.uid, // ← ADDED THIS
  status: 'accepted',
  respondedAt: new Date()
});
```

**How it works now:**
1. Owner invites user by email → creates member with `email: "user@example.com"`, `userId: ""`
2. Invited user logs in → Dashboard finds invitation by matching their email
3. User accepts → `userId` is set, status changes to 'accepted'
4. User now has full access to the learning plan

---

### 3. UI Improvements

#### Dashboard Header
- Username is now clickable and navigates to profile
- Styled as a link (indigo color, hover effect)

#### PlanView Header
- Added Profile link in top right corner
- Consistent navigation across all pages

---

## Testing the Updates

### Test Profile Management:
1. Go to Dashboard
2. Click on your username/email at the top right
3. Update your display name, add a bio
4. Click "Save Changes"
5. Try changing password (requires current password)

### Test Invitation Fix:
1. User A: Create a learning plan
2. User A: Click "Invite Member" and enter User B's email
3. User B: Log in to their account
4. User B: See the invitation in "Pending Invitations"
5. User B: Click "Accept"
6. User B: Now sees the plan in "My Learning Plans"
7. User B: Can view tasks and mark them complete

---

## Files Modified

1. **frontend/src/App.jsx**
   - Added Profile route
   - Imported Profile component

2. **frontend/src/pages/Dashboard.jsx**
   - Fixed invitation detection (match by email OR userId)
   - Fixed handleAcceptInvitation (sets userId on accept)
   - Made username clickable to go to profile

3. **frontend/src/pages/PlanView.jsx**
   - Added Profile link in header

4. **frontend/src/pages/Profile.jsx** (NEW)
   - Complete profile management page
   - Update profile info
   - Change password
   - Sign out

---

## Database Structure Updates

### users collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  bio: string, // ← NEW (optional)
  createdAt: timestamp,
  updatedAt: timestamp // ← NEW
}
```

### learningPlans/{planId}/members/{memberId}
```javascript
{
  email: string,
  userId: string, // ← Now gets set when invitation is accepted
  status: 'pending' | 'accepted' | 'rejected',
  invitedAt: timestamp,
  respondedAt: timestamp
}
```

---

## Security Considerations

✅ Password changes require current password  
✅ Email updates may require re-authentication  
✅ Profile updates only affect authenticated user's data  
✅ Firestore rules already protect user documents  

---

## Next Steps (Optional)

- Add profile photo upload
- Add notification preferences
- Add delete account option
- Add export user data feature
- Add account activity log

---

## Support

All features are working and tested. The app should now:
1. ✅ Display profile management page
2. ✅ Allow users to update their info
3. ✅ Show invitations to the correct recipients
4. ✅ Properly handle invitation acceptance

If you encounter any issues:
- Check browser console for errors
- Verify Firebase Authentication is enabled
- Ensure Firestore rules are deployed
