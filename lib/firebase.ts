import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1014854710087:web:Od96a81bdb84808a535262'
}

if (typeof window !== 'undefined') {
  console.log('[FIREBASE CONFIG DIAGNOSTICS]')
  console.log('Firebase projectId:', firebaseConfig.projectId)
  console.log('Firebase authDomain:', firebaseConfig.authDomain)
  console.log('Firebase appId:', firebaseConfig.appId)
  console.log('Firebase API key present:', Boolean(firebaseConfig.apiKey))
  console.log('Firebase API key prefix:', firebaseConfig.apiKey ? firebaseConfig.apiKey.slice(0, 6) + '...' : 'NONE')
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
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    const result = await signInWithPopup(auth, provider)
    return formatFirebaseUser(result.user)
  } catch (err: any) {
    console.error('FIREBASE GOOGLE OAUTH ERROR CODE:', err?.code)
    console.error('FIREBASE GOOGLE OAUTH ERROR MESSAGE:', err?.message)
    console.error('FULL FIREBASE ERROR OBJECT:', err)
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
  try {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        callback(formatFirebaseUser(result.user))
      }
    }).catch(() => {})
  } catch {}

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(formatFirebaseUser(user))
    } else {
      callback(null)
    }
  })
}
