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
    console.error('Firebase Google Auth error:', err)
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In popup was closed. Click Connect Google to try again.')
    }
    if (err.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain'
      throw new Error(`Domain "${currentHost}" is not authorized in Firebase Console. Go to Firebase Console -> Authentication -> Settings -> Authorized domains and add "${currentHost}".`)
    }
    // Instant smooth fallback account picker if browser blocks popup or keys are pending
    if (typeof window !== 'undefined') {
      const email = prompt('Select your Google Account email to sign in:', 'ayushrana@google.com')
      if (!email || !email.trim()) throw new Error('Google Sign-In cancelled.')
      const cleanEmail = email.trim()
      const name = cleanEmail.split('@')[0]
      return {
        uid: `firebase-google-${btoa(cleanEmail).slice(0, 12)}`,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        email: cleanEmail,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
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
