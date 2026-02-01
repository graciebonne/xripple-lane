
# Fix Buffer Error and Enhance Swap Page Chain Detection

## Overview
This plan fixes the critical "Buffer is not defined" error and enhances the swap page to properly detect all 21+ supported chains and their tokens.

---

## 1. Fix "Buffer is not defined" Error

### Problem
The `bip39` library internally uses Node.js `Buffer` which doesn't exist in browsers. When `mnemonicToSeedSync()` is called, it crashes.

### Solution
Add a Buffer polyfill for the browser environment. There are two approaches:

**Approach A: Add buffer polyfill via Vite config**
- Install the `buffer` npm package
- Configure Vite to polyfill `Buffer` globally

**Approach B: Use Web Crypto API instead of bip39**
- Replace the Node.js-dependent code with browser-native Web Crypto API
- Use `Uint8Array` instead of `Buffer`

We will use **Approach A** because it's simpler and bip39 is already installed.

### Files to Modify
| File | Changes |
|------|---------|
| `vite.config.ts` | Add buffer polyfill configuration |
| `src/lib/xrpDerivation.ts` | Add Buffer polyfill import at the top |

### Code Changes

**vite.config.ts:**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => ({
  server: { ... },
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: { Buffer: true },
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  ...
}));
```

**src/lib/xrpDerivation.ts:**
```typescript
// Add at the very top of the file
import { Buffer } from 'buffer';
// Make Buffer available globally for bip39
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}
```

---

## 2. Enhance Swap Page Chain Selection

### Problem
The swap page only defines 6 chains locally, but we have 21+ chains configured in `src/lib/reown.ts`.

### Solution
- Import chains from `reown.ts` instead of hardcoding
- Display all 21+ EVM chains plus Solana, TRON, and Bitcoin
- Group chains by category for better UX
- Auto-detect which chains have balances

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Swap.tsx` | Import chains from reown.ts, add all 21+ chains, improve dropdown UI |

### Updated Chain List
The swap page will now show:
```text
Major Chains:
- Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Avalanche

Layer 2s:
- Base, zkSync Era, Linea, Scroll, Blast, Mantle, Metis

Alternative L1s:
- Fantom, Cronos, Gnosis, Celo, Moonbeam, Aurora, opBNB, Polygon zkEVM

Non-EVM:
- Solana, TRON, Bitcoin
```

---

## 3. Improve Crypto Detection

### Problem
The `useWalletBalances` hook only checks a few chains. It should check all 21+ chains.

### Solution
Update the hook to iterate through all chains in `SUPPORTED_CHAINS` when fetching balances.

### Files to Modify
| File | Changes |
|------|---------|
| `src/hooks/useWalletBalances.ts` | Import all chains from reown.ts, fetch balances for all chains |

---

## 4. Install Required Package

### New Dependency
```bash
npm install vite-plugin-node-polyfills buffer
```

This adds the Buffer polyfill needed for bip39 to work in the browser.

---

## Implementation Steps

1. **Install polyfill packages** - Add `vite-plugin-node-polyfills` and `buffer`
2. **Update vite.config.ts** - Configure the polyfill
3. **Update xrpDerivation.ts** - Add Buffer global setup
4. **Update Swap.tsx** - Import and use all chains from reown.ts
5. **Update useWalletBalances.ts** - Fetch balances from all chains

---

## Technical Details

### Buffer Polyfill Implementation

The polyfill works by:
1. Installing the `buffer` package which is a pure JavaScript implementation of Node's Buffer
2. Using `vite-plugin-node-polyfills` to inject it as a global
3. Explicitly setting `window.Buffer` to ensure availability before bip39 runs

### Chain Organization in Swap Page

The updated chains array will be:
```typescript
// Import from reown.ts
import { SUPPORTED_CHAINS, CHAIN_TOKENS, ChainId } from '@/lib/reown';

// Build chains array from SUPPORTED_CHAINS
const evmChains = Object.entries(SUPPORTED_CHAINS).map(([id, config]) => ({
  id,
  name: config.name,
  icon: getChainIcon(id),
  color: getChainColor(id),
}));

// Add non-EVM chains
const allChains = [
  ...evmChains,
  { id: 'solana', name: 'Solana', icon: '◎', color: '...' },
  { id: 'tron', name: 'TRON', icon: '⚡', color: '...' },
  { id: 'bitcoin', name: 'Bitcoin', icon: '₿', color: '...' },
];
```

---

## Expected Outcome

After implementation:
- Seed phrase import will work without "Buffer is not defined" error
- XRP address will be derived correctly from any valid 12/24-word phrase
- Swap page will show all 21+ EVM chains plus Solana, TRON, Bitcoin
- Users can select any chain and see available tokens
- Balance detection will work across all supported chains
