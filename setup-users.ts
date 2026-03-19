import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';

// 1. Load configuration (Assumes service-account.json is present in the root)
// If you don't have a service-account.json, you can download it from:
// Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
const SERVICE_ACCOUNT_PATH = './service-account.json';

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('Error: service-account.json not found.');
  console.log('Please download your service account key from the Firebase Console and save it as "service-account.json" in the root directory.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
  // Use the databaseId if specified in your config, otherwise it uses (default)
  // databaseId: 'your-named-database-id' 
});

const auth = getAuth();
const db = getFirestore();

const DEFAULT_PASSWORD = 'Password123!';

const usersToCreate = [
  {
    email: 'jcesperanza@neu.edu.ph',
    role: 'admin',
    displayName: 'JC Esperanza',
    isAdmin: true,
    classification: 'Staff'
  },
  {
    email: 'student_test@neu.edu.ph',
    role: 'student',
    displayName: 'Test Student',
    classification: 'Student'
  },
  {
    email: 'faculty_test@neu.edu.ph',
    role: 'faculty',
    displayName: 'Test Faculty',
    classification: 'Faculty'
  },
  {
    email: 'staff_test@neu.edu.ph',
    role: 'staff',
    displayName: 'Test Staff',
    classification: 'Staff'
  }
];

async function setupUsers() {
  console.log('Starting user setup...');

  for (const userData of usersToCreate) {
    try {
      let userRecord;
      try {
        // Check if user already exists
        userRecord = await auth.getUserByEmail(userData.email);
        console.log(`User ${userData.email} already exists. Updating...`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          userRecord = await auth.createUser({
            email: userData.email,
            password: DEFAULT_PASSWORD,
            displayName: userData.displayName,
            emailVerified: true
          });
          console.log(`Successfully created new user: ${userData.email}`);
        } else {
          throw error;
        }
      }

      // 1. Set Custom Claims if admin
      if (userData.isAdmin) {
        await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        console.log(`Custom claims set for ${userData.email}: { admin: true }`);
      } else {
        // Ensure no admin claims for others
        await auth.setCustomUserClaims(userRecord.uid, { admin: false });
      }

      // 2. Sync to Firestore
      const userRef = db.collection('users').doc(userRecord.uid);
      await userRef.set({
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        status: 'approved',
        classification: userData.classification,
        isBlocked: false,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        college_office: 'University Administration'
      }, { merge: true });

      console.log(`Firestore document synced for ${userData.email}`);

    } catch (error: any) {
      console.error(`Error processing ${userData.email}:`, error.message);
    }
  }

  console.log('\nSetup complete!');
  console.log('Default Password for test accounts:', DEFAULT_PASSWORD);
}

setupUsers().catch(console.error);
