import { query } from "../db/index.js";
import { createSaleService } from "./salesServices.js";
import { AppError } from "../errors/AppError.js";

async function createPendingTransaction({
    businessId,
    branchId,
    userId,
    phone,
    amount,
    checkoutRequestId,
    merchantRequestId,
    salePayload
}) {
    const text = `
        INSERT INTO mpesa_transactions
            (business_id, branch_id, initiated_by, checkout_request_id, merchant_request_id, phone, amount, sale_payload)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING transaction_id, checkout_request_id, status
    `;
    const params = [
        businessId, branchId, userId, checkoutRequestId, merchantRequestId,
        phone, amount, JSON.stringify(salePayload)
    ];
    const res = await query(text, params);
    return res.rows[0];
}

async function getTransactionByCheckoutRequestId(checkoutRequestId) {
    const res = await query(
        `SELECT * FROM mpesa_transactions WHERE checkout_request_id = $1`,
        [checkoutRequestId]
    );
    return res.rows[0] || null;
}

async function getTransactionById(transactionId, businessId) {
    const res = await query(
        `SELECT * FROM mpesa_transactions WHERE transaction_id = $1 AND business_id = $2`,
        [transactionId, businessId]
    );
    if (!res.rowCount) {
        throw new AppError('Transaction not found', 404);
    }
    return res.rows[0];
}

async function markTransactionFailed(checkoutRequestId, resultDesc) {
    await query(
        `UPDATE mpesa_transactions
         SET status = 'failed', result_desc = $2, updated_at = NOW()
         WHERE checkout_request_id = $1 AND status = 'pending'`,
        [checkoutRequestId, resultDesc]
    );
}

async function markTransactionCancelled(checkoutRequestId, resultDesc) {
    await query(
        `UPDATE mpesa_transactions
         SET status = 'cancelled', result_desc = $2, updated_at = NOW()
         WHERE checkout_request_id = $1 AND status = 'pending'`,
        [checkoutRequestId, resultDesc]
    );
}

/**
 * Called from the Daraja callback on successful payment.
 * Atomically claims the pending transaction (so a retried callback from
 * Safaricom can't create the sale twice), then creates the real sale —
 * this is the point where record_sale fires and stock actually moves.
 */
async function completeTransactionAsSale(checkoutRequestId, { mpesaReceiptNumber, resultDesc }) {
    const claimRes = await query(
        `UPDATE mpesa_transactions
         SET status = 'processing', updated_at = NOW()
         WHERE checkout_request_id = $1 AND status = 'pending'
         RETURNING *`,
        [checkoutRequestId]
    );

    if (!claimRes.rowCount) {
        // Already processed (or unknown checkout id) — return current state, don't reprocess
        return getTransactionByCheckoutRequestId(checkoutRequestId);
    }

    const tx = claimRes.rows[0];
    const { business_id, branch_id, sale_payload } = tx;
    const { items, customer_name } = sale_payload;

    try {
        const sale = await createSaleService(business_id, items, 'mpesa', customer_name, branch_id);

        const updated = await query(
            `UPDATE mpesa_transactions
             SET status = 'success', mpesa_receipt_number = $2, result_desc = $3, sale_id = $4, updated_at = NOW()
             WHERE checkout_request_id = $1
             RETURNING *`,
            [checkoutRequestId, mpesaReceiptNumber, resultDesc, sale.sale_id]
        );

        return { ...updated.rows[0], sale };
    } catch (error) {
        // Money was taken but the sale couldn't be created (e.g. stock ran out
        // between initiate and confirm). Flag for manual reconciliation rather
        // than silently losing the payment record.
        await query(
            `UPDATE mpesa_transactions
             SET status = 'failed', result_desc = $2, mpesa_receipt_number = $3, updated_at = NOW()
             WHERE checkout_request_id = $1`,
            [checkoutRequestId, `Sale creation failed: ${error.message}`, mpesaReceiptNumber]
        );
        throw error;
    }
}

export {
    createPendingTransaction,
    getTransactionByCheckoutRequestId,
    getTransactionById,
    markTransactionFailed,
    markTransactionCancelled,
    completeTransactionAsSale
};
