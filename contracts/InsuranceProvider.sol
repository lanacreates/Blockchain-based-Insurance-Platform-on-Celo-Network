// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Policy.sol";

contract InsuranceProvider is Ownable {
    uint256 public policyCounter;
    mapping(uint256 => Policy) public policies;

    event PolicyCreated(uint256 policyId, address policyAddress);

    function createPolicy(
        address policyholder,
        uint256 premium,
        uint256 coverageAmount
    ) public onlyOwner returns (uint256) {
        policyCounter++;

        Policy policy = new Policy(policyholder, premium, coverageAmount);
        policies[policyCounter] = policy;

        emit PolicyCreated(policyCounter, address(policy));

        return policyCounter;
    }
}
