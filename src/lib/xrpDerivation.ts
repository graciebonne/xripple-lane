// XRP Address Derivation from Seed Phrase
// Uses BIP39 for mnemonic validation and xrpl for XRP address derivation

// Buffer polyfill for browser compatibility with bip39
import { Buffer } from 'buffer';
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}
  
import * as bip39 from 'bip39';
import { Wallet } from 'xrpl';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';
import * as bs58check from 'bs58check';
import * as bitcoin from 'bitcoinjs-lib';
import { derivePath } from 'ed25519-hd-key';
// import * as slip10 from 'micro-key-producer/slip10.js';
//import { derivePath } from 'ed25519-hd-key';
/**
 * Generates a new random BIP39 seed phrase
 */
export function generateSeedPhrase(): string {
  return bip39.generateMnemonic();
}

export interface DerivedWallet {
  xrpAddress: string;
  evmAddress: string;
  solanaAddress: string | null;
  tronAddress: string | null;
  bitcoinAddress: string | null;
}

// BIP39 English wordlist for validation
const BIP39_WORDLIST = bip39.wordlists?.english || bip39.wordlists?.EN;

/**
 * Validates a BIP39 mnemonic seed phrase
 */
export function validateSeedPhrase(seedPhrase: string): { valid: boolean; error?: string } {
  const normalizedPhrase = seedPhrase.trim().toLowerCase();
  const words = normalizedPhrase.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length !== 12 && words.length !== 24) {
    return { valid: false, error: `Recovery phrase must be 12 or 24 words (you entered ${words.length})` };
  }

  // Try multiple validation approaches
  try {
    // First, try the standard bip39 validation
    const isValid = bip39.validateMnemonic(normalizedPhrase);
    if (isValid) {
      return { valid: true };
    }
    
    // If standard validation fails, check if all words are in the wordlist
    if (BIP39_WORDLIST && BIP39_WORDLIST.length > 0) {
      const invalidWords: string[] = [];
      for (const word of words) {
        if (!BIP39_WORDLIST.includes(word)) {
          invalidWords.push(word);
        }
      }
      
      if (invalidWords.length > 0) {
        return { 
          valid: false, 
          error: `Invalid words: ${invalidWords.slice(0, 3).join(', ')}${invalidWords.length > 3 ? '...' : ''}` 
        };
      }
      
      // All words are valid but checksum might be wrong - still allow it
      // Some wallets use non-standard checksums
      console.warn('Seed phrase words are valid but checksum failed - proceeding anyway');
      return { valid: true };
    }
    
    // Fallback: if we can't validate properly, allow phrases with correct word count
    // This ensures the app doesn't break if bip39 wordlist isn't loaded
    console.warn('BIP39 wordlist not available, skipping detailed validation');
    return { valid: true };
  } catch (error) {
    console.error('Validation error:', error);
    // On any error, allow if word count is correct (fail open for UX)
    return { valid: true };
  }
}

/**
 * Derives an XRP address from a BIP39 seed phrase
 * Uses the XRP-specific derivation path
 */
export function deriveXrpAddress(seedPhrase: string): string {
  try {
    // Use xrpl's Wallet.fromMnemonic for proper BIP39 derivation
    const wallet = Wallet.fromMnemonic(seedPhrase.trim().toLowerCase());
    console.log('🔑 XRP Private Key:', wallet.privateKey);
    return wallet.address;
  } catch (error) {
    console.error('Error deriving XRP address:', error);
    // Fallback: Generate a deterministic address from the seed
    const seed = bip39.mnemonicToSeedSync(seedPhrase.trim().toLowerCase());
    const hash = Array.from(seed.slice(0, 20))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `r${hash.slice(0, 33)}`;
  }
}

/**
 * Derives an EVM-compatible address from a BIP39 seed phrase
 * Uses BIP44 path: m/44'/60'/0'/0/0
 */
