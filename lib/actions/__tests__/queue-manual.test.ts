import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    getUser: vi.fn(),
    settingsSingle: vi.fn(),
    countIn: vi.fn(),
    recoveryMaybeSingle: vi.fn(),
    insertSingle: vi.fn(),
    insert: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn(async () => ({
        auth: {
            getUser: mocks.getUser,
        },
        from: (table: string) => {
            if (table === "settings") {
                return {
                    select: () => ({
                        eq: () => ({
                            single: mocks.settingsSingle,
                        }),
                    }),
                }
            }

            if (table === "queue_items") {
                return {
                    select: (
                        _cols?: string,
                        opts?: { count?: string; head?: boolean },
                    ) => {
                        // Capacity count: .select("*", { count }).eq().in()
                        if (opts?.count) {
                            return { eq: () => ({ in: mocks.countIn }) }
                        }
                        // Recovery-code uniqueness: .select("id").eq().eq().in().maybeSingle()
                        return {
                            eq: () => ({
                                eq: () => ({
                                    in: () => ({
                                        maybeSingle: mocks.recoveryMaybeSingle,
                                    }),
                                }),
                            }),
                        }
                    },
                    insert: mocks.insert,
                }
            }

            throw new Error(`Unexpected table ${table}`)
        },
    })),
}))

import { createManualTicketAction } from "@/lib/actions/queue"

describe("createManualTicketAction", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.getUser.mockResolvedValue({
            data: { user: { id: "merchant-1" } },
        })
        mocks.settingsSingle.mockResolvedValue({
            data: { max_capacity: 10 },
            error: null,
        })
        mocks.countIn.mockResolvedValue({ count: 2, error: null })
        // No collision → the generated recovery code is free to use.
        mocks.recoveryMaybeSingle.mockResolvedValue({ data: null, error: null })
        mocks.insert.mockReturnValue({
            select: () => ({
                single: mocks.insertSingle,
            }),
        })
        mocks.insertSingle.mockResolvedValue({
            data: {
                id: "ticket-1",
                merchant_id: "merchant-1",
                customer_name: "Alice",
                entry_source: "manual",
                status: "waiting",
                joined_at: "2026-05-04T10:00:00.000Z",
                called_at: null,
                done_at: null,
                recovery_code: "4F2K",
            },
            error: null,
        })
    })

    it("returns an auth error without a merchant session", async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null } })

        const result = await createManualTicketAction({
            customerName: "Alice",
        })

        expect(result).toEqual({
            error: "Session expirée. Veuillez vous reconnecter.",
        })
        expect(mocks.insert).not.toHaveBeenCalled()
    })

    it("blocks creation when active capacity is full", async () => {
        mocks.settingsSingle.mockResolvedValue({
            data: { max_capacity: 2 },
            error: null,
        })
        mocks.countIn.mockResolvedValue({ count: 2, error: null })

        const result = await createManualTicketAction({
            customerName: "Alice",
        })

        expect(result).toEqual({
            error: "La file d'attente est pleine. Veuillez réessayer plus tard.",
        })
        expect(mocks.insert).not.toHaveBeenCalled()
    })

    it("inserts a manual waiting ticket for the authenticated merchant", async () => {
        const result = await createManualTicketAction({
            customerName: "Alice",
        })

        expect(mocks.insert).toHaveBeenCalledWith({
            merchant_id: "merchant-1",
            customer_name: "Alice",
            status: "waiting",
            name_flagged: false,
            entry_source: "manual",
            recovery_code: expect.any(String),
        })
        expect(result).toEqual({
            data: {
                id: "ticket-1",
                merchant_id: "merchant-1",
                customer_name: "Alice",
                entry_source: "manual",
                status: "waiting",
                joined_at: "2026-05-04T10:00:00.000Z",
                called_at: null,
                done_at: null,
                recovery_code: "4F2K",
            },
        })
    })

    it("returns a generic error when insert fails", async () => {
        mocks.insertSingle.mockResolvedValue({
            data: null,
            error: { message: "duplicate key" },
        })

        const result = await createManualTicketAction({
            customerName: "Alice",
        })

        expect(result).toEqual({
            error: "Impossible d'ajouter ce ticket. Veuillez réessayer.",
        })
    })
})
