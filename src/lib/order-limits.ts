// Checkout bounds shared by the API schema, the cart UI and the stock reservation
// RPC. Kept in one place so the client cannot exceed what the server accepts.

export const MAX_QUANTITY_PER_LINE = 20;
export const MAX_LINES_PER_ORDER = 50;