'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This object will hold the singleton instances of the Firebase services.
let firebaseServices: {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null = null;


/**
 * Initializes and/or returns the singleton instance of Firebase services for the client-side.
 * This function ensures that Firebase is initialized only once.
 *
 * It first checks if the services have already been initialized. If so, it returns them immediately.
 * If not, it checks if any Firebase apps are already present (e.g., from a previous render).
 * If no apps exist, it initializes a new one using the provided firebaseConfig.
 * Finally, it retrieves the Auth and Firestore services, stores them in the singleton object,
 * and returns them.
 *
 * This robust, simplified pattern prevents re-initialization errors and ensures that
 * Firebase services are reliably available throughout the application lifecycle.
 */
export function initializeFirebase() {
  if (firebaseServices) {
    return firebaseServices;
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseServices = {
    firebaseApp: app,
    auth,
    firestore,
  };

  return firebaseServices;
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';