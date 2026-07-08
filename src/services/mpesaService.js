import axios from 'axios';
import logger from '../utils/logger.js';

const SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';

// Token cache keyed by businessId — each business has its own Daraja app now
const tokenCache = new Map(); // businessId -> { token, expiresAt }

function baseUrlFor(env) {
    return env === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

async function getAccessToken(businessId, { env, consumerKey, consumerSecret }) {
    const cached = tokenCache.get(businessId);
    if (cached && Date.now() < cached.expiresAt) {
        return cached.token;
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const { data } = await axios.get(
        `${baseUrlFor(env)}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${auth}` } }
    );

    const expiresAt = Date.now() + (Number(data.expires_in || 3600) - 300) * 1000;
    tokenCache.set(businessId, { token: data.access_token, expiresAt });

    return data.access_token;
}

function formatTimestamp() {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

function formatPhone(rawPhone) {
    let phone = String(rawPhone).replace(/\s+/g, '').replace(/^\+/, '');
    if (phone.startsWith('0')) phone = `254${phone.slice(1)}`;
    else if (phone.startsWith('7') || phone.startsWith('1')) phone = `254${phone}`;
    return phone;
}

// credentials: { env, shortcode, consumerKey, consumerSecret, passkey } — from businessesService.getDecryptedMpesaCredentials
async function initiateStkPush({ businessId, credentials, callbackUrl, phone, amount, accountRef, description }) {
    const { env, shortcode, consumerKey, consumerSecret, passkey } = credentials;
    const token = await getAccessToken(businessId, { env, consumerKey, consumerSecret });
    const timestamp = formatTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formatPhone(phone),
        PartyB: shortcode,
        PhoneNumber: formatPhone(phone),
        CallBackURL: callbackUrl,
        AccountReference: String(accountRef).slice(0, 12),
        TransactionDesc: String(description).slice(0, 13),
    };

    try {
        const { data } = await axios.post(
            `${baseUrlFor(env)}/mpesa/stkpush/v1/processrequest`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (error) {
        logger.error('STK push request failed', {
            businessId,
            error: error.response?.data || error.message
        });
        throw error;
    }
}

export { initiateStkPush, formatPhone };
