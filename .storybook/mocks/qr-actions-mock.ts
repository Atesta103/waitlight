export const generateQrTokenAction = async () => ({ 
    data: { 
        nonce: "mock-nonce", 
        expiresAt: new Date(Date.now() + 30000).toISOString() 
    } 
});

const mock = {};
export default mock;
