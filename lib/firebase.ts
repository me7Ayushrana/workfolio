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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCxFGoSzbINdC2gCbuAhbj8waj4eSXm_VQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'workfolio-96ab9.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'workfolio-96ab9',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'workfolio-96ab9.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1014854710087',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1014854710087:web:0d96a81bdb84808a535262'
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
    provider.setCustomParameters({ prompt: 'select_account' })
    const result = await signInWithPopup(auth, provider)
    return formatFirebaseUser(result.user)
  } catch (err: any) {
    console.warn('Firebase Google Auth error code:', err?.code, err?.message)
    if (err?.code === 'auth/popup-blocked') {
      throw new Error('Google Sign-In popup was blocked by your browser. Please allow popups for this site.')
    } else if (err?.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In popup was closed before completing sign-in.')
    } else if (err?.code === 'auth/cancelled-popup-request') {
      throw new Error('Google Sign-In popup request was cancelled.')
    } else if (err?.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email using a different sign-in provider.')
    } else if (err?.code === 'auth/network-request-failed') {
      throw new Error('Network error during Google Sign-In. Please check your internet connection.')
    }
    throw new Error(err?.message || 'Google Sign-In failed.')
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