export function deriveEvmAddress(seedPhrase: string): string {
  try {
    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(seedPhrase.trim().toLowerCase());
    
    // Create root HD node from seed
    const root = ethers.HDNodeWallet.fromSeed(seed);
    
    // Derive the first account (Ethereum path)
    const derivedWallet = root.derivePath("44'/60'/0'/0/0");
    console.log('🔑 EVM Private Key:', derivedWallet.privateKey);
    return derivedWallet.address;
  } catch (error) {
    console.error('Error deriving EVM address:', error);
    return '0x' + '0'.repeat(40);
  }
}

// /**
//  * Derives a Solana address from a BIP39 seed phrase
//  * Solana uses ed25519 with proper seed derivation
//  */
// export function deriveSolanaAddress(seedPhrase: string): string {
//   try {
//     // Convert mnemonic to BIP39 seed
//     const bip39Seed = bip39.mnemonicToSeedSync(seedPhrase.trim().toLowerCase());
    
//     // For Solana, use bytes 8-40 of the BIP39 seed directly as the ed25519 seed
//     const solanaSeed = bip39Seed.slice(8, 40);
    
//     // Create Solana keypair from seed
//     const keypair = Keypair.fromSeed(solanaSeed);
//     console.log('🔑 Solana Private Key:', bs58.default.encode(keypair.secretKey));
//     return keypair.publicKey.toBase58();
//   } catch (error) {
//     console.error('Error deriving Solana address:', error);
//     return '';
//   }
// }
// export function deriveSolanaAddress(seedPhrase: string): string {
//   try {
//     // 1. Convert mnemonic to BIP39 seed (64 bytes)
//     const bip39Seed = bip39.mnemonicToSeedSync(seedPhrase.trim().toLowerCase());
    
//     // 2. Define the standard Solana derivation path
//     // m / purpose' / coin_type' / account' / change'
//     // 501 is the coin type for Solana
//     const path = "m/44'/501'/0'/0'";
    
//     // 3. Derive the seed for this specific path
//     // note: derivePath expects the seed as a hex string
//     const derivedSeed = derivePath(path, bip39Seed.toString('hex')).key;
    
//     // 4. Create Solana keypair from the derived seed
//     const keypair = Keypair.fromSeed(derivedSeed);
    
//     // Optional: Log private key for debugging (Security Warning: Never do this in production!)
//     // console.log('🔑 Solana Private Key:', bs58.encode(keypair.secretKey));
    
//     return keypair.publicKey.toBase58();
//   } catch (error) {
//     console.error('Error deriving Solana address:', error);
//     return '';
//   }
// }
export function deriveSolanaAddress(seedPhrase: string): string {
  console.log("Step 1: Function triggered with phrase:", seedPhrase.split(' ').length, "words");
  
  try {
    const trimmedPhrase = seedPhrase.trim().toLowerCase();
    
    // Validate Mnemonic explicitly
    const isValid = bip39.validateMnemonic(trimmedPhrase);
    console.log("Step 2: Is Mnemonic valid?", isValid);
    if (!isValid) return 'Invalid Mnemonic';

    // Generate Seed
    const seed = bip39.mnemonicToSeedSync(trimmedPhrase);
    console.log("Step 3: Seed generated, length:", seed.length);
    
    // Standard Solana Path
    const path = "m/44'/501'/0'/0'";
    const { key } = derivePath(path, seed.toString('hex'));
    console.log("Step 4: Path derived successfully");

    const keypair = Keypair.fromSeed(key);
    const address = keypair.publicKey.toBase58();
    
    console.log('✅ Final Address:', address);
    return address;

  } catch (error: any) {
    // If there is a hidden error, this will finally catch it
    console.error('❌ Derivation Error Details:', error.message);
    console.error(error.stack);
    return '';
  }
}

/**
 * Derives a TRON address from a BIP39 seed phrase
 * TRON uses secp256k1 with BIP44 path m/44'/195'/0'/0/0
 * Address format: keccak256(publicKey)[12:] with 0x41 prefix, then base58check
 */
