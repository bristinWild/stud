"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"

import type {
    Address,
} from "viem"

import {
    connectWallet,
    disconnectWallet as disconnectWalletClient,
    getConnectedWallet,
    watchWalletChanges,
} from "@/lib/prediction-market"

type WalletContextValue = {
    address: Address | null
    connected: boolean
    connecting: boolean
    walletError: string

    connect: () =>
        Promise<Address | null>

    disconnect: () =>
        Promise<void>
}

const WalletContext =
    createContext<
        WalletContextValue | undefined
    >(undefined)

export function WalletProvider({
    children,
}: {
    children:
    React.ReactNode
}) {
    const [
        address,
        setAddress,
    ] =
        useState<Address | null>(
            null
        )

    const [
        connecting,
        setConnecting,
    ] =
        useState(false)

    const [
        walletError,
        setWalletError,
    ] =
        useState("")

    const connect =
        useCallback(
            async () => {
                try {
                    setConnecting(
                        true
                    )

                    setWalletError(
                        ""
                    )

                    const nextAddress =
                        await connectWallet()

                    setAddress(
                        nextAddress
                    )

                    return nextAddress
                } catch (error) {
                    const message =
                        error instanceof
                            Error
                            ? error.message
                            : "Could not connect wallet."

                    setWalletError(
                        message
                    )

                    return null
                } finally {
                    setConnecting(
                        false
                    )
                }
            },
            []
        )

    const disconnect =
        useCallback(
            async () => {
                try {
                    await disconnectWalletClient()
                } catch (
                error
                ) {
                    console.error(
                        error
                    )
                } finally {
                    setAddress(
                        null
                    )
                }
            },
            []
        )

    useEffect(() => {
        let cancelled =
            false

        let cleanup:
            | (() => void)
            | undefined

        async function initialise() {
            try {
                const current =
                    await getConnectedWallet()

                if (
                    !cancelled
                ) {
                    setAddress(
                        current
                    )
                }
            } catch {
                if (
                    !cancelled
                ) {
                    setAddress(
                        null
                    )
                }
            }

            try {
                cleanup =
                    await watchWalletChanges(
                        (
                            nextAccount
                        ) => {
                            if (
                                cancelled
                            ) {
                                return
                            }

                            setAddress(
                                nextAccount
                            )

                            setWalletError(
                                ""
                            )
                        },

                        async (
                            chainId
                        ) => {
                            if (
                                cancelled
                            ) {
                                return
                            }

                            if (
                                chainId !==
                                "0x12c1"
                            ) {
                                setAddress(
                                    null
                                )

                                setWalletError(
                                    "Switch wallet to World Chain Sepolia."
                                )

                                return
                            }

                            try {
                                const current =
                                    await getConnectedWallet()

                                if (
                                    !cancelled
                                ) {
                                    setAddress(
                                        current
                                    )

                                    setWalletError(
                                        ""
                                    )
                                }
                            } catch {
                                setAddress(
                                    null
                                )
                            }
                        }
                    )
            } catch (
            error
            ) {
                console.error(
                    "Wallet listener error:",
                    error
                )
            }
        }

        void initialise()

        return () => {
            cancelled =
                true

            cleanup?.()
        }
    }, [])

    const value =
        useMemo(
            () => ({
                address,

                connected:
                    address !==
                    null,

                connecting,

                walletError,

                connect,

                disconnect,
            }),
            [
                address,
                connecting,
                walletError,
                connect,
                disconnect,
            ]
        )

    return (
        <WalletContext.Provider
            value={
                value
            }
        >
            {children}
        </WalletContext.Provider>
    )
}

export function useWallet() {
    const context =
        useContext(
            WalletContext
        )

    if (!context) {
        throw new Error(
            "useWallet must be used inside WalletProvider."
        )
    }

    return context
}