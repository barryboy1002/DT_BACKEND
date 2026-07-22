import { initiateStkPush } from "../services/mpesaService.js";
import { getDecryptedMpesaCredentials } from "../services/businessesService.js";
import {
    createPendingTransaction,
    getTransactionById,
    markTransactionFailed,
    markTransactionCancelled,
    completeTransactionAsSale
} from "../services/mpesaTransactionService.js";
import logger from "../utils/logger.js";

async function initiateMpesaSaleController(req, res, next) {
    const { businessId, branchId, userId } = req.user;
    const { items, phone, customer_name } = req.body;

    try {
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, error: 'items are required' });
        }
        if (!phone) {
            return res.status(400).json({ success: false, error: 'phone is required' });
        }

        // Throws a clear AppError if this business hasn't set up M-Pesa yet
        const credentials = await getDecryptedMpesaCredentials(businessId);

        const amount = items.reduce(
            (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
            0
        );

        const activeBranchId = branchId || req.body.branchId || null;

        const baseUrl = (process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

        const stkResponse = await initiateStkPush({
            businessId,
            credentials,
            callbackUrl: `${baseUrl}/mpesa/callback`,
            phone,
            amount,
            accountRef: `DUKA${Date.now().toString().slice(-8)}`,
            description: 'DukaTrack sale'
        });

        if (stkResponse.ResponseCode !== '0') {
            return res.status(422).json({
                success: false,
                error: stkResponse.ResponseDescription || 'STK push was not accepted'
            });
        }

        const transaction = await createPendingTransaction({
            businessId,
            branchId: activeBranchId,
            userId,
            phone,
            amount,
            checkoutRequestId: stkResponse.CheckoutRequestID,
            merchantRequestId: stkResponse.MerchantRequestID,
            salePayload: { items, customer_name: customer_name || null }
        });

        res.status(202).json({
            success: true,
            data: {
                transaction_id: transaction.transaction_id,
                checkout_request_id: transaction.checkout_request_id,
                status: transaction.status
            }
        });
    } catch (error) {
        next(error);
    }
}

async function mpesaCallbackController(req, res) {
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

    try {
        const stkCallback = req.body?.Body?.stkCallback;
        if (!stkCallback) return;

        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

        if (ResultCode === 0) {
            const items = CallbackMetadata?.Item || [];
            const getItem = (name) => items.find((i) => i.Name === name)?.Value;
            const mpesaReceiptNumber = getItem('MpesaReceiptNumber');

            await completeTransactionAsSale(CheckoutRequestID, {
                mpesaReceiptNumber,
                resultDesc: ResultDesc
            });
        } else if (ResultCode === 1032) {
            await markTransactionCancelled(CheckoutRequestID, ResultDesc);
        } else {
            await markTransactionFailed(CheckoutRequestID, ResultDesc);
        }
    } catch (error) {
        logger.error('Failed to process M-Pesa callback', { error: error.message, stack: error.stack });
    }
}

async function getMpesaTransactionStatusController(req, res, next) {
    const { businessId } = req.user;
    const { transactionId } = req.params;

    try {
        const transaction = await getTransactionById(transactionId, businessId);
        res.status(200).json({
            success: true,
            data: {
                transaction_id: transaction.transaction_id,
                status: transaction.status,
                sale_id: transaction.sale_id,
                mpesa_receipt_number: transaction.mpesa_receipt_number,
                result_desc: transaction.result_desc
            }
        });
    } catch (error) {
        next(error);
    }
}

export { initiateMpesaSaleController, mpesaCallbackController, getMpesaTransactionStatusController };