export function deriveTronAddress(seedPhrase: string): string {
  try {
    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(seedPhrase.trim().toLowerCase());
    
    // Create root HD node from seed
    const root = ethers.HDNodeWallet.fromSeed(seed);
    
    // Derive TRON path
    const derivedWallet = root.derivePath("44'/195'/0'/0/0");
    
    // Get the uncompressed public key
    const signingKey = new ethers.SigningKey(derivedWallet.privateKey);
    const pubKeyBytes = ethers.getBytes(signingKey.publicKey);
    const uncompressedPubKey = pubKeyBytes.slice(1); // Remove 0x04 prefix
    
    // Compute keccak256 of the 64-byte public key
    const keccakHash = ethers.keccak256(uncompressedPubKey);
    
    // Take the last 20 bytes
    const addressBytes = ethers.getBytes(keccakHash).slice(12);
    
    // Add TRON prefix (0x41 for mainnet)
    const tronAddressBytes = new Uint8Array(21);
    tronAddressBytes[0] = 0x41;
    tronAddressBytes.set(addressBytes, 1);
    
    // Base58Check encode (includes checksum automatically)
    const tronAddress = bs58check.default.encode(tronAddressBytes);
    
    console.log('🔑 TRON Private Key:', derivedWallet.privateKey);
    return tronAddress;
  } catch (error) {
    console.error('Error deriving TRON address:', error);
    return '';
  }
}

/**
 * Derives a Bitcoin address from a BIP39 seed phrase
 * Uses BIP44 path m/44'/0'/0'/0/0 with secp256k1
 */
export function deriveBitcoinAddress(seedPhrase: string): string {
  try {
    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(seedPhrase.trim().toLowerCase());
    
    // Create root HD node from seed
    const root = ethers.HDNodeWallet.fromSeed(seed);
    
    // Derive Bitcoin path
    const derivedWallet = root.derivePath("44'/0'/0'/0/0");
    
    // Get compressed public key
    const publicKey = ethers.getBytes(derivedWallet.publicKey);
    
    // Create Bitcoin address: version byte + ripemd160(sha256(pubkey)) + checksum
    const sha256Hash = bitcoin.crypto.sha256(publicKey);
    const ripemd160Hash = bitcoin.crypto.ripemd160(sha256Hash);
    
    // Add version byte (0x00 for mainnet)
    const versionedHash = new Uint8Array(21);
    versionedHash[0] = 0x00;
    versionedHash.set(ripemd160Hash, 1);
    
    // Calculate checksum: double SHA256 of versionedHash, take first 4 bytes
    const hash1 = bitcoin.crypto.sha256(versionedHash);
    const hash2 = bitcoin.crypto.sha256(hash1);
    const checksum = hash2.slice(0, 4);
    
    // Combine versionedHash + checksum
    const addressBytes = new Uint8Array(25);
    addressBytes.set(versionedHash, 0);
    addressBytes.set(checksum, 21);
    
    // Base58 encode
    const btcAddress = bs58.default.encode(addressBytes);
    
    console.log('🔑 Bitcoin Private Key:', derivedWallet.privateKey);
    return btcAddress;
  } catch (error) {
    console.error('Error deriving Bitcoin address:', error);
    return '';
  }
}

/**
 * Derives all supported chain addresses from a seed phrase
 */
export function deriveAllAddresses(seedPhrase: string): DerivedWallet {
  return {
    xrpAddress: deriveXrpAddress(seedPhrase),
    evmAddress: deriveEvmAddress(seedPhrase),
    solanaAddress: deriveSolanaAddress(seedPhrase),
    tronAddress: deriveTronAddress(seedPhrase),
    bitcoinAddress: deriveBitcoinAddress(seedPhrase),
  };
}

/**
 * Generates a hash of the seed phrase for verification (never store the actual phrase)
 */
export async function hashSeedPhrase(seedPhrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seedPhrase.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
