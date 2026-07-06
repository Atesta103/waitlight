import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { RecoverClient } from "./RecoverClient"

type RecoverPageProps = {
    params: Promise<{ slug: string }>
}

/**
 * Server component for /[slug]/retrouver.
 * Lets a customer recover their queue tracking link with first name + code.
 */
export default async function RecoverPage({ params }: RecoverPageProps) {
    const { slug } = await params

    const supabase = await createClient()
    const { data: merchant } = await supabase
        .from("merchants")
        .select("name, slug")
        .eq("slug", slug)
        .single()

    if (!merchant) {
        notFound()
    }

    return <RecoverClient slug={merchant.slug} merchantName={merchant.name} />
}
