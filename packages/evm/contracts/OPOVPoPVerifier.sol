// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// TODO Remove when deploying to a live network.
//import "hardhat/console.sol";

//import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import {ByteHasher} from "./helpers/ByteHasher.sol";
import {IWorldID} from "./interfaces/IWorldID.sol";
import {NonblockingLzApp} from "./lz/NonblockingLzApp.sol";
import "./structs/PopSchema.sol";
//import "./helpers/BytesLib.sol";

// Optimism
contract OPOVPoPVerifier is
NonblockingLzApp,
ReentrancyGuard
{

    using ByteHasher for bytes;

    /// @notice Thrown when attempting to reuse a nullifier
    error InvalidNullifier();

    event ContractCreated(
        address indexed sender
    );

    /// @dev Emitted when a user successfully verifies their proof.
    /// @param user The address of the user who submitted the proof.
    /// @param root The root of the Merkle tree provided during verification.
    /// @param nullifierHash The unique nullifier hash associated with the proof.
    event VerificationSuccessful(
        address indexed user,
        uint256 root,
        uint256 nullifierHash
    );

    /// @dev Emitted when the attester for the contract is set or updated.
    /// @param attester The address of the attester.
    event AttesterSet(address indexed attester);

    /// @dev Emitted when a cross-chain message is sent from the contract.
    /// @param dstChainId The ID of the destination chain.
    /// @param attester The address of the attester.
    /// @param payload The data payload being sent.
    event MessageSent(
        uint16 dstChainId,
        address attester,
        bytes payload
    );

    /// @dev The World ID instance that will be used for verifying proofs
    IWorldID internal immutable worldId;

    /// @dev The contract's external nullifier hash
    uint256 internal immutable externalNullifier;

    /// @dev The World ID group ID
    uint8 internal immutable groupId;

    /// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
    mapping(uint256 => bool) internal nullifierHashes;

    /// @dev Base chain id
    uint16 private dstChainId;

    address private attester;

    /// @param _worldId The WorldID instance that will verify the proofs
    /// @param _appId The World ID app ID
    /// @param _actionId The World ID action ID
    /// @param _lzEndpoint The endpoint of the LayerZero contract
    /// @param _dstChainId The chain id of the LayerZero destination chain
    constructor(
        IWorldID _worldId,
        string memory _appId,
        string memory _actionId,
        address _lzEndpoint,
        uint16 _dstChainId
    ) NonblockingLzApp(_lzEndpoint) {
        emit ContractCreated(msg.sender);
        worldId = _worldId;
        dstChainId = _dstChainId;
        externalNullifier = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _actionId)
            .hashToField();
        // Initialize first slot to prevent replay attack
        nullifierHashes[0] = true;
        groupId = 1; // Orb verification only
    }

    function estimateFee(bool _useZro, bytes calldata _adapterParams, bytes calldata _payload) public view returns (uint nativeFee, uint zroFee) {
        return lzEndpoint.estimateFees(dstChainId, address(this), _payload, _useZro, _adapterParams);
    }

    function setAttester(address _attester) public onlyOwner {
        attester = _attester;
        setTrustedRemoteAddress(dstChainId, abi.encode(_attester));
        emit AttesterSet(_attester);
    }

    /// @param _signal An arbitrary input from the user, usually the user's wallet address
    /// @param _root The root of the Merkle tree (returned by the JS widget).
    /// @param _nullifierHash The nullifier hash for this proof, preventing double signaling (returned by the JS widget).
    /// @param _proof The zero-knowledge proof that demonstrates the claimer is registered with World ID (returned by the JS widget).
    function verifyAndExecute(
        address _signal,
        uint256 _root,
        uint256 _nullifierHash,
        uint256[8] calldata _proof
    ) public nonReentrant {
        // First, we make sure this person hasn't done this before
        if (nullifierHashes[_nullifierHash]) revert InvalidNullifier();

        // We now verify the provided proof is valid and the user is verified by World ID
        worldId.verifyProof(
            _root,
            groupId,
            abi.encodePacked(_signal).hashToField(),
            _nullifierHash,
            externalNullifier,
            _proof
        );

        // We now record the user has done this, so they can't do it again (proof of uniqueness)
        // TODO Implement a commitment scheme to prevent front-running
        nullifierHashes[_nullifierHash] = true;

        emit VerificationSuccessful(_signal, _root, _nullifierHash);

        PoPSchema memory data = PoPSchema({
            action: "verify",
            signal: _signal,
            credential_type: groupId,
            timestamp: uint64(block.timestamp)
        });

        bytes memory payload = abi.encode(data);
        _lzSend(
            dstChainId,
            payload,
            payable(msg.sender),
            address(0x0),
            bytes(""),
            0
        );

        emit MessageSent(dstChainId, attester, payload);
    }

    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) internal override {
    }
//
//    // generic config for LayerZero user Application
//    function setConfig(uint16 _version, uint16 _chainId, uint _configType, bytes calldata _config) external override onlyOwner {
//        lzEndpoint.setConfig(_version, _chainId, _configType, _config);
//    }
//
//    function setSendVersion(uint16 _version) external override onlyOwner {
//        lzEndpoint.setSendVersion(_version);
//    }
//
//    function setReceiveVersion(uint16 _version) external override onlyOwner {
//        lzEndpoint.setReceiveVersion(_version);
//    }
//
//    function forceResumeReceive(uint16 _srcChainId, bytes calldata _srcAddress) external override onlyOwner {
//        lzEndpoint.forceResumeReceive(_srcChainId, _srcAddress);
//    }
//
//    // _path = abi.encodePacked(remoteAddress, localAddress)
//    // this function set the trusted path for the cross-chain communication
//    function setTrustedRemote(uint16 _remoteChainId, bytes memory _path) private {
//        trustedRemoteLookup[_remoteChainId] = _path;
//        emit SetTrustedRemote(_remoteChainId, _path);
//    }
//
//    function setTrustedRemoteAddress(uint16 _remoteChainId, bytes memory _remoteAddress) private {
//        trustedRemoteLookup[_remoteChainId] = abi.encodePacked(_remoteAddress, address(this));
//        emit SetTrustedRemoteAddress(_remoteChainId, _remoteAddress);
//    }
//
//    function getTrustedRemoteAddress(uint16 _remoteChainId) external view returns (bytes memory) {
//        bytes memory path = trustedRemoteLookup[_remoteChainId];
//        require(path.length != 0, "LzApp: no trusted path record");
//        return BytesLib.slice(path, 0, path.length - 20); // the last 20 bytes should be address(this)
//    }
//
//    function setPrecrime(address _precrime) external onlyOwner {
//        precrime = _precrime;
//        emit SetPrecrime(_precrime);
//    }
//
//    function setMinDstGas(uint16 _dstChainId, uint16 _packetType, uint _minGas) external onlyOwner {
//        require(_minGas > 0, "LzApp: invalid minGas");
//        minDstGasLookup[_dstChainId][_packetType] = _minGas;
//        emit SetMinDstGas(_dstChainId, _packetType, _minGas);
//    }
//
//    // if the size is 0, it means default size limit
//    function setPayloadSizeLimit(uint16 _dstChainId, uint _size) external onlyOwner {
//        payloadSizeLimitLookup[_dstChainId] = _size;
//    }
}
