# Conceptual Diff: Cabana vs Saven Zap Implementation

## Overview
This document outlines the key differences between Cabana's working zap implementation and our current Saven implementation, highlighting the architectural and implementation differences that may be causing our issues.

## 1. useZapArgs Function Signature

### Cabana (Working)
```typescript
export const useZapArgs = (
  chainId: NETWORK,
  inputToken: { address: Address; decimals: number; amount: bigint },
  outputToken: { address: Address; decimals: number }
) => {
  // Implementation
}
```

### Saven (Current)
```typescript
export const useZapArgs = (
  chainId: NETWORK,
  inputToken: { address: Address; decimals: number; amount: bigint },
  outputToken: { address: Address; decimals: number },
  vaultAddress?: Address  // ❌ EXTRA PARAMETER
) => {
  // Implementation
}
```

**Issue**: We added an extra `vaultAddress` parameter that Cabana doesn't have, which may be causing confusion in the logic flow.

## 2. useZapArgs Call Pattern

### Cabana (Working)
```typescript
// In useSendDepositZapTransaction
const {
  zapArgs,
  amountOut,
  isFetched: isFetchedZapArgs,
  isFetching: isFetchingZapArgs
} = useZapArgs(vault.chainId, inputToken, { 
  address: vault.address,      // ✅ VAULT ADDRESS as outputToken
  decimals: vault.decimals! 
})
```

### Saven (Current)
```typescript
// In useSendDepositZapTransaction
const {
  zapArgs,
  amountOut,
  isFetched: isFetchedZapArgs,
  isFetching: isFetchingZapArgs
} = useZapArgs(
  vault.chainId, 
  inputToken, 
  { 
    address: vaultTokenData?.address!,  // ❌ UNDERLYING TOKEN as outputToken
    decimals: vaultTokenData?.decimals ?? 18 
  },
  vault.address  // ❌ VAULT ADDRESS as 4th parameter
)
```

**Issue**: We're using the underlying token (cbETH) as outputToken and passing vault address separately, while Cabana uses vault address directly as outputToken.

## 3. Outputs Array Construction

### Cabana (Working)
```typescript
const zapOutputs: Mutable<ZapConfig['outputs']> = [
  {
    token: lower(inputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : inputToken.address,
    minOutputAmount: 0n
  },
  {
    token: lower(outputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : outputToken.address,
    minOutputAmount: amountOut.min
  }
]
```

### Saven (Current)
```typescript
// Only include the output token (cbETH) in outputs, not the input token (USDC)
const zapOutputs: Mutable<ZapConfig['outputs']> = [
  {
    token: outputToken.address && lower(outputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : outputToken.address || zeroAddress,
    minOutputAmount: amountOut?.min || 0n
  }
]
```

**Issue**: We removed the input token from outputs, but Cabana includes both input and output tokens.

## 4. Relay Data Construction

### Cabana (Working)
```typescript
const zapConfig: ZapConfig = {
  inputs: zapInputs,
  outputs: zapOutputs,
  relay: { target: zeroAddress, value: 0n, data: '0x0' },  // ✅ SIMPLE RELAY
  user: userAddress,
  recipient: userAddress
}
```

### Saven (Current)
```typescript
// For vault deposits, encode a proper ERC-4626 deposit(uint256, address) call
const relayData = vaultAddress
  ? encodeFunctionData({
      abi: [/* ERC-4626 ABI */],
      functionName: 'deposit',
      args: [0n, userAddress!] // amount placeholder, router patches it from route[0] output
    })
  : '0x0'

const zapConfig: ZapConfig = {
  inputs: zapInputs,
  outputs: zapOutputs,
  relay: { target: vaultAddress || outputToken.address!, value: 0n, data: relayData },  // ❌ COMPLEX RELAY
  user: userAddress,
  recipient: userAddress
}
```

**Issue**: We're encoding complex ERC-4626 deposit calls, while Cabana uses a simple relay with `zeroAddress` target.

## 5. Route Token Mapping

### Cabana (Working)
```typescript
// Route construction includes both input and output tokens
zapRoute.push({
  ...firstSwapTx.tx,
  tokens: [
    { token: swapInputToken?.address || zeroAddress, index: -1 },  // Input token
    { token: outputToken.address || zeroAddress, index: 0 }        // Output token
  ]
})
```

