# Saven Developer Documentation

## Debugging Context

This document contains comprehensive debugging information and implementation details for the Saven project, particularly focused on zap functionality and wallet integration.

### Key Files

- **`.cursor/debugging_context.md`** - Comprehensive debugging context with Cabana implementation details
- **`.cursor/debugging_recs.md`** - Debugging recommendations and best practices
- **`.cursor/cabana_vs_saven_diff.md`** - Detailed comparison between Cabana and Saven implementations

### Zap Implementation

The zap functionality allows users to deposit tokens into vaults by swapping through intermediate tokens. Key components:

- **`useSwapTx`** - Handles ParaSwap API integration for token swaps
- **`useZapArgs`** - Constructs zap transaction arguments
- **`useSendDepositZapTransaction`** - Manages the complete zap transaction flow
- **`DepositZapTxButton`** - UI component for zap transactions

### Wallet Integration

- **ConnectKit** - Primary wallet connection library
- **Wagmi** - Ethereum React hooks
- **WalletConnect** - Disabled to prevent dual modal issues

### Common Issues

1. **ParaSwap API Errors** - Usually related to partner parameter or malformed addresses
2. **Simulation Failures** - Often due to incorrect ABI usage or malformed transaction data
3. **UI State Management** - Approval flow and button state progression

### Debugging Tools

- Comprehensive console logging throughout the zap flow
- Error signature analysis for contract reverts
- Transaction parameter validation
- Route construction debugging

For detailed implementation examples and debugging strategies, refer to the files listed above.
