// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IEAS, Attestation, AttestationRequest, AttestationRequestData} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

import "./lz/NonblockingLzApp.sol";
import "./structs/PopSchema.sol";

/// Base
contract OPOVAttester is NonblockingLzApp, Initializable {

    address public owner;

    IEAS internal immutable eas;

    bytes32 schema;

    address internal verifier;

    /// @dev Chain id of the verifier
    uint16 private dstChainId;

    function initialize(
        IEAS _eas,
        bytes32 _schema,
        address _lzEndpoint,
        address _verifier,
        uint16 _dstChainId
    ) NonblockingLzApp(_lzEndpoint) public initializer {
        owner = msg.sender;
        eas = _eas;
        schema = _schema;
        verifier = _verifier;
        dstChainId = _dstChainId;

        setTrustedRemoteAddress(dstChainId, abi.encode(verifier));
    }

    function createAttestation(PoPSchema calldata data) external {
        bytes memory encodedData = abi.encode(data);

        AttestationRequest memory request = AttestationRequest({
            schema: schema,
            data: encodedData
        });

        bytes32 uid = eas.attest(request);
    }

    function lzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) override external {
        require(msg.sender == address(endpoint));
        require(keccak256(_srcAddress) == keccak256(abi.encode(verifier)));

        PoPSchema data = abi.decode(_payload, (PoPSchema));
        createAttestation(data);
    }
}
