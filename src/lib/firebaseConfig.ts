// This file isolates the access to environment variables,
// making it easier to mock for testing environments.

const configProvider = {
  getFirebaseConfig() {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;

    // Help designers/developers find where to put the keys
    if (!firebaseConfig.apiKey) {
      console.warn("Firebase API Key is missing. Please configure VITE_FIREBASE_API_KEY in your environment/secrets.");
    }

    return { firebaseConfig, databaseId };
  }
};

export default configProvider;