### Saven (Current)
```typescript
// Same pattern as Cabana
zapRoute.push({
  ...firstSwapTx.tx,
  tokens: [
    { token: swapInputToken?.address || zeroAddress, index: -1 },  // Input token
    { token: outputToken.address || zeroAddress, index: 0 }        // Output token
  ]
})
```

**Status**: ✅ This matches Cabana's approach.

## 6. addZapOutput Logic

### Cabana (Working)
```typescript
if (!!firstSwapTx || !!secondSwapTx) {
  addZapOutput({ token: swapInputToken?.address || zeroAddress, minOutputAmount: 0n })
}
```

### Saven (Current)
```typescript
// Don't add input tokens to outputs - we only want the final output token (cbETH)
// if (!!firstSwapTx || !!secondSwapTx) {
//   addZapOutput({ token: swapInputToken?.address || zeroAddress, minOutputAmount: 0n })
// }
```

**Issue**: We commented out the logic that adds input tokens to outputs, but Cabana includes them.

## 7. ParaSwap Integration

### Cabana (Working)
- Uses `ignoreChecks: 'true'` parameter
- Partner parameter set to 'cabana'
- Standard ParaSwap integration

### Saven (Current)
- Uses `ignoreChecks: 'true'` parameter (temporarily removed for debugging)
- Partner parameter set to 'saven'
- Enhanced error logging and debugging

**Status**: ✅ Similar approach, just different partner name.

## Key Architectural Differences

### 1. **Output Token Strategy**
- **Cabana**: Uses vault address as outputToken, creates simple relay
- **Saven**: Uses underlying token as outputToken, creates complex ERC-4626 relay

### 2. **Relay Complexity**
- **Cabana**: Simple relay with `zeroAddress` target and `'0x0'` data
- **Saven**: Complex relay with vault target and encoded deposit call

### 3. **Outputs Array**
- **Cabana**: Includes both input and output tokens
- **Saven**: Only includes output token

### 4. **Function Signature**
- **Cabana**: 3 parameters (chainId, inputToken, outputToken)
- **Saven**: 4 parameters (chainId, inputToken, outputToken, vaultAddress)

## Recommended Fixes

### 1. **Align with Cabana's Approach**
```typescript
// Change useZapArgs call to match Cabana
const {
  zapArgs,
  amountOut,
  isFetched: isFetchedZapArgs,
  isFetching: isFetchingZapArgs
} = useZapArgs(vault.chainId, inputToken, { 
  address: vault.address,      // Use vault address as outputToken
  decimals: vault.decimals! 
})
```

### 2. **Simplify Relay Data**
```typescript
// Use simple relay like Cabana
relay: { target: zeroAddress, value: 0n, data: '0x0' }
```

### 3. **Include Input Token in Outputs**
```typescript
// Add input token back to outputs
const zapOutputs: Mutable<ZapConfig['outputs']> = [
  {
    token: lower(inputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : inputToken.address,
    minOutputAmount: 0n
  },
  {
    token: lower(outputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : outputToken.address,
    minOutputAmount: amountOut.min
  }
]
```

### 4. **Remove Extra Parameter**
```typescript
// Remove vaultAddress parameter from useZapArgs
export const useZapArgs = (
  chainId: NETWORK,
  inputToken: { address: Address; decimals: number; amount: bigint },
  outputToken: { address: Address; decimals: number }
) => {
  // Implementation
}
```

## Additional Analysis: Implementation Details

### 8. Routing & Zap-Arg Construction Philosophy

#### Cabana (Working)
```typescript
// Vault address as outputToken - route ends with vault deposit
useZapArgs(vault.chainId, inputToken, { 
  address: vault.address,      // ✅ VAULT as outputToken
  decimals: vault.decimals! 
})
```

#### Saven (Current)
```typescript
// Underlying token as outputToken + separate vault parameter
useZapArgs(
  vault.chainId, 
  inputToken, 
  { 
    address: vaultTokenData?.address!,  // ❌ UNDERLYING as outputToken
    decimals: vaultTokenData?.decimals ?? 18 
  },
  vault.address  // ❌ VAULT as separate parameter
)
```

