// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../structs/PopSchema.sol";

interface IAttester {
    function isVerified(address _address) external view returns (bool);
    function createAttestation(PoPSchema memory data) external returns (bytes32);
}