// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";

contract PythRandomDice is IEntropyConsumer {

    IEntropyV2 public entropy;
    mapping(uint64 => address) public requestPlayer;

    event RandomRequested(uint64 sequenceNumber, address player);
    event DiceRolled(address player, uint256 result);

    constructor(address entropyAddress) {
        entropy = IEntropyV2(entropyAddress);
    }

    // Step 1: Request randomness
    function rollDice() external payable {

        uint256 fee = entropy.getFeeV2();
        require(msg.value >= fee, "Not enough fee");

        uint64 seq = entropy.requestV2{ value: fee }();

        requestPlayer[seq] = msg.sender;

        emit RandomRequested(seq, msg.sender);
    }

    // Step 2: Callback from Pyth
    function entropyCallback(
        uint64 sequenceNumber,
        address,
        bytes32 randomNumber
    ) internal override {

        address player = requestPlayer[sequenceNumber];
        uint256 dice = (uint256(randomNumber) % 6) + 1;
        emit DiceRolled(player, dice);
    }

    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }
}