**Philosophy Difference**: 
- **Cabana**: "What to swap to" = "Where to deposit" (vault)
- **Saven**: Separates "what to swap to" (underlying) from "where to deposit" (vault)

### 9. Enabled Gating Logic

#### Cabana (Working)
```typescript
const enabled =
  !!inputToken?.address &&
  inputToken.decimals !== undefined &&
  !!inputToken.amount &&
  !!vault &&
  !!userAddress &&
  isAddress(userAddress) &&
  chain?.id === vault.chainId &&
  !!zapRouter &&
  !!zapTokenManager &&
  isFetchedAllowance &&
  (lower(inputToken.address) === DOLPHIN_ADDRESS || allowance >= inputToken.amount)  // ✅ ALLOWANCE CHECK
```

#### Saven (Current)
```typescript
const enabled = useMemo(() => {
  return (
    !!inputToken?.address &&
    inputToken.decimals !== undefined &&
    !!inputToken.amount &&
    !!vault &&
    !!userAddress &&
    isAddress(userAddress) &&
    chain?.id === vault.chainId &&
    !!zapRouter &&
    !!zapTokenManager &&
    isFetchedAllowance &&  // ❌ NO ALLOWANCE >= AMOUNT CHECK
    (lower(inputToken.address) === DOLPHIN_ADDRESS || allowance !== undefined)
  )
}, [/* dependencies */])
```

**Issue**: Saven omits the `allowance >= inputToken.amount` check, which can cause wallet rejections.

### 10. Simulation, Gas & Value Handling

#### Cabana (Working)
```typescript
// 1. Estimate gas with payable overload + value
const { data: gasEstimate } = useGasAmountEstimate({
  to: zapRouter,
  data: encodeFunctionData({
    abi: [zapRouterABI['15']],  // ✅ PAYABLE OVERLOAD
    functionName: 'executeOrder',
    args: zapArgs
  }),
  value: inputToken.address === DOLPHIN_ADDRESS ? inputToken.amount : 0n,  // ✅ VALUE
  account: userAddress
})

// 2. Simulate with same payable ABI + value
const { data: simulateData } = useSimulateContract({
  abi: [zapRouterABI['15']],  // ✅ PAYABLE OVERLOAD
  functionName: 'executeOrder',
  args: zapArgs,
  value: inputToken.address === DOLPHIN_ADDRESS ? inputToken.amount : 0n,  // ✅ VALUE
  account: userAddress
})

// 3. Send exactly what was simulated
const { writeContract } = useWriteContract({
  mutation: {
    onSuccess: (hash) => {
      // Handle success
    }
  }
})

// Use simulateData.request for consistent send
writeContract({
  address: zapRouter,
  abi: [zapRouterABI['15']],
  functionName: 'executeOrder',
  args: zapArgs,
  value: simulateData.request.value,  // ✅ USE SIMULATED VALUE
  gas: (simulateData.request.gas * 120n) / 100n  // ✅ PAD GAS
})
```

#### Saven (Current)
```typescript
// 1. Estimate with full ABI (no value shown)
const { data: gasEstimate } = useGasAmountEstimate({
  to: zapRouter,
  data: encodeFunctionData({
    abi: zapRouterABI,  // ❌ FULL ABI
    functionName: 'executeOrder',
    args: zapArgs
  }),
  // ❌ NO VALUE in estimate
  account: userAddress
})

// 2. Simulate with payable ABI (no value)
const { data: simulateData } = useSimulateContract({
  abi: [zapRouterABI['15']],  // ✅ PAYABLE OVERLOAD
  functionName: 'executeOrder',
  args: zapArgs,
  // ❌ NO VALUE in simulate
  account: userAddress
})

// 3. Write directly with hand-built request
const { writeContract } = useWriteContract()

writeContract({
  address: zapRouter,
  abi: zapRouterABI,  // ❌ FULL ABI
  functionName: 'executeOrder',
  args: zapArgs,
  value: inputToken.address === DOLPHIN_ADDRESS ? inputToken.amount : 0n,  // ❌ VALUE ONLY AT WRITE
  gas: gasEstimate
})
```

**Issues**: 
- No value in estimate/simulate
- Full ABI instead of payable overload
- No "simulate → send simulated request" pattern

