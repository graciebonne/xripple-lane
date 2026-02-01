
# Comprehensive Multi-Wallet & Swap System Overhaul

## Overview
This plan addresses a major system overhaul covering KYC persistence, camera selfie capture, multi-wallet support with XRP address derivation, real multi-chain balance detection, and a complete swap system redesign.

---

## 1. KYC Progress Persistence

### Problem
Users lose their progress if they leave the KYC flow mid-way. The step number and entered data are not saved.

### Solution
Store KYC progress in the database as users complete each step:
- Save partial data after each step (personal info, address, document type)
- On page load, restore the user's last step and pre-fill forms with saved data
- Add a `kyc_step` column to track current step

### Database Changes
```sql
ALTER TABLE kyc_verifications ADD COLUMN kyc_step INTEGER DEFAULT 1;
```

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/KYCVerification.tsx` | Load saved step and data on mount, save step after each completion |
| `src/hooks/useKYC.ts` | Add `updateKYCStep()` function, include new fields in KYCVerification interface |

---

## 2. Camera Selfie Capture Fix

### Problem
The camera view shows blank when trying to take a selfie. The camera may not be initializing correctly.

### Solution
- Add proper error handling and loading states
- Ensure video element is visible before starting camera
- Add `playsInline` and `autoPlay` attributes
- Use `async/await` properly for camera initialization
- Add a retry mechanism if camera fails to start
- Force camera-only mode for selfie (no file upload option)

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/kyc/DocumentUpload.tsx` | Fix camera initialization, add loading state, improve error handling, make camera mandatory for selfie |

---

## 3. Enhanced Multi-Wallet Import System

### Current State
- Only 6 wallets supported (MetaMask, Trust, Coinbase, Phantom, Xaman, Ledger)
- Mock XRP address generation
- Single wallet stored

### New System Architecture

#### 3.1 Wallet Types to Support
```text
EVM Wallets:
- MetaMask, Trust Wallet, Coinbase, SafePal, 1inch, Zerion, Rainbow

XRP Native:
- Xaman (XUMM), Ledger, Keystone

Multi-chain:
- Phantom (Solana), TronLink (Tron), Exodus, Atomic Wallet
```

#### 3.2 XRP Address Derivation
When a user imports a seed phrase:
1. Derive XRP address from the seed using BIP44 path `m/44'/144'/0'/0/0`
2. Auto-populate the XRP address field
3. Fetch and display XRP balance

#### 3.3 Multi-Wallet Storage
Each imported wallet will be stored in the `wallet_connections` table with:
- `wallet_type` - The wallet brand imported
- `wallet_address` - The derived XRP address
- `chain_id` - Set to 'xrp' or the source chain
- Store seed phrase hash (never plain text) for verification

#### 3.4 Wallet Store Updates
Update `walletStore.ts` to support multiple imported wallets:
```typescript
interface ImportedWallet {
  id: string;
  name: string;          // Wallet brand (e.g., "MetaMask")
  xrpAddress: string;    // Derived XRP address
  xrpBalance: string;    // Current XRP balance
  evmAddress?: string;   // If EVM-compatible
  solanaAddress?: string;
  tronAddress?: string;
}

importedWallets: ImportedWallet[];
```

### Files to Create/Modify
| File | Changes |
|------|---------|
| `src/lib/xrpDerivation.ts` | New file: XRP address derivation from seed phrase |
| `src/stores/walletStore.ts` | Support multiple imported wallets |
| `src/pages/Wallets.tsx` | Show multiple wallets, per-wallet balances |
| `src/hooks/useXrpBalance.ts` | New hook: Fetch XRP balance for an address |

---

## 4. Multi-Chain Balance Detection (21+ EVM Chains)

### Supported Chains
```text
EVM Chains (21+):
1. Ethereum          8. Fantom           15. zkSync Era
2. Polygon          9. Cronos           16. Linea
3. BNB Chain       10. Gnosis           17. Mantle
4. Arbitrum        11. Celo             18. Scroll
5. Optimism        12. Moonbeam         19. opBNB
6. Avalanche       13. Base             20. Blast
7. zkSync          14. Polygon zkEVM    21. Metis

Non-EVM:
- Solana
- TRON
- XRP Ledger
```

