// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

import "./lz/NonblockingLzApp.sol";
import "./structs/PopSchema.sol";

/// Base
contract OPOVAttester is NonblockingLzApp, Initializable {

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

    IEAS internal immutable eas;

    bytes32 internal schema;

    address internal verifier;

    mapping(address => bytes32) internal attestations;

    function initialize(
        IEAS _eas,
        bytes32 _schema,
        address _lzEndpoint,
        address _verifier,
        uint16 _dstChainId
    ) NonblockingLzApp(_lzEndpoint) public initializer {
        eas = _eas;
        schema = _schema;
        verifier = _verifier;

        setTrustedRemoteAddress(dstChainId, abi.encode(verifier));
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

    function createAttestation(PoPSchema calldata data) external returns (bytes32) {
        bytes memory encodedData = abi.encode(data);

        AttestationRequest memory request = AttestationRequest({
            schema: schema,
            data: encodedData
        });

        return eas.attest(request);
    }

    function lzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) override external {
        require(msg.sender == address(endpoint));
        require(keccak256(_srcAddress) == keccak256(abi.encode(verifier)));

        emit MessageReceived(_srcChainId, _srcAddress, _nonce, _payload);

        PoPSchema data = abi.decode(_payload, (PoPSchema));

        bytes32 uid = createAttestation(data);
        attestations[data.signal] = uid;
        emit AttestationCreated(uid, schema, _payload, verifier);
    }
}
