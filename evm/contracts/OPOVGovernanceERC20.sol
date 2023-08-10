// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "hardhat/console.sol";

import {IERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-IERC20PermitUpgradeable.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {IERC20MetadataUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import {ERC20VotesUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC165Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import {IVotesUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/utils/IVotesUpgradeable.sol";

import {PluginCloneable, IDAO} from '@aragon/osx/core/plugin/PluginCloneable.sol';
import {DAO} from '@aragon/osx/core/dao/DAO.sol';
import {PermissionManager} from '@aragon/osx/core/permission/PermissionManager.sol';
import {IERC20MintableUpgradeable} from "@aragon/osx/token/ERC20/IERC20MintableUpgradeable.sol";

/// @title WorldIDVerifierPlugin
/// @author paulburke.eth
/// @notice A plugin that allows users to mint tokens after verifying their WorldID proof.
contract OPOVGovernanceERC20 is
PluginCloneable,
IERC20MintableUpgradeable,
ERC165Upgradeable,
ERC20VotesUpgradeable,
PermissionManager
{

    /// @notice The permission identifier to mint new tokens
    bytes32 public constant MINT_PERMISSION_ID = keccak256("MINT_PERMISSION");

    /// @notice The settings for the initial mint of the token.
    /// @param receivers The receivers of the tokens.
    /// @param amounts The amounts of tokens to be minted for each receiver.
    /// @dev The lengths of `receivers` and `amounts` must match.
    struct MintSettings {
        address[] receivers;
        uint256[] amounts;
    }

    /// @notice Thrown if the number of receivers and amounts specified in the mint settings do not match.
    /// @param receiversArrayLength The length of the `receivers` array.
    /// @param amountsArrayLength The length of the `amounts` array.
    error MintSettingsArrayLengthMismatch(uint256 receiversArrayLength, uint256 amountsArrayLength);

    /// @param _dao The associated DAO.
    constructor(
        IDAO _dao,
        string memory _name,
        string memory _symbol,
        MintSettings memory _mintSettings
    ) {
        initialize(_dao, _worldId, _name, _symbol, _mintSettings);
    }

    /// @notice Initializes the contract.
    /// @param _dao The associated DAO.
    /// @param _admin The address of the admin.
    function initialize(
        IDAO _dao,
        string memory _name,
        string memory _symbol,
        MintSettings memory _mintSettings
    ) external initializer {
        // Check mint settings
        if (_mintSettings.receivers.length != _mintSettings.amounts.length) {
            revert MintSettingsArrayLengthMismatch({
                receiversArrayLength: _mintSettings.receivers.length,
                amountsArrayLength: _mintSettings.amounts.length
            });
        }

        __ERC20_init(_name, _symbol);
        __ERC20Permit_init(_name);
        __PluginCloneable_init(_dao); // Must call to be associated with a DAO and use the DAO's PermissionManager
        __PermissionManager_init(msg.sender);

        for (uint256 i; i < _mintSettings.receivers.length;) {
            _mint(_mintSettings.receivers[i], _mintSettings.amounts[i]);

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Mints tokens to an address.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens to be minted.
    function mint(address to, uint256 amount) external override auth(MINT_PERMISSION_ID) {
        _mint(to, amount);
    }

    /// @notice Mints `_amount` of `_token` to `msg.sender` after verifying their WorldID proof.
    /// @dev The WorldID proof prevents sybil attacks by ensuring each user can only mint from a single account.
    /// @param _amount The number of tokens to mint.
    /// @param _root The WorldID merkle root to verify against.
    /// @param _nullifierHash The nullifier hash for the proof.
    /// @param _proof The array of proof elements returned by WorldID.
    function mintAndVerify(uint256 _amount) external {

        // Verify nullifier not already used
        if (nullifierHashes[_nullifierHash]) {
            revert InvalidNullifier();
        }

        // TODO Verify attestation

        grant(address(this), msg.sender, MINT_PERMISSION_ID);

        uint prevBalance = balanceOf(msg.sender);

        // Mint DAO tokens
        _mint(msg.sender, _amount);

        // Check if member before
        if (prevBalance == 0) {
            emit MembersAdded([msg.sender]);
        }
    }

    /// @notice Checks if this or the parent contract supports an interface by its ID.
    /// @param _interfaceId The ID of the interface.
    /// @return Returns `true` if the interface is supported.
    function supportsInterface(bytes4 _interfaceId) public view virtual override returns (bool) {
        return
            _interfaceId == type(IERC20Upgradeable).interfaceId ||
            _interfaceId == type(IERC20PermitUpgradeable).interfaceId ||
            _interfaceId == type(IERC20MetadataUpgradeable).interfaceId ||
            _interfaceId == type(IVotesUpgradeable).interfaceId ||
            _interfaceId == type(IERC20MintableUpgradeable).interfaceId ||
            super.supportsInterface(_interfaceId);
    }

    // https://forum.openzeppelin.com/t/self-delegation-in-erc20votes/17501/12?u=novaknole
    /// @inheritdoc ERC20VotesUpgradeable
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        super._afterTokenTransfer(from, to, amount);

        // Automatically turn on delegation on mint/transfer but only for the first time.
        if (to != address(0) && numCheckpoints(to) == 0 && delegates(to) == address(0)) {
            _delegate(to, to);
        }
    }
}
