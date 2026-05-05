export function getFirebaseConfig() {
  // ambiente de teste
  if (process.env.NODE_ENV === 'test') {
    return {
      firebaseConfig: {
        apiKey: 'test',
        authDomain: 'test',
        projectId: 'demo-test',
        storageBucket: 'test',
        messagingSenderId: 'test',
        appId: 'test',
      },
      databaseId: 'test',
    };
  }

  // ambiente normal (Vite)
  return {
    firebaseConfig: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    },
    databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
  };
}
