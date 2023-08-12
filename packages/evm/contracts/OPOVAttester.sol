// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {
    IEAS,
    Attestation,
    AttestationRequest,
    AttestationRequestData
} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { NO_EXPIRATION_TIME, EMPTY_UID } from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

import {NonblockingLzApp} from "./lz/NonblockingLzApp.sol";
import "./structs/PopSchema.sol";

/// Base
contract OPOVAttester is Ownable, NonblockingLzApp {

    event MessageReceived(
        uint16 srcChainId,
        bytes srcAddress,
        uint64 nonce,
        bytes payload
    );

    event AttestationCreated(
        bytes32 uid,
        bytes32 schema,
        bytes data,
        address attester
    );

    /// @dev Emitted when the verifier for the contract is set or updated.
    /// @param verifier The address of the verifier.
    event VerifierSet(address indexed verifier);

    IEAS internal immutable eas;

    bytes32 internal schema;

    address internal verifier;

    uint16 internal dstChainId;

    mapping(address => bytes32) internal attestations;

    constructor(
        IEAS _eas,
        bytes32 _schema,
        address _lzEndpoint,
        uint16 _dstChainId
    ) NonblockingLzApp(_lzEndpoint) {
        eas = _eas;
        schema = _schema;
        dstChainId = _dstChainId;
    }

    function setVerifier(address _verifier) public onlyOwner {
        verifier = _verifier;
        setTrustedRemoteAddress(dstChainId, abi.encode(verifier));
        emit VerifierSet(verifier);
    }

    function isVerified(address _address) public view returns (bool) {
        bytes32 uid = attestations[_address];
        if (uid == 0) {
            return false;
        }

        Attestation memory attestation = eas.getAttestation(uid);
        if (attestation.attester != address(this)) {
            return false;
        }

        return true;
    }

    function createAttestation(PoPSchema memory data) internal returns (bytes32) {
        bytes memory encodedData = abi.encode(data);

        AttestationRequest memory request = AttestationRequest({
            schema: schema,
            data: AttestationRequestData({
                data: encodedData,
                recipient: address(0), // No recipient
                expirationTime: NO_EXPIRATION_TIME, // No expiration time
                revocable: true,
                refUID: EMPTY_UID, // No references UI
                value: 0 // No value/ETH
            })
        });

        return eas.attest(request);
    }

    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) internal override {
        require(msg.sender == address(lzEndpoint));
        require(keccak256(_srcAddress) == keccak256(abi.encode(verifier)));

        emit MessageReceived(_srcChainId, _srcAddress, _nonce, _payload);

        PoPSchema memory data = abi.decode(_payload, (PoPSchema));

        bytes32 uid = createAttestation(data);
        address addr = address(data.signal);
        attestations[addr] = uid;
        emit AttestationCreated(uid, schema, _payload, verifier);
    }
}
