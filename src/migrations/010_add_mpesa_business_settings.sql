-- Migration: 010_add_mpesa_business_settings.sql

ALTER TABLE businesses
    ADD COLUMN mpesa_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN mpesa_env VARCHAR(10) NOT NULL DEFAULT 'sandbox', -- 'sandbox' | 'production'
    ADD COLUMN mpesa_shortcode VARCHAR(20),
    ADD COLUMN mpesa_consumer_key_enc TEXT,      -- encrypted at rest, see utils/encryption.js
    ADD COLUMN mpesa_consumer_secret_enc TEXT,   -- encrypted at rest
    ADD COLUMN mpesa_passkey_enc TEXT,           -- encrypted at rest
    ADD COLUMN mpesa_updated_at TIMESTAMP;
