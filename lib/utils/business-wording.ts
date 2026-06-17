import type { BusinessType } from "@/lib/validators/business"

type BusinessWording = {
    singular: string
    plural: string
    serviceDesk: string
    joinCta: string
}

const BUSINESS_WORDING: Record<BusinessType, BusinessWording> = {
    food: {
        singular: "client",
        plural: "clients",
        serviceDesk: "comptoir",
        joinCta: "Rejoindre la file",
    },
    healthcare: {
        singular: "patient",
        plural: "patients",
        serviceDesk: "accueil",
        joinCta: "M'inscrire en salle d'attente",
    },
    retail: {
        singular: "client",
        plural: "clients",
        serviceDesk: "caisse",
        joinCta: "Prendre ma place",
    },
    public_service: {
        singular: "usager",
        plural: "usagers",
        serviceDesk: "guichet",
        joinCta: "Prendre un ticket",
    },
}

export function getBusinessWording(
    businessType?: BusinessType | string | null,
) {
    if (
        businessType &&
        Object.prototype.hasOwnProperty.call(BUSINESS_WORDING, businessType)
    ) {
        return BUSINESS_WORDING[businessType as BusinessType]
    }
    return BUSINESS_WORDING.retail
}

export type { BusinessWording }
