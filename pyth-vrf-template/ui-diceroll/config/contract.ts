export const ABI= [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "entropyAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "name": "DiceRolled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "sequenceNumber",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "RandomRequested",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "sequence",
          "type": "uint64"
        },
        {
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "randomNumber",
          "type": "bytes32"
        }
      ],
      "name": "_entropyCallback",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "entropy",
      "outputs": [
        {
          "internalType": "contract IEntropyV2",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "name": "requestPlayer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "rollDice",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ];

  export const ContractAddressDice = "0xC54f3327F65fF1998D9775621386d09cf7a094Ad";
  export const MonadEntropyAddress = "0x825c0390f379c631f3cf11a82a37d20bddf93c07";