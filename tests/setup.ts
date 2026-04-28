import 'global-jsdom/register';
import configProvider from '../src/lib/firebaseConfig';
import sinon from 'sinon';

// This is the correct way to stub an ES Module.
// We stub the method on the exported object, not the export itself.
sinon.stub(configProvider, 'getFirebaseConfig').returns({
  firebaseConfig: {
    apiKey: "test-api-key",
    authDomain: "test-auth-domain",
    projectId: "test-project-id",
    storageBucket: "test-storage-bucket",
    messagingSenderId: "test-messaging-sender-id",
    appId: "test-app-id",
  },
  databaseId: "test-database-id",
});
