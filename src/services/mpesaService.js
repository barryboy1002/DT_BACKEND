import axios from 'axios';
import logger from '../utils/logger.js';

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const { data } = await axios.get(
        `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${auth}` } }
    );

    cachedToken = data.access_token;
    // Refresh 5 minutes before actual expiry to avoid edge-of-expiry failures
    tokenExpiresAt = Date.now() + (Number(data.expires_in || 3600) - 300) * 1000;

    return cachedToken;
}

function formatTimestamp() {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

// Normalizes 07XXXXXXXX / 7XXXXXXXX / +254XXXXXXXXX into 254XXXXXXXXX
function formatPhone(rawPhone) {
    let phone = String(rawPhone).replace(/\s+/g, '').replace(/^\+/, '');
    if (phone.startsWith('0')) phone = `254${phone.slice(1)}`;
    else if (phone.startsWith('7') || phone.startsWith('1')) phone = `254${phone}`;
    return phone;
}

async function initiateStkPush({ phone, amount, accountRef, description }) {
    const token = await getAccessToken();
    const timestamp = formatTimestamp();
    const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const payload = {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formatPhone(phone),
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formatPhone(phone),
        CallBackURL: `${process.env.APP_BASE_URL}/mpesa/callback`,
        AccountReference: String(accountRef).slice(0, 12),
        TransactionDesc: String(description).slice(0, 13),
    };

    try {
        const { data } = await axios.post(
            `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data; // { MerchantRequestID, CheckoutRequestID, ResponseCode, ResponseDescription, ... }
    } catch (error) {
        logger.error('STK push request failed', {
            error: error.response?.data || error.message
        });
        throw error;
    }
}

export { initiateStkPush, formatPhone, getAccessToken };
