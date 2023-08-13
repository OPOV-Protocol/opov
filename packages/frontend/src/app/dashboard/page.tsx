"use client"

import Image from 'next/image'
import {ConnectButton} from '@rainbow-me/rainbowkit'
import { IDKitWidget } from '@worldcoin/idkit'
import {IExperimentalSuccessResult} from '@worldcoin/idkit/build/src/types'

export default function Dashboard() {
  function onSuccess() {
    console.log('onSuccess called')
  }

  function handleVerify(credential: IExperimentalSuccessResult) {
    console.log('handleVerify: credential', credential)
  }

  return (
    <main className="flex flex-col min-h-screen p-10">

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
          <ConnectButton />
        </div>

      </div>

      <div className="flex flex-grow justify-center items-center">


        <IDKitWidget
          app_id="app_staging_465fadc3db6afe30e7b43ea029771dcd"
          action="pop-verification"
          onSuccess={onSuccess}
          handleVerify={handleVerify}
        >
          {({ open }) => <button onClick={open}>Verify with World ID</button>}
        </IDKitWidget>
      </div>
    </main>
  )
}