### 11. ABI Overload Selection

#### Cabana (Working)
```typescript
// Consistently uses payable overload
abi: [zapRouterABI['15']]  // ✅ PAYABLE executeOrder(Order, Step[])
```

#### Saven (Current)
```typescript
// Uses full ABI, relies on viem to pick overload
abi: zapRouterABI  // ❌ FULL ABI - AMBIGUOUS OVERLOAD SELECTION
```

**Issue**: Full ABI introduces ambiguity in overload selection.

### 12. Lifecycle & Callbacks

#### Cabana (Working)
```typescript
// Clean effect-based callbacks
useEffect(() => {
  if (txHash) {
    options?.onSend?.(txHash)
  }
}, [txHash, options])

useEffect(() => {
  if (txReceipt) {
    options?.onSuccess?.(txReceipt)
  }
}, [txReceipt, options])

useEffect(() => {
  if (isError) {
    options?.onError?.()
  }
}, [isError, options])

// Clean state exposure
return {
  isWaiting,
  isConfirming,
  isSuccess,
  isError,
  txHash,
  txReceipt,
  sendDepositZapTransaction,
  amountOut,
  isFetchedZapArgs,
  isFetchingZapArgs
}
```

#### Saven (Current)
```typescript
// Extensive debug logging but unclear callback handling
console.log('🔍 SIMULATION QUERY DEBUG:', { /* extensive logging */ })
console.log('🔍 SENDER VS ORDER.USER DEBUG:', { /* more logging */ })
// ... many more debug logs

// Callback handling not clearly visible in provided snippets
```

**Issue**: Saven focuses on debugging over clean state management.

### 13. Diagnostics & Developer Ergonomics

#### Cabana (Working)
- Lean pipeline with minimal logging
- User-friendly messages ("Finding zap route")
- Clean state exposure
- Focus on functionality over debugging

#### Saven (Current)
- Extensive debug logging
- Chain detection fallbacks
- Allowance snapshots
- Order vs sender checks
- Route step enumerations
- Error signature hints
- Full ABI index inspection

**Trade-off**: Saven has better debugging but more complex code.

## Consolidated Recommendations

### 1. **Align with Cabana's Core Pattern**
```typescript
// Use vault as outputToken (not underlying)
useZapArgs(vault.chainId, inputToken, { 
  address: vault.address, 
  decimals: vault.decimals! 
})
```

### 2. **Fix Enabled Logic**
```typescript
const enabled = useMemo(() => {
  return (
    // ... existing checks ...
    isFetchedAllowance &&
    (lower(inputToken.address) === DOLPHIN_ADDRESS || allowance >= inputToken.amount)  // ✅ ADD THIS
  )
}, [/* dependencies */])
```

### 3. **Implement Consistent Simulation Pipeline**
```typescript
// Estimate with payable ABI + value
const { data: gasEstimate } = useGasAmountEstimate({
  abi: [zapRouterABI['15']],  // Payable overload
  value: inputToken.address === DOLPHIN_ADDRESS ? inputToken.amount : 0n,
  // ...
})

// Simulate with same payable ABI + value
const { data: simulateData } = useSimulateContract({
  abi: [zapRouterABI['15']],  // Payable overload
  value: inputToken.address === DOLPHIN_ADDRESS ? inputToken.amount : 0n,
  // ...
})

// Send exactly what was simulated
writeContract({
  abi: [zapRouterABI['15']],  // Payable overload
  value: simulateData.request.value,  // Use simulated value
  gas: (simulateData.request.gas * 120n) / 100n,  // Pad gas
  // ...
})
```

### 4. **Simplify Relay Data**
```typescript
// Use simple relay like Cabana
relay: { target: zeroAddress, value: 0n, data: '0x0' }
```

### 5. **Include Both Tokens in Outputs**
```typescript
const zapOutputs: Mutable<ZapConfig['outputs']> = [
  {
    token: lower(inputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : inputToken.address,
    minOutputAmount: 0n
  },
  {
    token: lower(outputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : outputToken.address,
    minOutputAmount: amountOut.min
  }
]
```

## 14. Simulation Failure Analysis

