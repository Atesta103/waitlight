import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { GamesQueueWatcher } from "@/components/composed/GamesQueueWatcher"

export default async function GamesLayout(props: {
    children: ReactNode
    params: Promise<{ slug: string; ticketId: string }>
}) {
    const { ticketId } = await props.params
    const supabase = await createClient()

    const { data: ticket } = await supabase
        .from("queue_items")
        .select("merchant_id, customer_name")
        .eq("id", ticketId)
        .single()

    return (
        <>
            {ticket && (
                <GamesQueueWatcher 
                    merchantId={ticket.merchant_id}
                    ticketId={ticketId}
                    customerName={ticket.customer_name}
                />
            )}
            {props.children}
        </>
    )
}
