-- Migration: 007_add_branches.sql

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
    branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add branch_id reference columns to other tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(branch_id) ON DELETE SET NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(branch_id) ON DELETE SET NULL;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(branch_id) ON DELETE SET NULL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(branch_id) ON DELETE SET NULL;
