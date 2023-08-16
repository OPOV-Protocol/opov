// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import {
IEAS,
Attestation,
AttestationRequest,
AttestationRequestData
} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { NO_EXPIRATION_TIME, EMPTY_UID } from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

import "./interfaces/IAttester.sol";
import "./structs/PopSchema.sol";

contract OPOVAttester is IAttester, Ownable {

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

    mapping(address => bytes32) internal attestations;

    constructor(
        IEAS _eas,
        bytes32 _schema
    ) {
        eas = _eas;
        schema = _schema;
    }

    function setVerifier(address _verifier) public onlyOwner {
        verifier = _verifier;
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

    function getAttestation(address _address) public view returns (bytes32) {
        return attestations[_address];
    }

    function createAttestation(PoPSchema memory data) public returns (bytes32) {
        require(verifier != address(0), "Verifier not set");
        require(msg.sender == verifier, "Unauthorized verifier");

        bytes memory encodedData = abi.encode(data);

        AttestationRequest memory request = AttestationRequest({
            schema: schema,
            data: AttestationRequestData({
                data: encodedData,
                recipient: data.signal,
                expirationTime: NO_EXPIRATION_TIME, // No expiration time
                revocable: false,
                refUID: EMPTY_UID, // No references UI
                value: 0 // No value/ETH
            })
        });

        bytes32 uid = eas.attest(request);
        attestations[data.signal] = uid;
        emit AttestationCreated(uid, schema, encodedData, data.signal);

        return uid;
    }
}