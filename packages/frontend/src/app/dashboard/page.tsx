'use client'

import Image from 'next/image'
import {ConnectButton} from '@rainbow-me/rainbowkit'
import {IDKitWidget} from '@worldcoin/idkit'
import {IExperimentalSuccessResult, OrbSignalProof} from '@worldcoin/idkit/build/src/types'
import {useAccount} from 'wagmi'
import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'

export default function Dashboard(): React.ReactElement {

  const router = useRouter()

  const {address, isConnected} = useAccount()

  const [proof, setProof] = useState<OrbSignalProof>()

  useEffect(() => {
    if (!isConnected) {
      console.log('not connected')
      router.push('/')
    }
  }, [isConnected])

  function onSuccess() {
    console.log('onSuccess called')
  }

  function handleVerify(credential: IExperimentalSuccessResult) {
    console.log('handleVerify: credential', credential)
    if (credential.credential_type !== 'orb') {
      console.log('credential type is not orb')
      // TODO show error dialog
      return
    }

    if ('proof' in credential) {
      const payload = credential.proof as OrbSignalProof
      setProof(payload)
      console.log('handleVerify: set proof', proof, payload);
    }
  }

  return (
    <main className="bg-opov-100 flex flex-col min-h-screen p-10">

      <div className="w-full grid grid-cols-3">
        <div className="col-start-2 flex justify-center">
          <Image
            src="/opov.svg"
            alt="OPOV Logo"
            width={132}
            height={35}
            priority
          />
        </div>

        <div className="flex justify-end">
          <ConnectButton/>
        </div>

      </div>

      {
        proof === undefined ? (
          <div id="verify" className="flex flex-col flex-grow justify-center items-center py-12">

            <div className="bg-white rounded-xl shadow-2xl pt-24 pl-24 pr-8 pb-8 flex justify-center max-w-5xl">

              <div className="flex flex-col w-1/2 pb-24 gap-4">
                <div className="text-5xl font-semibold tracking-tighter">
                  You must prove you&apos;re a person to participate.
                </div>

                <div className="text-sm pt-4 leading-snug">
                  You only have to do this once, then you&apos;ll have access to all DAOs launched on the OPOV Protocol.
                  No personal information is shared with OPOV or the DAOs you join.
                </div>

                <div className="text-base pb-4 font-semibold">
                  Select your Proof of Personhood provider:
                </div>

                <IDKitWidget
                  app_id="app_staging_465fadc3db6afe30e7b43ea029771dcd"
                  walletConnectProjectId="5dfbd43856c7249059f54d1a60b2614a"
                  action="pop-verification"
                  signal={address}
                  autoClose={true}
                  onSuccess={onSuccess}
                  credential_types={['orb']}
                  handleVerify={handleVerify}
                >
                  {({open}) =>
                    <button onClick={open}
                            className="bg-black rounded-xl py-4 px-12 w-fit text-white flex gap-2 items-center">
                      <svg viewBox="0 0 33 32" fill="none" className="w-6 inline">
                        <path
                          d="M30.72 9.782a16.04 16.04 0 0 0-3.435-5.087 15.91 15.91 0 0 0-5.055-3.437A15.897 15.897 0 0 0 16.002 0c-2.178 0-4.273.42-6.228 1.258a16.029 16.029 0 0 0-5.082 3.437 16.042 16.042 0 0 0-3.435 5.087A15.73 15.73 0 0 0 0 16.014c0 2.152.419 4.248 1.257 6.232.81 1.9 1.955 3.606 3.435 5.087a15.5 15.5 0 0 0 5.082 3.41A15.898 15.898 0 0 0 16.002 32c2.15 0 4.245-.42 6.228-1.258a16.03 16.03 0 0 0 5.082-3.437 16.042 16.042 0 0 0 3.435-5.087 15.93 15.93 0 0 0 1.257-6.232c0-2.152-.447-4.248-1.284-6.204Zm-20.024 4.723c.642-2.571 2.988-4.444 5.753-4.444h11.115a12.258 12.258 0 0 1 1.34 4.444H10.696Zm18.208 3.018a12.826 12.826 0 0 1-1.34 4.444H16.449c-2.765 0-5.083-1.9-5.753-4.444h18.208ZM6.814 6.82a12.902 12.902 0 0 1 9.188-3.8c3.463 0 6.73 1.34 9.188 3.8l.223.224H16.45a8.866 8.866 0 0 0-6.34 2.627c-1.34 1.341-2.206 3.018-2.485 4.835H3.1a12.904 12.904 0 0 1 3.714-7.686Zm9.188 22.19c-3.463 0-6.73-1.34-9.188-3.8A12.98 12.98 0 0 1 3.1 17.523h4.524a9.073 9.073 0 0 0 2.486 4.835 8.866 8.866 0 0 0 6.339 2.627h8.964l-.223.224a12.901 12.901 0 0 1-9.188 3.8Z"
                          fill="currentColor"/>
                      </svg>
                      <span>Verify with World ID</span>
                    </button>
                  }
                </IDKitWidget>

                <div className="pt-4 text-xs leading-snug opacity-50">
                  Upon successful verification you will be issued an attestation with the Ethereum Attestation Service
                  that
                  associates your wallet address with this proof.
                </div>
              </div>

              <div className="w-1/2 flex justify-end items-end">
                <Image
                  src="/dog.jpg"
                  alt="Woman with dog"
                  width={1189}
                  height={736}
                  priority
                />
              </div>

            </div>

          </div>
        ) : (
          <div className="new-div">Content for the new div when proof is not undefined.</div>
        )
      }

    </main>
  )
}