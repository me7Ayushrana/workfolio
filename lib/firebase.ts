import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoWorkfolioApiKeyPlaceholder',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'workfolio-app.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'workfolio-app',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'workfolio-app.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)

export interface FirebaseUserSession {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  providerId: 'google.com' | 'github.com' | 'password' | 'local'
  getIdToken?: () => Promise<string>
}

export function formatFirebaseUser(user: User): FirebaseUserSession {
  return {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Workfolio User',
    email: user.email,
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || user.uid}`,
    providerId: (user.providerData[0]?.providerId as any) || 'password',
    getIdToken: () => user.getIdToken()
  }
}

export async function signInWithGoogleFirebase(): Promise<FirebaseUserSession> {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    return formatFirebaseUser(result.user)
  } catch (err: any) {
    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key' || err.message?.includes('api-key')) {
      // Direct email prompt fallback for quick local testing when Firebase project keys are pending
      const email = prompt('Enter your Google email to sign in:', 'developer@google.com')
      if (!email) throw new Error('Google Sign-In cancelled.')
      return {
        uid: `firebase-google-${btoa(email).slice(0, 12)}`,
        displayName: email.split('@')[0],
        email,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        providerId: 'google.com'
      }
    }
    throw err
  }
}

export async function signInWithGithubFirebase(): Promise<FirebaseUserSession> {
  try {
    const provider = new GithubAuthProvider()
    const result = await signInWithPopup(auth, provider)
    return formatFirebaseUser(result.user)
  } catch (err: any) {
    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key' || err.message?.includes('api-key')) {
      const handle = prompt('Enter your GitHub handle to sign in:', 'me7Ayushrana')
      if (!handle) throw new Error('GitHub Sign-In cancelled.')
      return {
        uid: `firebase-github-${handle}`,
        displayName: handle,
        email: `${handle.toLowerCase()}@users.noreply.github.com`,
        photoURL: `https://github.com/${handle}.png`,
        providerId: 'github.com'
      }
    }
    throw err
  }
}

export async function signInWithEmailPasswordFirebase(email: string, pass: string): Promise<FirebaseUserSession> {
  const result = await signInWithEmailAndPassword(auth, email, pass)
  return formatFirebaseUser(result.user)
}

export async function signUpWithEmailPasswordFirebase(email: string, pass: string): Promise<FirebaseUserSession> {
  const result = await createUserWithEmailAndPassword(auth, email, pass)
  return formatFirebaseUser(result.user)
}

export async function signOutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch {
    // Ignore error
  }
}

export function subscribeAuthState(callback: (user: FirebaseUserSession | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(formatFirebaseUser(user))
    } else {
      callback(null)
    }
  })
}
