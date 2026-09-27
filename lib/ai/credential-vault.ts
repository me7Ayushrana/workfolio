import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export type AIProviderStatus =
  | 'VALID'
  | 'INVALID'
  | 'RATE_LIMITED'
  | 'BILLING_REQUIRED'
  | 'PERMISSION_ERROR'
  | 'NETWORK_ERROR'
  | 'PROVIDER_ERROR'
  | 'NOT_CONFIGURED'

export interface ProviderSafeInfo {
  configured: boolean
  status: AIProviderStatus
  mode: 'platform' | 'byok'
  model: string
  lastValidatedAt?: string
  message?: string
}

export interface AISystemStatusResponse {
  mode: 'platform' | 'byok'
  primaryProvider: 'gemini' | 'groq'
  fallbackEnabled: boolean
  gemini: ProviderSafeInfo
  groq: ProviderSafeInfo
}

// AES-256-GCM Encryption key derived from server secret or fallback
const SERVER_SECRET = process.env.WORKFOLIO_SECRET || process.env.NEXTAUTH_SECRET || 'workfolio-production-hardening-secret-2026'

function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(SERVER_SECRET).digest()
}

export function encryptSecret(text: string): string {
  if (!text) return ''
  const iv = crypto.randomBytes(12)
  const key = getEncryptionKey()
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${tag}:${encrypted}`
}

export function decryptSecret(cipherText: string): string {
  if (!cipherText) return ''
  try {
    const parts = cipherText.split(':')
    if (parts.length !== 3) return ''
    const [ivHex, tagHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const key = getEncryptionKey()
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return ''
  }
}

// Server BYOK Storage File
const VAULT_FILE_PATH = path.join(process.cwd(), '.workfolio-byok-vault.json')

interface BYOKVaultData {
  geminiKeyEncrypted?: string
  geminiModel?: string
  geminiStatus?: AIProviderStatus
  geminiLastValidatedAt?: string
  groqKeyEncrypted?: string
  groqModel?: string
  groqStatus?: AIProviderStatus
  groqLastValidatedAt?: string
  primaryProvider?: 'gemini' | 'groq'
  fallbackEnabled?: boolean
}

function readBYOKVault(): BYOKVaultData {
  try {
    if (fs.existsSync(VAULT_FILE_PATH)) {
      const data = fs.readFileSync(VAULT_FILE_PATH, 'utf-8')
      return JSON.parse(data)
    }
  } catch {
    // Ignore error
  }
  return {}
}

function writeBYOKVault(data: BYOKVaultData) {
  try {
    fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    // Ignore error
  }
}

/**
 * Gets effective API key and model for a provider
 */
export function getEffectiveProviderConfig(providerId: 'gemini' | 'groq'): {
  apiKey: string
  model: string
  mode: 'platform' | 'byok'
  isConfigured: boolean
} {
  const vault = readBYOKVault()

  if (providerId === 'gemini') {
    // Check BYOK first
    const byokKey = vault.geminiKeyEncrypted ? decryptSecret(vault.geminiKeyEncrypted) : ''
    if (byokKey) {
      return {
        apiKey: byokKey,
        model: vault.geminiModel || process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        mode: 'byok',
        isConfigured: true
      }
    }

    // Fallback to platform env
    const platformKey = process.env.GEMINI_API_KEY?.trim() || ''
    return {
      apiKey: platformKey,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      mode: 'platform',
      isConfigured: Boolean(platformKey)
    }
  } else {
    // Groq
    const byokKey = vault.groqKeyEncrypted ? decryptSecret(vault.groqKeyEncrypted) : ''
    if (byokKey) {
      return {
        apiKey: byokKey,
        model: vault.groqModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        mode: 'byok',
        isConfigured: true
      }
    }

    const platformKey = process.env.GROQ_API_KEY?.trim() || ''
    return {
      apiKey: platformKey,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      mode: 'platform',
      isConfigured: Boolean(platformKey)
    }
  }
}

/**
 * Save BYOK Credential on server
 */
export function saveBYOKCredential(
  providerId: 'gemini' | 'groq',
  apiKey: string,
  status: AIProviderStatus,
  model?: string
) {
  const vault = readBYOKVault()
  const now = new Date().toISOString()
  const encrypted = encryptSecret(apiKey.trim())

  if (providerId === 'gemini') {
    vault.geminiKeyEncrypted = encrypted
    vault.geminiStatus = status
    vault.geminiLastValidatedAt = now
    if (model) vault.geminiModel = model
  } else {
    vault.groqKeyEncrypted = encrypted
    vault.groqStatus = status
    vault.groqLastValidatedAt = now
    if (model) vault.groqModel = model
  }

  writeBYOKVault(vault)
}

/**
 * Update Provider status in Vault
 */
export function updateProviderStatusInVault(
  providerId: 'gemini' | 'groq',
  status: AIProviderStatus
) {
  const vault = readBYOKVault()
  const now = new Date().toISOString()
  if (providerId === 'gemini') {
    vault.geminiStatus = status
    vault.geminiLastValidatedAt = now
  } else {
    vault.groqStatus = status
    vault.groqLastValidatedAt = now
  }
  writeBYOKVault(vault)
}

/**
 * Clear BYOK Credential for a provider
 */
export function clearBYOKCredential(providerId: 'gemini' | 'groq') {
  const vault = readBYOKVault()
  if (providerId === 'gemini') {
    delete vault.geminiKeyEncrypted
    vault.geminiStatus = 'NOT_CONFIGURED'
  } else {
    delete vault.groqKeyEncrypted
    vault.groqStatus = 'NOT_CONFIGURED'
  }
  writeBYOKVault(vault)
}

/**
 * Sets primary provider & fallback preferences in vault
 */
export function setProviderPreferences(primaryProvider: 'gemini' | 'groq', fallbackEnabled: boolean) {
  const vault = readBYOKVault()
  vault.primaryProvider = primaryProvider
  vault.fallbackEnabled = fallbackEnabled
  writeBYOKVault(vault)
}

export function getProviderPreferences(): { primaryProvider: 'gemini' | 'groq'; fallbackEnabled: boolean } {
  const vault = readBYOKVault()
  return {
    primaryProvider: vault.primaryProvider || 'gemini',
    fallbackEnabled: vault.fallbackEnabled !== false
  }
}
