'use client'

import {useContractEvent, useContractWrite, usePrepareContractWrite} from 'wagmi'
import {waitForTransaction} from '@wagmi/core'
import {decodeAbiParameters, Log, TransactionReceipt} from 'viem'
import verifierArtifact from '../lib/contracts/OPOVPoPVerifier.json'
import {ISuccessResult} from '@worldcoin/idkit'
import React, {useEffect, useState} from 'react'
import Image from 'next/image'
import {Dna} from 'react-loader-spinner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Verifier = ({proof}: { proof: ISuccessResult }) => {

  const [uid, setUid] = useState<string>()

  const [contractPrepareError, setContractPrepareError] = useState<Error>()

  const {config} = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_VERIFIER_ADDRESS! as `0x${string}`,
    abi: verifierArtifact.abi,
    functionName: 'verify',
    args: [
      proof.merkle_root,
      proof.nullifier_hash,
      decodeAbiParameters([{type: 'uint256[8]'}], proof.proof as `0x${string}`)[0]
    ],
    onError(error) {
      setContractPrepareError(error)
    }
  })

  const {
    write: verify,
    isLoading: isVerifying,
    isSuccess: isVerified,
    isError: verificationErred,
    error: verificationError,
    data: verificationData
  } = useContractWrite(config)

  useContractEvent({
    address: process.env.NEXT_PUBLIC_VERIFIER_ADDRESS! as `0x${string}`,
    abi: verifierArtifact.abi,
    eventName: 'AttestationCreated',
    listener(log) {
      console.log(log)
    },
  })

  useEffect(() => {
    if (!verify || isVerifying || isVerified || verificationErred) return;
    console.log('verifying proof', proof, "at", process.env.NEXT_PUBLIC_VERIFIER_ADDRESS);
    verify()
  }, [verify])

  useEffect(() => {
    if (!verificationData?.hash) return;

    const wait = async () => {
      const data: TransactionReceipt = await waitForTransaction({hash: verificationData.hash})
      const logs: Log<bigint, number>[] = data.logs
        .filter(log =>
          log.topics[0] === verifierArtifact.abi.find(
            (item: any) => item.name === 'AttestationCreated'
          )
        )
      console.log('verificationData logs', logs);
    }

    wait().catch(console.error)

  }, [verificationData])

  useEffect(() => {
    if (!contractPrepareError) return;
    console.error('Contract prepare error', contractPrepareError);
  }, [contractPrepareError])

  useEffect(() => {
    if (!verificationError) return;
    console.error('Contract write error', verificationError);
  }, [verificationError])

  return (
    <div id="verify" className="flex flex-col flex-grow justify-center items-center py-12">

      <div className="bg-white rounded-xl shadow-2xl pt-24 pr-24 flex justify-center max-w-5xl">

        <div className="w-1/2 flex justify-end items-end">
          <Image
            src={verificationErred || contractPrepareError ? "/man-error.jpg" : "/man-waving.jpg"}
            alt="A man waving"
            width={922}
            height={1639}
            priority
          />
        </div>

        <div className="flex flex-col w-1/2 pb-24 gap-4 justify-center">

          {verificationErred || contractPrepareError ? (

            <div className="flex flex-col gap-3 items-center">
              <div className="pt-6 text-5xl font-semibold tracking-tighter">
                We ran into a snag
              </div>

              <div className="text-base pt-2 pb-4 leading-snug">
                Please report this issue to the <a href="mailto:hi@opov.xyz" className="text-green-700">support line</a>
              </div>

            </div>
          ) : isVerified ? (

            <div className="flex flex-col gap-3 items-center">

              <div className="flex justify-center">
                <svg viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                     className="w-24 text-green-500">
                  <path
                    d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>

              <div className="pt-6 text-5xl font-semibold tracking-tighter">
                You&apos;re all set!
              </div>

              <div className="text-base pt-2 pb-4 leading-snug">
                Welcome, person. You can view your EAS attestation <a
                href={`https://base-goerli.easscan.org/attestation/view/${uid}`}
                className="text-green-700 font-medium">here</a>.
              </div>

              <AlertDialog>
                <AlertDialogTrigger>
                  <div className="w-56 h-12 bg-opov text-white font-medium text-xl rounded-full flex justify-center items-center">
                    <span className="drop-shadow-sm">Get started</span>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Coming Soon!</AlertDialogTitle>
                    <AlertDialogDescription>
                      The dashboard is almost ready, and when it is, you&apos;ll be first to know. We&apos;ll send you a message on XMTP when OPOV is ready for you.
                    </AlertDialogDescription>
                    <AlertDialogCancel>Okay</AlertDialogCancel>
                  </AlertDialogHeader>
                </AlertDialogContent>
              </AlertDialog>
            </div>

          ) : isVerifying &&

            <div className="flex flex-col pb-12 gap-3 items-center">

              <div className="flex justify-center">
                <Dna
                  visible={true}
                  height="128"
                  width="128"
                  ariaLabel="dna-loading"
                  wrapperClass="dna-wrapper"
                />
              </div>

              <div className="text-5xl font-semibold tracking-tighter text-center">
                Generating your Proof of Personhood...
              </div>

              <div className="text-base pt-2 leading-snug">
                This may take a minute.
              </div>

            </div>

          }

        </div>

      </div>

    </div>
  )
}

export default Verifier
