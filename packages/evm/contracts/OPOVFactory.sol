// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts-upgradeable/governance/utils/IVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import "./OPOVGovernor.sol";

contract OPOVFactory {
    address public immutable daoImplementation;

    event DAOCreated(address daoAddress);

    constructor(address _daoImplementation) {
        daoImplementation = _daoImplementation;
    }

    function createDAO(
        IVotesUpgradeable _token,
        TimelockControllerUpgradeable _timelock
    ) external returns (address) {
        address cloneAddress = Clones.clone(daoImplementation);
        address payable clone = payable(cloneAddress);

        OPOVGovernor(clone).initialize(_token, _timelock);

        emit DAOCreated(clone);
        return clone;
    }

}
