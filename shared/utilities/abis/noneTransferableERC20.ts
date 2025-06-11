export const NoneTransferableERC20Abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes'
      },
      {
        indexed: false,
        internalType: 'enum Enum.Operation',
        name: 'operation',
        type: 'uint8'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'safeTxGas',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'baseGas',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'gasPrice',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'gasToken',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address payable',
        name: 'refundReceiver',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'signatures',
        type: 'bytes'
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'additionalInfo',
        type: 'bytes'
      }
    ],
    name: 'SafeMultiSigTransaction',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'src', type: 'address' },
      { indexed: true, internalType: 'address', name: 'dst', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'wad', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'dst', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'src', type: 'address' },
      { internalType: 'address', name: 'dst', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const
