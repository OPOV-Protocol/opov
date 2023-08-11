// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

struct PoPSchema {
    string action;
    address signal;
    uint8 credential_type;
    uint64 timestamp;
}