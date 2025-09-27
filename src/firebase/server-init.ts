/**
 * @fileoverview
 * This file provides a mechanism for initializing the Firebase Admin SDK on the server-side,
 * ensuring that it's a singleton and can be safely used in different server environments like
 * Genkit flows or Next.js server actions.
 */

import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

interface FirebaseAdminServices {
  app: App;
  firestore: Firestore;
}

let services: FirebaseAdminServices | null = null;

/**
 * Initializes the Firebase Admin SDK and returns the app and Firestore services.
 * It ensures that initialization only happens once (singleton pattern).
 *
 * This function is intended for server-side use ONLY.
 *
 * @returns {FirebaseAdminServices} An object containing the initialized Firebase app and Firestore service.
 */
export function initializeFirebase(): FirebaseAdminServices {
  if (services) {
    return services;
  }

  const apps = getApps();
  const app = apps.length
    ? getApp()
    : initializeApp({ projectId: firebaseConfig.projectId });
    
  const firestore = getFirestore(app);

  services = { app, firestore };

  return services;
}
