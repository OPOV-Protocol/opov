// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import {PluginCloneable, IDAO} from '@aragon/osx/core/plugin/PluginCloneable.sol';

contract WorldIDVerifierPlugin is PluginCloneable {

    /// @param _dao The associated DAO.
    constructor(IDAO _dao) Plugin(_dao) {}

    /// @notice Initializes the contract.
    /// @param _dao The associated DAO.
    /// @param _admin The address of the admin.
    function initialize(IDAO _dao, address _admin) external initializer {
        __PluginCloneable_init(_dao); // Must call to be associated with a DAO and use the DAO's PermissionManager
        admin = _admin;
    }
}
