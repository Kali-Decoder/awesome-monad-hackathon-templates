// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
// import "hardhat/console.sol";
import {ISwitchboard} from "./switchboard/interfaces/ISwitchboard.sol";
import {SwitchboardTypes} from "./switchboard/libraries/SwitchboardTypes.sol";
contract SwitchBoardTest {
    ISwitchboard public immutable switchboard;
    mapping(bytes32 => PriceData) public prices;
    address private _owner;
    struct PriceData {
        int128 value;
        uint256 timestamp;
        uint64 slotNumber;
    }

    uint256 public maxPriceAge = 300;
    uint256 public maxDeviationBps = 1000;

    event PriceUpdated(
        bytes32 indexed feedId,
        int128 oldPrice,
        int128 newPrice,
        uint256 timestamp,
        uint64 slotNumber
    );

    error SwitchboardNotSet();
    error NotOwner();
    error PriceTooOld();
    error InsufficientFee(uint256 required, uint256 provided);
    error PriceDeviationTooHigh(uint256 deviation, uint256 maxDeviationBps);
    event PriceValidationFailed(bytes32 indexed feedId, string reason);

    constructor(address _switchboard) {
        if (address(0) == _switchboard) {
            revert SwitchboardNotSet();
        }
        switchboard = ISwitchboard(_switchboard);
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert NotOwner();
        }
        _;
    }

    function getPrice(
        bytes32 feedId
    ) public view returns (int128 value, uint256 timestamp, uint64 slotNumber) {
        PriceData memory price = prices[feedId];
        if (price.timestamp == 0) {
            revert PriceTooOld();
        }
        return (price.value, price.timestamp, price.slotNumber);
    }

    function isPriceFresh(bytes32 feedId) public view returns (bool) {
        PriceData memory price = prices[feedId];
        if (price.timestamp == 0) {
            return false;
        }
        return block.timestamp - price.timestamp <= maxPriceAge;
    }

    function getPriceAge(bytes32 feedId) external view returns (uint256) {
        PriceData memory priceData = prices[feedId];
        if (priceData.timestamp == 0) return type(uint256).max;
        return block.timestamp - priceData.timestamp;
    }

    function updatePrices(
        bytes[] memory updates,
        bytes32[] calldata feedIds
    ) external payable {
        uint256 fee = switchboard.getFee(updates);
        if (msg.value < fee) {
            revert InsufficientFee(fee, msg.value);
        }

        switchboard.updateFeeds{value: fee}(updates);

        for (uint256 i = 0; i < feedIds.length; i++) {
            bytes32 feedId = feedIds[i];

            // Get the latest verified update from Switchboard
            SwitchboardTypes.LegacyUpdate memory update = switchboard
                .latestUpdate(feedId);

            // Process the feed update (convert timestamp to uint64)
            _processFeedUpdate(
                feedId,
                update.result,
                uint64(update.timestamp),
                update.slotNumber
            );
        }

        if (msg.value > fee) {
            (bool success, ) = msg.sender.call{value: msg.value - fee}("");
            require(success, "Refund failed");
        }
    }

       function _calculateDeviation(
        int128 oldValue,
        int128 newValue
    ) internal pure returns (uint256 deviation) {
        if (oldValue == 0) return 0;

        uint128 absOld = oldValue < 0 ? uint128(-oldValue) : uint128(oldValue);
        uint128 absNew = newValue < 0 ? uint128(-newValue) : uint128(newValue);

        uint128 diff = absNew > absOld ? absNew - absOld : absOld - absNew;
        deviation = (uint256(diff) * 10000) / uint256(absOld);
    }


    function _processFeedUpdate(
        bytes32 feedId,
        int128 newValue,
        uint64 timestamp,
        uint64 slotNumber
    ) internal {
        PriceData memory oldPrice = prices[feedId];

        // Validate price deviation if we have a previous price
        if (oldPrice.timestamp != 0) {
            uint256 deviation = _calculateDeviation(oldPrice.value, newValue);
            if (deviation > maxDeviationBps) {
                emit PriceValidationFailed(feedId, "Deviation too high");
                revert PriceDeviationTooHigh(deviation, maxDeviationBps);
            }
        }

        // Store the new price
        prices[feedId] = PriceData({
            value: newValue,
            timestamp: timestamp,
            slotNumber: slotNumber
        });

        emit PriceUpdated(
            feedId,
            oldPrice.value,
            newValue,
            timestamp,
            slotNumber
        );
    }
}
