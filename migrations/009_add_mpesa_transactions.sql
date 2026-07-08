CREATE TYPE mpesa_status AS ENUM ('pending', 'success', 'failed', 'cancelled');

CREATE TABLE mpesa_transactions (
    transaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(business_id),
    branch_id UUID REFERENCES branches(branch_id) ON DELETE SET NULL,
    initiated_by UUID NOT NULL REFERENCES users(user_id),
    checkout_request_id VARCHAR(100) NOT NULL UNIQUE,
    merchant_request_id VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status mpesa_status NOT NULL DEFAULT 'pending',
    mpesa_receipt_number VARCHAR(50),
    result_desc TEXT,
    sale_id INT REFERENCES sales(sale_id),
    sale_payload JSONB NOT NULL, -- {items, customer_name} to create the sale on success
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mpesa_checkout_request ON mpesa_transactions(checkout_request_id);