### Balance Fetching Strategy
For each imported wallet:
1. Derive addresses for each chain type (EVM uses same address)
2. Fetch native token balances on all chains
3. Fetch popular token balances (USDT, USDC, etc.)
4. Cache results to avoid rate limiting
5. Use batch RPC calls where possible

### Files to Create/Modify
| File | Changes |
|------|---------|
| `src/lib/reown.ts` | Expand SUPPORTED_CHAINS to 21+ EVM chains |
| `src/hooks/useWalletBalances.ts` | Support multiple wallets, cache balances |
| `src/hooks/useXrpBalance.ts` | Fetch XRP balance from XRPL |

---

## 5. Remove Buy XRP Page & Enhance Swap Page

### Changes
1. Remove `/dashboard/buy` route
2. Update navigation to remove "Buy XRP" link
3. Make Swap the primary conversion method

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Remove BuyXRP route |
| `src/components/dashboard/DashboardLayout.tsx` | Remove Buy XRP from nav |
| `src/pages/Dashboard.tsx` | Update Quick Actions to only show Swap |

---

## 6. Redesigned Swap Page

### New Swap Flow
```text
1. User selects SOURCE WALLET (from imported wallets list)
2. User selects SOURCE CHAIN (from chains that wallet has balances on)
3. User selects SOURCE TOKEN (from tokens available on that chain)
4. User enters amount
5. System calculates XRP output with 35% bonus
6. XRP is sent to the wallet's derived XRP address
```

### UI Components
```text
Swap Page Layout:
+------------------------------------------+
| Select Wallet                            |
| [MetaMask ▼] [Phantom] [Trust Wallet]    |
+------------------------------------------+
| Select Chain                             |
| [Ethereum ▼] $4,523.00 available         |
+------------------------------------------+
| Select Token                             |
| [ETH] 2.5 ETH ($4,500)                   |
| [USDC] 150 USDC ($150)                   |
+------------------------------------------+
| You Pay                                  |
| [1.5        ] ETH                        |
| ≈ $2,700.00                              |
+------------------------------------------+
|        ↓ 35% Bonus Applied ↓             |
+------------------------------------------+
| You Receive                              |
| 7,000.00 XRP                             |
| To: rXXXX...XXXX                         |
+------------------------------------------+
| [SWAP NOW]                               |
+------------------------------------------+
```

### Swap Logic (Edge Function)
Create an edge function `execute-swap` that:
1. Validates the swap request
2. Logs the transaction in the database
3. Returns transaction confirmation
4. (In production, this would integrate with DEX aggregators)

### Files to Create/Modify
| File | Changes |
|------|---------|
| `src/pages/Swap.tsx` | Complete redesign with wallet/chain/token selection |
| `supabase/functions/execute-swap/index.ts` | New edge function for swap execution |

---

## 7. Wallets Page - Asset Display

