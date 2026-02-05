pragma solidity ^0.8.17;

import {ISwitchboard} from "@switchboard-xyz/on-demand-solidity/ISwitchboard.sol";
import {Structs} from "@switchboard-xyz/on-demand-solidity/structs/Structs.sol";

contract SwitchboardOracleReader {
  ISwitchboard switchboard;

  // Every Switchboard feed has a unique aggregator id
  bytes32 aggregatorId;

  // Store the latest value
  int128 public result;

  // If the transaction fee is not paid, the update will fail.
  error InsufficientFee(uint256 expected, uint256 received);

  // If the feed result is invalid, this error will be emitted.
  error InvalidResult(int128 result);

  // If the Switchboard update succeeds, this event will be emitted with the latest price.
  event FeedData(int128 price);

  /**
   * @param _switchboard The address of the Switchboard contract
   * @param _aggregatorId The feed ID for the feed you want to query
   */
  constructor(address _switchboard, bytes32 _aggregatorId) {
    switchboard = ISwitchboard(_switchboard);
    aggregatorId = _aggregatorId;
  }
 
  function getFeedData(bytes[] calldata updates) public payable {

    // Get the fee for updating the feeds. If the transaction fee is not paid, the update will fail.
    uint256 fees = switchboard.getFee(updates);
    if (msg.value < fees) {
      revert InsufficientFee(fees, msg.value);
    }

    // Submit the updates to the Switchboard contract
    switchboard.updateFeeds{ value: fees }(updates);

    // Read the current value from a Switchboard feed.
    // This will fail if the feed doesn't have fresh updates ready (e.g. if the feed update failed)
    Structs.Update memory latestUpdate = switchboard.latestUpdate(aggregatorId);

    // Get the latest feed result
    // This is encoded as decimal * 10^18 to avoid floating point issues
    // Some feeds require negative numbers, so results are int128's, but this example uses positive numbers
    result = latestUpdate.result;

    // In this example, we revert if the result is negative
    if (result < 0) {
      revert InvalidResult(result);
    }

    // Emit the latest result from the feed
    emit FeedData(latestUpdate.result);
  }
}
