// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import {Plugin, IDAO} from '@aragon/osx/core/plugin/Plugin.sol';

contract WorldIDVerifierPlugin is Plugin {

    constructor(IDAO _dao) Plugin(_dao) {}
}
