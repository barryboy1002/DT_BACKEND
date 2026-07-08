import crypto from 'crypto';

// Requires a 32-byte key. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// then set ENCRYPTION_KEY=<that hex string> in ecosystem.config.cjs
const ALGORITHM = 'aes-256-gcm';

function getKey() {
    const hex = process.env.ENCRYPTION_KEY;
    if (!hex || hex.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes)');
    }
    return Buffer.from(hex, 'hex');
}

function encrypt(plainText) {
    if (plainText === null || plainText === undefined || plainText === '') return null;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // store iv:authTag:ciphertext, all hex, colon-separated
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(payload) {
    if (!payload) return null;
    const [ivHex, authTagHex, dataHex] = payload.split(':');
    if (!ivHex || !authTagHex || !dataHex) return null;
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, 'hex')),
        decipher.final()
    ]);
    return decrypted.toString('utf8');
}

export { encrypt, decrypt };
