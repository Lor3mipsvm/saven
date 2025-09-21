export const permitDepositABI = [
  {
    inputs: [
      { internalType: 'address', name: 'vault', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' }
    ],
    name: 'permitDeposit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const
