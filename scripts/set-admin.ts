import { adminAuth, adminFirestore } from '../src/server/firebaseAdmin';

async function setAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: tsx scripts/set-admin.ts <user-email>');
    process.exit(1);
  }

  try {
    const user = await adminAuth().getUserByEmail(email);
    await adminAuth().setCustomUserClaims(user.uid, { admin: true });

    // Update in Firestore
    await adminFirestore().collection('users').doc(user.uid).set(
      {
        email: user.email,
        role: 'admin',
        canPersist: true,
        emailVerified: user.emailVerified,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`✅ Successfully granted admin and canPersist privileges to: ${email} (${user.uid})`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to set admin claim:', err);
    process.exit(1);
  }
}

setAdmin();
