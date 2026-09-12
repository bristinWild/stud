"use client"

import { useEffect, useState } from "react"

import {
    IDKitRequestWidget,
    orbLegacy,
    type RpContext,
} from "@worldcoin/idkit"

const BACKEND =
    process.env.NEXT_PUBLIC_STUD_BACKEND_URL!

const APP_ID =
    process.env.NEXT_PUBLIC_WORLD_APP_ID!

const RP_ID =
    process.env.NEXT_PUBLIC_WORLD_RP_ID!

const ALICE_WALLET =
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

type AuthorizationResult = {
    success: boolean

    worldId: {
        action: string
        nullifier: string
    }

    authorization: {
        wallet: string
        nullifierHash: string
        deadline: string
        signature: string
        signer: string
    }
}

export default function WorldIdTestPage() {
    const [open, setOpen] =
        useState(false)

    const [rpContext, setRpContext] =
        useState<RpContext | null>(null)

    const [authorization, setAuthorization] =
        useState<AuthorizationResult | null>(
            null
        )

    const [error, setError] =
        useState<string | null>(null)

    useEffect(() => {
        async function loadRpSignature() {
            try {
                const response =
                    await fetch(
                        `${BACKEND}/world-id/rp-signature`,
                        {
                            method: "POST",
                        }
                    )

                if (!response.ok) {
                    throw new Error(
                        "Failed to get RP signature"
                    )
                }

                const data =
                    await response.json()

                setRpContext({
                    rp_id: RP_ID,
                    nonce: data.nonce,
                    created_at: data.created_at,
                    expires_at: data.expires_at,
                    signature: data.sig,
                })
            } catch (err) {
                console.error(err)

                setError(
                    "Could not load World ID RP signature"
                )
            }
        }

        loadRpSignature()
    }, [])

    return (
        <main className="min-h-screen p-10">
            <h1 className="mb-4 text-3xl font-semibold">
                Stud World ID Test
            </h1>

            <p className="mb-8">
                Alice wallet:
                {" "}
                {ALICE_WALLET}
            </p>

            {!rpContext && !error && (
                <p>
                    Loading RP context...
                </p>
            )}

            {error && (
                <p className="text-red-500">
                    {error}
                </p>
            )}

            {rpContext && (
                <>
                    <button
                        onClick={() =>
                            setOpen(true)
                        }
                        className="rounded-full bg-black px-6 py-3 text-white"
                    >
                        Verify with World ID
                    </button>

                    <IDKitRequestWidget
                        open={open}
                        onOpenChange={setOpen}
                        app_id={APP_ID}
                        action="register-stud"
                        rp_context={rpContext}
                        allow_legacy_proofs={true}
                        environment="production"
                        preset={orbLegacy({
                            signal:
                                ALICE_WALLET.toLowerCase(),
                        })}
                        handleVerify={async (
                            result
                        ) => {
                            const response =
                                await fetch(
                                    `${BACKEND}/world-id/verify-and-authorize`,
                                    {
                                        method: "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json",
                                        },

                                        body: JSON.stringify({
                                            wallet:
                                                ALICE_WALLET,

                                            idkitResponse:
                                                result,
                                        }),
                                    }
                                )

                            const data =
                                await response.json()

                            if (!response.ok) {
                                console.error(data)

                                throw new Error(
                                    data.message ??
                                    "World ID verification failed"
                                )
                            }

                            setAuthorization(
                                data
                            )
                        }}
                        onSuccess={() => {
                            console.log(
                                "World ID verified"
                            )
                        }}
                        onError={(
                            errorCode,
                            debugReport
                        ) => {
                            console.error(
                                "IDKit error:",
                                errorCode,
                                debugReport
                            )
                        }}
                    />
                </>
            )}

            {authorization && (
                <div className="mt-10 max-w-3xl rounded-2xl border p-6">
                    <h2 className="mb-4 text-xl font-medium">
                        Authorization created ✓
                    </h2>

                    <pre className="overflow-auto text-xs">
                        {JSON.stringify(
                            authorization,
                            null,
                            2
                        )}
                    </pre>
                </div>
            )}
        </main>
    )
}