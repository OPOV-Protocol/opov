'use client'

import Image from 'next/image'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation'

export default function Home() {

  const router = useRouter()

  const { openConnectModal } = useConnectModal()

  useAccount({
    onConnect({isReconnected }) {
      if (!isReconnected) {
        router.push('/dashboard');
      }
    },
  })

  return (
    <main className="landing flex h-screen overflow-hidden flex-col items-center p-10">

      <div className="w-full grid grid-cols-3">

        <div>
          <a href="https://github.com/OPOV-Protocol/opov" target="_blank">
            <svg viewBox="64 64 896 896" className="w-8">
              <path
                d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"/>
            </svg>
          </a>
        </div>

        <div className="flex justify-center">
          <Image
            src="/opov.svg"
            alt="OPOV Logo"
            width={132}
            height={35}
            priority
          />
        </div>

        <div className="flex justify-end">
          <ConnectButton
            showBalance={{
              smallScreen: false,
              largeScreen: false,
            }}
          />
        </div>

      </div>
      {/* End nav bar */}

      <div className="flex flex-col gap-6 pt-24 items-center">
        
        <div className="text-6xl lg:text-8xl flex flex-col items-center text-center font-semibold tracking-tighter leading-tight">
          <span>Empowering DAOs with</span>
          <span className="text-opov">Proof of Personhood</span>
        </div>

        <div className="max-w-2xl text-center text-xl">
          OPOV is a revolutionary DAO protocol that uses <span className="font-semibold">zero-knowledge proofs </span>
          to ensure every member is a verified individual, fostering trust and accountability within communities,
          <span className="font-semibold"> without KYC</span>.
        </div>


        <div className="grid grid-cols-4 grid-rows-2 gap-4">

          <div className="row-span-2">
            <Image
              src="/flag-blue.png"
              alt="Woman with large blue flag"
              width={823}
              height={802}
              priority
            />
          </div>

          <div className="row-span-2 col-start-4 row-start-1 mr-24">
            <Image
              src="/flag-orange.png"
              alt="Woman with an orange flag"
              width={644}
              height={1013}
              priority
            />
          </div>

          <div className="col-span-2 col-start-2 row-start-1 mt-44 mr-12">
            <Image
              src="/flag-green.png"
              alt="Man with a small green flag"
              width={1335}
              height={1411}
              quality={90}

              priority
            />
          </div>

          <div className="col-span-2 col-start-2 row-start-1 flex justify-center">
            <div className="flex gap-16 pt-6">

              <div className="flex flex-col items-center gap-4">
                <button type="button" onClick={openConnectModal}
                        className="w-64 h-16 bg-opov text-white font-medium text-xl rounded-full">
                  <span className="drop-shadow-sm">Launch a DAO</span>
                </button>
                <div className="opacity-75">
                  <span>Powered by </span>
                  <svg viewBox="0 0 416 110" fill="none" className="h-4 inline mb-0.5">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M110.034 55c0 30.376-24.675 55-55.113 55C26.043 110 2.353 87.835 0 59.623h72.847v-9.246H0C2.353 22.165 26.043 0 54.921 0c30.438 0 55.113 24.624 55.113 55Zm204.324 45.036c19.097 0 31.622-10.29 31.622-25.786 0-14.38-9.425-21.198-23.685-23.554l-12.649-2.107c-9.672-1.612-16.121-5.827-16.121-15.124 0-9.422 7.193-16.612 20.833-16.612 13.269 0 20.089 6.694 20.833 16.24h9.549c-.744-12.645-10.417-23.926-30.258-23.926-19.593 0-30.381 11.033-30.381 24.67 0 14.504 9.796 21.198 23.189 23.43l12.773 1.983c10.664 1.86 16.616 6.198 16.616 15.372 0 10.785-8.804 17.728-22.197 17.728-13.888 0-22.569-6.695-23.313-18.1h-9.424c.744 14.876 12.152 25.786 32.613 25.786ZM173.574 98.3h-34.722V11.026h33.482c14.757 0 25.049 8.678 25.049 22.563 0 10.041-5.704 16.735-14.88 18.967v.372c10.912 2.107 17.608 9.545 17.608 21.198 0 15-11.036 24.174-26.537 24.174Zm-2.48-48.967c10.541 0 16.989-5.703 16.989-14.629v-1.24c0-8.925-6.448-14.504-16.989-14.504h-22.941v30.373h22.941Zm1.116 41.033c11.533 0 18.601-6.322 18.601-15.992v-1.24c0-10.041-7.192-16.115-18.725-16.115h-23.933v33.347h24.057ZM275.216 98.3h-9.921l-7.44-23.678h-34.722l-7.44 23.678h-9.425l28.646-87.274h11.284L275.216 98.3ZM240.99 20.572h-.744l-14.633 46.24h29.886l-14.509-46.24ZM359.949 98.3V11.026H416v8.058h-46.75v30h43.03v7.935h-43.03v33.223H416V98.3h-56.051Z"
                          fill="currentColor"/>
                  </svg>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button type="button" onClick={openConnectModal}
                        className="flex gap-2 items-center justify-center w-64 h-16 bg-white border-2 border-green-500 font-medium text-xl rounded-full">
                  <svg viewBox="0 0 101 118" className="h-9 inline">
                    <path d="M84.248 43.784c16.2 14.481 18 43.444 5.4 48.874s-18.001 1.81-25.202-7.24c-7.2-9.051-3.6-18.102-14.4-18.102-14.402 0-9.484 22.421-6.402 27.712 4.452 7.509 13.954 14.677 23.885 18.005 2.054.683 2.825 2.986 1.37 4.266-.857.768-2.14.94-4.452.342-5.308-1.11-16.202-3.261-25.203-15.932-9-12.671-9-30.773 0-38.013 9.001-7.24 23.402-5.43 28.802 10.86 5.4 16.292 16.202 12.672 19.802 9.051 3.6-3.62 3.6-9.05 2.623-14.18-.976-5.128-4.451-12.116-10.615-18.772-6.164-6.656-18.342-12.301-31.611-12.301-13.27 0-29.75 11.67-34.202 23.532-4.452 11.86-3.6 21.721-1.8 28.962 1.8 7.24.155 9.897-1.986 9.897-1.626 0-3.417-1.79-5.215-9.897-5.137-23.296 3.6-47.064 23.402-56.115 19.801-9.05 39.602-5.43 55.804 9.051Zm-3.6 19.912c3.6 10.86 0 16.291-2.932 15.801-1.199-.597-1.798-2.133-2.14-5.632-1.199-11.946-11.09-21.977-25.511-21.504-14.42.474-24.537 14.467-25.222 25.816-.685 11.35 3.6 27.152 12.552 32.381 8.951 5.23.605 8.48-5.351 3.822-16.201-12.671-16.429-40.068-10.915-49.902 5.514-9.833 14.515-17.074 25.316-18.884 16.201-1.81 30.602 7.24 34.202 18.102ZM50.15 74.718c1.627 0 3.683 1.838 3.854 3.459 1.198 8.96 3.6 12.67 10.8 18.101 7.201 5.43 19.802 3.62 21.216 4.808 1.413 1.188 1.284 3.584.342 4.182-1.455.853-14.626 3.37-23.358-1.75-8.731-5.12-16.714-15.254-16.2-23.531.256-3.584 1.377-5.269 3.346-5.269Zm26.897-54.466c12.601 5.43 26.961 22.415 23.402 25.342-3.56 2.927-5.4 0-9.464-4.856-4.063-4.857-17.538-18.676-40.94-18.676-23.402 0-35.62 12.528-40.644 18.42-4.36 5.112-5.564 7.85-8.39 6.23-2.824-1.622.44-8.687 7.631-15.599 12.413-12.032 19.802-14.481 34.203-16.291 14.4-1.81 21.601 0 34.202 5.43Zm5.4-12.67c2.397 1.109 3.658 4.125 3.487 5.49-.342 2.475-3.51 2.645-8.646.341-8.39-3.584-15.495-5.12-24.998-5.632C41.418 7.27 30.641 9.047 23.013 13.5c-5.37 3.133-5.24 3.046-7.106 1.28-1.864-1.767-.742-5.936 5.336-9.008C27.321 2.7 32.745 1.706 44.645.341c11.9-1.366 25.817 1.438 37.802 7.24Zm-64.804 9.05h66.605"
                          fill="currentColor" fill-rule="nonzero"/>
                  </svg>
                  <span>Get Verified</span>
                </button>
                <div className="opacity-75">
                  <span>Learn more</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
