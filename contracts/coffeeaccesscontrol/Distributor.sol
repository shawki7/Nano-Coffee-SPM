pragma solidity >=0.4.21 < 0.6.0;

import "./Roles.sol";

contract Distributor {
  using Roles for Roles.Role;

  event DistributorAdded(address indexed account);
  event DistributorRemoved(address indexed account);

  Roles.Role private distributors;

  constructor() public {
    _addDistributor(msg.sender);
  }

  function isDistributor(address account) public view returns (bool) {
    return distributors.has(account);
  }

  function addDistributor(address account) public onlyDistributor {
    _addDistributor(account);
  }

  function renounceDistributor() public {
    _removeDistributor(msg.sender);
  }

  function _addDistributor(address account) internal {
    distributors.add(account);
    emit DistributorAdded(account);
  }

  function _removeDistributor(address account) internal {
    distributors.remove(account);
    emit DistributorRemoved(account);
  }

    modifier onlyDistributor() {
    require(isDistributor(msg.sender));
    _;
  }

}