### Current Issue: Silent Simulation Failure
From the logs, we can see:
```
useSimulateContract result: {data: false, dataRequest: undefined, simulateError: null, isSimulateError: false, enabled: true, ...}
```

The simulation is failing silently - no error is thrown, but `data` is `false`. This suggests the simulation is timing out or encountering an issue that doesn't throw an error.

### Key Differences Causing Simulation Failure

#### 1. **Output Token Strategy (CORRECTED)**
**Cabana (Working)**:
```typescript
// Uses vault address as outputToken parameter
useZapArgs(vault.chainId, inputToken, { 
  address: vault.address,      // ✅ VAULT ADDRESS as outputToken parameter
  decimals: vault.decimals! 
})
// useZapTokenInfo automatically resolves vault.address → underlying token (cbETH)
// ParaSwap swaps to underlying token (cbETH)
// Deposit step converts underlying → vault shares
```

**Saven (Current)**:
```typescript
// Uses underlying token as outputToken parameter
useZapArgs(vault.chainId, inputToken, { 
  address: vaultTokenData?.address!,  // ❌ UNDERLYING TOKEN (cbETH) as outputToken parameter
  decimals: vaultTokenData?.decimals ?? 18 
}, vault.address)  // ❌ VAULT as separate parameter
```

**CORRECTED Understanding**: Both approaches swap to the underlying token (cbETH) via ParaSwap. The difference is:
- **Cabana**: Uses vault address as outputToken parameter, `useZapTokenInfo` resolves to underlying
- **Saven**: Uses underlying token directly as outputToken parameter

**Problem**: The architectural approach is actually the same, but our implementation details differ.

#### 2. **Deposit Handling Strategy (CORRECTED)**
**Cabana (Working)**:
```typescript
// Cabana handles vault deposits through route steps, not relay
if (!!outputTokenInfo.vaultToken && !!outputTokenInfo.exchangeRate) {
  zapRoute.push({
    ...getDepositTx(outputToken.address, zapRouterAddress),
    tokens: [{ token: outputTokenInfo.vaultToken.address, index: 4 }]
  })
}

// Relay is simple and not used for deposits
relay: { 
  target: zeroAddress,  // ✅ SIMPLE TARGET - NOT USED FOR DEPOSITS
  value: 0n, 
  data: '0x0'          // ✅ SIMPLE DATA
}
```

**Saven (Current)**:
```typescript
// Saven handles vault deposits through relay, not route steps
relay: { 
  target: vaultAddress || outputToken.address!,  // ❌ COMPLEX TARGET
  value: 0n, 
  data: relayData  // ❌ COMPLEX ERC-4626 ENCODED DATA
}
```

**CORRECTED Understanding**: 
- **Cabana**: Uses route steps for vault deposits, relay is just `zeroAddress` (not used for deposits)
- **Saven**: Uses relay for vault deposits, which is more complex

**Problem**: We're using the relay for deposits when Cabana uses route steps for deposits.

#### 3. **Outputs Array Mismatch**
**Cabana (Working)**:
```typescript
const zapOutputs: Mutable<ZapConfig['outputs']> = [
  {
    token: lower(inputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : inputToken.address,
    minOutputAmount: 0n
  },
  {
    token: lower(outputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : outputToken.address,
    minOutputAmount: amountOut.min
  }
]
```

**Saven (Current)**:
```typescript
// Only include the output token (cbETH) in outputs, not the input token (USDC)
const zapOutputs: Mutable<ZapConfig['outputs']> = [
  {
    token: outputToken.address && lower(outputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : outputToken.address || zeroAddress,
    minOutputAmount: amountOut?.min || 0n
  }
]
```

**Problem**: The zap router expects both input and output tokens in the outputs array, but we only provide the output token.

#### 4. **Route Token Mapping Issue (CORRECTED)**
**Current Route Structure**:
```typescript
{
  "target": "0x6a000f20005980200259b80c5102003040001068",  // ParaSwap
  "value": "0",
  "data": "0xe3ead59e...",  // ParaSwap swap data
  "tokens": [
    {
      "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",  // USDC
      "index": -1
    },
    {
      "token": "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",  // cbETH
      "index": 0
    }
  ]
}
```

