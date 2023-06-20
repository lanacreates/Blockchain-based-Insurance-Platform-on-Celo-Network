// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Policy is AccessControl {
    bytes32 public constant POLICYHOLDER_ROLE = keccak256("POLICYHOLDER_ROLE");

    address public insuranceProvider;
    uint256 public premium;
    uint256 public coverageAmount;
    uint256 public createdAt;
    bool public active;

    event ClaimFiled(uint256 amount);
    event PolicyActivated();

    constructor(
        address policyholder,
        uint256 _premium,
        uint256 _coverageAmount
    ) {
        _setupRole(POLICYHOLDER_ROLE, policyholder);
        insuranceProvider = msg.sender;
        premium = _premium;
        coverageAmount = _coverageAmount;
        active = false;
        createdAt = block.timestamp;
    }

    function fileClaim(uint256 amount) public {
        require(hasRole(POLICYHOLDER_ROLE, msg.sender), "Caller is not the policyholder");
        require(active, "Policy is not active");
        require(amount <= coverageAmount, "Claim amount exceeds coverage amount");

        coverageAmount -= amount;
        
        emit ClaimFiled(amount);
    }

    function activate() public {
        require(msg.sender == insuranceProvider, "Caller is not the insurance provider");
        require(!active, "Policy is already active");

        active = true;

        emit PolicyActivated();
    }
}
