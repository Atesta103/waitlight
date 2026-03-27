export const getQueueAction = async () => ({ data: [] });
export const callTicketAction = async () => ({ data: null });
export const completeTicketAction = async () => ({ data: null });
export const cancelTicketAction = async () => ({ data: null });
export const toggleQueueOpenAction = async () => ({ data: null });
export const joinQueueAction = async () => ({ data: { ticketId: "mock-id", merchantId: "mock-merchant" } });
export const reportTicketNameAction = async () => ({ data: { id: "mock-id", customer_name: "Mocked", name_flagged: true } });
export const checkNameAction = async () => ({ isBanned: false });

const mock = {};
export default mock;
