import admin from 'firebase-admin';

let isInitialized = false;

export function getFirebaseAdmin() {
  if (!isInitialized) {
    if (admin.apps.length > 0) {
      isInitialized = true;
      return admin;
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isInitialized = true;
    } else {
      // Mock / Developer initial setup fallback
      admin.initializeApp({
        projectId: projectId || 'igotq-demo-project',
      });
      isInitialized = true;
    }
  }

  return admin;
}

export const adminAuth = () => getFirebaseAdmin().auth();
export const adminFirestore = () => getFirebaseAdmin().firestore();
