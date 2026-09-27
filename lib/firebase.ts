import { initializeApp, getApps, getApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCxFGoSzbINdC2gCbuAhbj8waj4eSXm_VQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'workfolio-96ab9.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'workfolio-96ab9',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'workfolio-96ab9.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1014854710087',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1014854710087:web:0d96a81bdb84808a535262',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ZGD9K1DGEP'
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export interface FirebaseUserSession {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  providerId: 'local'
}

export async function signInWithGoogleFirebase(): Promise<FirebaseUserSession> {
  throw new Error('Authentication has been removed.')
}

export async function signInWithGoogleRedirect(): Promise<void> {}

export async function signInWithGithubFirebase(): Promise<FirebaseUserSession> {
  throw new Error('Authentication has been removed.')
}

export async function signInWithEmailPasswordFirebase(): Promise<FirebaseUserSession> {
  throw new Error('Authentication has been removed.')
}

export async function signUpWithEmailPasswordFirebase(): Promise<FirebaseUserSession> {
  throw new Error('Authentication has been removed.')
}

export async function signOutFirebase(): Promise<void> {}

export function subscribeAuthState(callback: (user: FirebaseUserSession | null) => void) {
  // Return dummy unsubscribe
  return () => {}
}
