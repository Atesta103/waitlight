import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { GamesQueueWatcher } from "../../../../../components/composed/GamesQueueWatcher"
import type { SoundChoice } from "@/lib/utils/notifications"

type MerchantNotificationChannels = {
    sound: boolean
    vibrate: boolean
    toast: boolean
    push: boolean
}

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

    const { data: settings } = ticket
        ? await supabase
            .from("settings")
            .select("notification_channels, notification_sound")
            .eq("merchant_id", ticket.merchant_id)
            .single()
        : { data: null }

    const rawChannels = settings?.notification_channels as
        | Partial<MerchantNotificationChannels>
        | null
        | undefined
    const notificationChannels: MerchantNotificationChannels = {
        sound: rawChannels?.sound ?? true,
        vibrate: rawChannels?.vibrate ?? true,
        toast: rawChannels?.toast ?? true,
        push: rawChannels?.push ?? true,
    }
    const notificationSound = (settings?.notification_sound as SoundChoice | null | undefined) ?? "arpeggio"

    return (
        <>
            {ticket && (
                <GamesQueueWatcher 
                    merchantId={ticket.merchant_id}
                    ticketId={ticketId}
                    customerName={ticket.customer_name}
                    notificationChannels={notificationChannels}
                    notificationSound={notificationSound}
                />
            )}
            {props.children}
        </>
    )
}