**CORRECTED Understanding**: The route correctly produces cbETH (index 0), which is the underlying token. This matches Cabana's approach where ParaSwap swaps to the underlying token, and then the deposit step converts it to vault shares.

**Problem**: The route structure is actually correct. The issue is likely in the relay data complexity or outputs array structure.

### 5. **Simulation Pipeline Inconsistency**

**Cabana (Working)**:
```typescript
// Consistent use of payable ABI with value
const { data: simulateData } = useSimulateContract({
  abi: [zapRouterABI['15']],  // ✅ PAYABLE OVERLOAD
  functionName: 'executeOrder',
  args: zapArgs,
  value: inputToken.address === DOLPHIN_ADDRESS ? inputToken.amount : 0n,  // ✅ VALUE
  account: userAddress
})
```

**Saven (Current)**:
```typescript
// Missing value parameter in simulation
const { data, error: simulateError, isError: isSimulateError } = useSimulateContract({
  address: zapRouter,
  abi: [zapRouterABI['15']],  // ✅ PAYABLE OVERLOAD
  functionName: 'executeOrder',
  args: zapArgs,
  value: !!inputToken?.address && lower(inputToken.address) === DOLPHIN_ADDRESS
    ? inputToken.amount
    : 0n,  // ✅ VALUE (but simulation still fails)
  gas: !!gasEstimate ? calculatePercentageOfBigInt(gasEstimate, 1.2) : undefined,
  query: {
    enabled: enabled && !!zapArgs
  }
})
```

**Problem**: Even with the value parameter, the simulation fails because the zap router can't execute the complex relay with ERC-4626 deposit data.

## Root Cause Analysis (CORRECTED)

The simulation is failing because:

1. **Complex Relay Data**: The ERC-4626 deposit call data is too complex for the zap router to handle
2. **Outputs Array Mismatch**: We only include the output token, but Cabana includes both input and output tokens
3. **Relay Target Complexity**: We use vault address as relay target, but Cabana uses `zeroAddress`
4. **Implementation Details**: Our approach is architecturally similar to Cabana, but the implementation details differ

**CORRECTED Understanding**: Both Cabana and Saven do the same two-step process:
- Step 1: ParaSwap swaps to underlying token (cbETH)
- Step 2: Deposit step converts underlying → vault shares

The difference is in the implementation details, not the overall architecture.

## Immediate Fix Strategy

### Option 1: Align with Cabana's Implementation Details (Recommended)
```typescript
// Use vault as outputToken parameter like Cabana
useZapArgs(vault.chainId, inputToken, { 
  address: vault.address,      // ✅ VAULT as outputToken parameter
  decimals: vault.decimals! 
})

// Use simple relay like Cabana
relay: { target: zeroAddress, value: 0n, data: '0x0' }

// Include both tokens in outputs like Cabana
const zapOutputs: Mutable<ZapConfig['outputs']> = [
  {
    token: lower(inputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : inputToken.address,
    minOutputAmount: 0n
  },
  {
    token: lower(outputToken.address) === DOLPHIN_ADDRESS ? zeroAddress : outputToken.address,
    minOutputAmount: amountOut.min
  }
]
```

### Option 2: Fix Current Approach
If we want to keep the current implementation, we need to:
1. Simplify the relay data to just `'0x0'` (remove ERC-4626 encoding)
2. Use `zeroAddress` as relay target instead of vault address
3. Include both input and output tokens in outputs array
4. Remove the extra vaultAddress parameter from useZapArgs

## Conclusion (CORRECTED)

The main issues are:

1. **Complex relay data** (ERC-4626 encoding vs simple relay)
2. **Missing allowance check** in enabled logic
3. **Inconsistent simulation pipeline** (no value in estimate/simulate, full ABI)
4. **Outputs array mismatch** (only output token vs both input and output tokens)
5. **Relay target complexity** (vault address vs zeroAddress)
6. **Implementation details** (extra vaultAddress parameter, different useZapArgs signature)

**CORRECTED Root Cause**: Our architectural approach is actually the same as Cabana's (swap to underlying + deposit step), but our implementation details differ significantly. The `0x7a2ee929` error and silent simulation failure are caused by these implementation differences, not architectural mismatches.

**Solution**: Align with Cabana's implementation details while keeping the same architectural approach.
