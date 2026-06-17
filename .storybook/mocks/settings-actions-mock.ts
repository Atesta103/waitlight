export const getMerchantSettingsAction = async () => ({
    data: {
        merchant: {
            id: "mock-id",
            name: "Mock Shop",
            business_type: "retail",
            slug: "mock-shop",
            logo_url: null,
            background_url: null,
            brand_color: null,
            font_family: null,
            border_radius: null,
            theme_pattern: "none",
            default_prep_time_min: 5,
            is_open: true,
            calculated_avg_prep_time: null,
            avg_prep_computed_at: null,
        },
        settings: {
            max_capacity: 50,
            welcome_message: "Welcome",
            thank_you_title: null,
            thank_you_message: null,
            qr_regenerated_at: null,
            notifications_enabled: true,
            auto_close_enabled: false,
            schedule: null,
            notification_channels: {
                sound: true,
                vibrate: true,
                toast: true,
                push: true,
            },
            notification_sound: "arpeggio",
            approaching_position_enabled: false,
            approaching_position_threshold: 3,
            approaching_time_enabled: false,
            approaching_time_threshold_min: 5,
        },
    },
})
export const updateMerchantIdentityAction = async () => ({
    data: { slug: "mock-shop" },
})
export const updateQueueSettingsAction = async () => ({ data: null })
export const regenerateQRAction = async () => ({
    data: { qr_regenerated_at: new Date().toISOString() },
})
export const deleteLogoAction = async () => ({ data: null })
export const checkSlugAvailabilitySettingsAction = async () => true
export const resetAvgPrepTimeAction = async () => ({ data: null })

const mock = {}
export default mock
