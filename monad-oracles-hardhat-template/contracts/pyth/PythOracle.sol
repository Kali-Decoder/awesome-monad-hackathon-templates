// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
contract Oracle_Pyth {
    IPyth public pyth;
    constructor(address _pyth) {
        pyth = IPyth(_pyth);
    }
    function read(bytes32 _priceFeedId) public view returns (uint) {
        require(_priceFeedId != bytes32(0), "Price feed not found");
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(_priceFeedId, 60);
        uint price18Decimals = (uint(uint64(price.price)) * (10 ** 18)) / 
            (10 ** uint8(uint32(-1 * price.expo)));
        return price18Decimals;
    }
}