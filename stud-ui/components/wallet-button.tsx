"use client"

import {
    useWallet,
} from "@/components/wallet-provider"

export function WalletButton() {
    const {
        address,
        connecting,
        connect,
        disconnect,
        walletError,
    } =
        useWallet()

    if (
        address
    ) {
        return (
            <div className="flex items-center gap-2">

                <div className="rounded-full border border-[#3D3B3A]/10 px-4 py-2 text-xs">
                    {address.slice(
                        0,
                        6
                    )}
                    ...
                    {address.slice(
                        -4
                    )}
                </div>

                <button
                    onClick={() =>
                        void disconnect()
                    }
                    className="rounded-full border border-[#3D3B3A]/10 px-4 py-2 text-xs transition hover:bg-[#3D3B3A] hover:text-white"
                >
                    Disconnect
                </button>

            </div>
        )
    }

    return (
        <div>
            <button
                disabled={
                    connecting
                }
                onClick={() =>
                    void connect()
                }
                className="rounded-full border border-[#3D3B3A]/10 px-4 py-2 text-xs transition hover:bg-[#3D3B3A] hover:text-white disabled:opacity-50"
            >
                {connecting
                    ? "Connecting..."
                    : "Connect Wallet"}
            </button>

            {walletError && (
                <p className="mt-1 text-[10px] text-red-500">
                    {
                        walletError
                    }
                </p>
            )}
        </div>
    )
}