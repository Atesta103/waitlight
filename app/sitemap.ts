import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://waitlight.fr"
    const now = new Date()

    return [
        { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        { url: `${base}/legal/mentions`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        { url: `${base}/legal/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ]
}