### New Layout
```text
Wallets Page:
+------------------------------------------+
| My Wallets                    [+ Import] |
+------------------------------------------+
| ┌─────────────────────────────────────┐  |
| │ MetaMask                            │  |
| │ XRP: rAbc...XYZ     Balance: 500 XRP│  |
| │                                     │  |
| │ Assets on this wallet:              │  |
| │ ├─ Ethereum                         │  |
| │ │  ├─ 2.5 ETH ($4,500)             │  |
| │ │  └─ 1000 USDC ($1,000)           │  |
| │ ├─ Polygon                          │  |
| │ │  └─ 500 MATIC ($250)             │  |
| │ └─ Arbitrum                         │  |
| │    └─ 0.1 ETH ($180)               │  |
| │                                     │  |
| │ Total Value: $5,930.00              │  |
| │ [Remove Wallet]                     │  |
| └─────────────────────────────────────┘  |
|                                          |
| ┌─────────────────────────────────────┐  |
| │ Phantom                             │  |
| │ XRP: rDef...789     Balance: 200 XRP│  |
| │                                     │  |
| │ Assets:                             │  |
| │ └─ Solana                           │  |
| │    └─ 10 SOL ($1,500)              │  |
| └─────────────────────────────────────┘  |
+------------------------------------------+
```

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Wallets.tsx` | Complete redesign to show multiple wallets with grouped assets |

---

## 8. Dashboard - Portfolio Overview

### Updates
- Show total portfolio value across all imported wallets
- Show aggregated XRP balance
- Show total assets by chain
- Real-time value updates

### Dashboard Stats
```text
+------------------+------------------+
| Total XRP        | Portfolio Value  |
| 700.00 XRP       | $7,430.00        |
+------------------+------------------+
| Wallets          | Pending Swaps    |
| 2 Connected      | 0                |
+------------------+------------------+
```

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Connect to wallet store, show real totals |

---

## Technical Implementation Details

### New Files to Create
| File | Purpose |
|------|---------|
| `src/lib/xrpDerivation.ts` | XRP address derivation using BIP44 |
| `src/hooks/useXrpBalance.ts` | Fetch XRP balance from XRPL API |
| `src/hooks/useMultiWalletBalances.ts` | Fetch balances for all imported wallets |
| `supabase/functions/execute-swap/index.ts` | Backend swap execution |

### Files to Modify
| File | Key Changes |
|------|-------------|
| `src/stores/walletStore.ts` | Support array of imported wallets |
| `src/lib/reown.ts` | Expand to 21+ EVM chains |
| `src/pages/Wallets.tsx` | Multi-wallet display with grouped assets |
| `src/pages/Swap.tsx` | Wallet/chain/token selector UI |
| `src/pages/Dashboard.tsx` | Real portfolio values |
| `src/pages/KYCVerification.tsx` | Save/restore progress |
| `src/components/kyc/DocumentUpload.tsx` | Fix camera, make mandatory for selfie |
| `src/App.tsx` | Remove Buy XRP route |
| `src/components/dashboard/DashboardLayout.tsx` | Update navigation |

### Database Changes
```sql
-- Add kyc_step to track progress
ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS kyc_step INTEGER DEFAULT 1;

-- Add wallet_name to wallet_connections for display
ALTER TABLE wallet_connections ADD COLUMN IF NOT EXISTS wallet_name TEXT;

-- Add seed_hash for wallet verification (optional)
ALTER TABLE wallet_connections ADD COLUMN IF NOT EXISTS seed_hash TEXT;
```

---

## Implementation Order

1. **Database Migration** - Add kyc_step column
2. **KYC Progress Saving** - Implement step persistence
3. **Camera Fix** - Fix selfie capture issues
4. **XRP Derivation Library** - Create derivation utilities
5. **Wallet Store Update** - Support multiple wallets
6. **XRP Balance Hook** - Fetch XRP balances
7. **Wallets Page Redesign** - Multi-wallet display
8. **Chain Expansion** - Add 21+ EVM chains
9. **Multi-Chain Balances** - Fetch all balances per wallet
10. **Swap Page Redesign** - Wallet/chain/token selection
11. **Dashboard Update** - Real portfolio values
12. **Remove Buy XRP** - Clean up routes and navigation
13. **Testing** - End-to-end flow verification

---

## Security Considerations

1. **Seed Phrase Handling**: Never store seed phrases in plain text. Only use them client-side for address derivation, then discard.
2. **XRP Address Derivation**: Use established cryptographic libraries (e.g., `bip39`, `ripple-keypairs`) for address generation.
3. **Balance Fetching**: Use rate limiting and caching to prevent API abuse.
4. **Swap Execution**: All swaps should be logged and traceable in the database.

---

## Expected Outcome

After implementation:
- Users can save and resume KYC at any step
- Selfie capture uses live camera feed (no file upload option)
- Users can import multiple wallets from various providers
- Each wallet derives a unique XRP address automatically
- All assets across 21+ EVM chains, Solana, TRON are detected
- Wallets page shows per-wallet asset breakdown
- Swap page lets users select wallet -> chain -> token to swap
- Dashboard shows real portfolio totals
- Buy XRP page is removed (swap only)
