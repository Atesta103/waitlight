import { redirect } from "next/navigation"

/**
 * Root landing page.
 * Wait-Light uses a B2B model where merchants access /dashboard and
 * customers access /[slug]. The root page currently redirects to /login.
 *
 * TODO: Implement a real marketing landing page here.
 */
export default function HomePage() {
    redirect("/login")
}
