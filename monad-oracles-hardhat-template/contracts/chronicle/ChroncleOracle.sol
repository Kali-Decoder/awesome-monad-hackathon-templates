// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract OracleReader {
    IChronicle public CBBTC_USD = IChronicle(address(0xcB0ABe397952844C379A29343cDb17c914F33e40));
    IChronicle public ETH_USD = IChronicle(address(0xC32753217DcC7Bb2F449bD6f1bC384d1AC72a7B6));
    IChronicle public PUMPBTC_USD = IChronicle(address(0x9ee0DC1f7cF1a5c083914e3de197Fd1F484E0578));
    IChronicle public SOLVBTC_USD = IChronicle(address(0xC991e18E3f167F7457e06B780e92EA94a6b3c1bb));
    IChronicle public USDC_USD = IChronicle(address(0xd800ca44fFABecd159c7889c3bf64a217361AEc8));
    IChronicle public USDT_USD = IChronicle(address(0x09672B2a62Db1cd4cCE379bdde5BF41931177A72));
    IChronicle public WBTC_USD = IChronicle(address(0x8f01f70bE5DeEA5D4273D9a299A1A609BF1649c0));

    ISelfKisser public selfKisser = ISelfKisser(address(0x9a0de663c20127a229891eA0C7Db99c785BF91e3));
    
    constructor() {
        selfKisser.selfKiss(address(CBBTC_USD));
        selfKisser.selfKiss(address(ETH_USD));
        selfKisser.selfKiss(address(PUMPBTC_USD));
        selfKisser.selfKiss(address(SOLVBTC_USD));
        selfKisser.selfKiss(address(USDC_USD));
        selfKisser.selfKiss(address(USDT_USD));
        selfKisser.selfKiss(address(WBTC_USD));
    }

    function read(uint _choice) external view returns (uint256 val, uint256 age) {
        if (_choice == 1) {
            (val, age) = CBBTC_USD.readWithAge();
        } else if (_choice == 2) {
            (val, age) = ETH_USD.readWithAge();
        } else if (_choice == 3) {
            (val, age) = PUMPBTC_USD.readWithAge();
        } else if (_choice == 4) {
            (val, age) = SOLVBTC_USD.readWithAge();
        } else if (_choice == 5) {
            (val, age) = USDC_USD.readWithAge();
        } else if (_choice == 6) {
            (val, age) = USDT_USD.readWithAge();
        } else if (_choice == 7) {
            (val, age) = WBTC_USD.readWithAge();
        } else {
            revert("Invalid choice");
        }
    }
}
interface IChronicle {
    function read() external view returns (uint256 value);
    function readWithAge() external view returns (uint256 value, uint256 age);
}

interface ISelfKisser {
    function selfKiss(address oracle) external;
}
