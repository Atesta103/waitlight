export const getMerchantSettingsAction = async () => ({
    data: {
        merchant: {
            id: "mock-id",
            name: "Mock Shop",
            slug: "mock-shop",
            logo_url: null,
            default_prep_time_min: 5,
            is_open: true,
            calculated_avg_prep_time: null,
            avg_prep_computed_at: null,
        },
        settings: {
            max_capacity: 50,
            welcome_message: "Welcome",
            qr_regenerated_at: null,
            notifications_enabled: true,
            auto_close_enabled: false,
        },
    },
});
export const updateMerchantIdentityAction = async () => ({ data: { slug: "mock-shop" } });
export const updateQueueSettingsAction = async () => ({ data: null });
export const regenerateQRAction = async () => ({ data: { qr_regenerated_at: new Date().toISOString() } });
export const deleteLogoAction = async () => ({ data: null });
export const checkSlugAvailabilitySettingsAction = async () => true;
export const resetAvgPrepTimeAction = async () => ({ data: null });

const mock = {};
export default mock;
