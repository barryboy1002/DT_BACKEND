import { query } from "../db/index.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { AppError } from "../errors/AppError.js";

// Returns settings with secrets masked — safe to send to the frontend
async function getMpesaSettingsService(businessId) {
    const res = await query(
        `SELECT mpesa_enabled, mpesa_env, mpesa_shortcode, mpesa_updated_at,
                (mpesa_consumer_key_enc IS NOT NULL) AS has_consumer_key,
                (mpesa_consumer_secret_enc IS NOT NULL) AS has_consumer_secret,
                (mpesa_passkey_enc IS NOT NULL) AS has_passkey
         FROM businesses WHERE business_id = $1`,
        [businessId]
    );
    if (!res.rowCount) throw new AppError("Business not found", 404);
    return res.rows[0];
}

// Owner submits/updates their Paybill credentials. Blank secret/key/passkey fields
// mean "keep the existing value" so the owner isn't forced to re-enter everything every edit.
async function updateMpesaSettingsService(businessId, data) {
    const { mpesa_enabled, mpesa_env, mpesa_shortcode, mpesa_consumer_key, mpesa_consumer_secret, mpesa_passkey } = data;

    if (mpesa_enabled) {
        const hasExisting = await query(
            `SELECT (mpesa_consumer_key_enc IS NOT NULL) AS has_key,
                    (mpesa_consumer_secret_enc IS NOT NULL) AS has_secret,
                    (mpesa_passkey_enc IS NOT NULL) AS has_passkey
             FROM businesses WHERE business_id = $1`,
            [businessId]
        );
        const existing = hasExisting.rows[0] || {};

        if (!mpesa_shortcode) {
            throw new AppError("Shortcode is required to enable M-Pesa", 400);
        }
        if (!mpesa_consumer_key && !existing.has_key) {
            throw new AppError("Consumer Key is required to enable M-Pesa", 400);
        }
        if (!mpesa_consumer_secret && !existing.has_secret) {
            throw new AppError("Consumer Secret is required to enable M-Pesa", 400);
        }
        if (!mpesa_passkey && !existing.has_passkey) {
            throw new AppError("Passkey is required to enable M-Pesa", 400);
        }
    }

    const fields = ['mpesa_enabled = $2', 'mpesa_env = $3', 'mpesa_shortcode = $4', 'mpesa_updated_at = NOW()'];
    const params = [businessId, Boolean(mpesa_enabled), mpesa_env || 'sandbox', mpesa_shortcode || null];
    let idx = 5;

    if (mpesa_consumer_key) {
        fields.push(`mpesa_consumer_key_enc = $${idx++}`);
        params.push(encrypt(mpesa_consumer_key));
    }
    if (mpesa_consumer_secret) {
        fields.push(`mpesa_consumer_secret_enc = $${idx++}`);
        params.push(encrypt(mpesa_consumer_secret));
    }
    if (mpesa_passkey) {
        fields.push(`mpesa_passkey_enc = $${idx++}`);
        params.push(encrypt(mpesa_passkey));
    }

    const res = await query(
        `UPDATE businesses SET ${fields.join(', ')} WHERE business_id = $1
         RETURNING mpesa_enabled, mpesa_env, mpesa_shortcode, mpesa_updated_at`,
        params
    );

    if (!res.rowCount) throw new AppError("Business not found", 404);
    return res.rows[0];
}

// Internal use only (mpesaService) — returns decrypted credentials, never exposed via API
async function getDecryptedMpesaCredentials(businessId) {
    const res = await query(
        `SELECT mpesa_enabled, mpesa_env, mpesa_shortcode,
                mpesa_consumer_key_enc, mpesa_consumer_secret_enc, mpesa_passkey_enc
         FROM businesses WHERE business_id = $1`,
        [businessId]
    );
    if (!res.rowCount) throw new AppError("Business not found", 404);

    const b = res.rows[0];
    if (!b.mpesa_enabled) {
        throw new AppError("M-Pesa is not enabled for this business. Set it up in Settings first.", 400);
    }
    if (!b.mpesa_shortcode || !b.mpesa_consumer_key_enc || !b.mpesa_consumer_secret_enc || !b.mpesa_passkey_enc) {
        throw new AppError("M-Pesa settings are incomplete. Please finish setup in Settings.", 400);
    }

    return {
        env: b.mpesa_env,
        shortcode: b.mpesa_shortcode,
        consumerKey: decrypt(b.mpesa_consumer_key_enc),
        consumerSecret: decrypt(b.mpesa_consumer_secret_enc),
        passkey: decrypt(b.mpesa_passkey_enc)
    };
}

export { getMpesaSettingsService, updateMpesaSettingsService, getDecryptedMpesaCredentials };
