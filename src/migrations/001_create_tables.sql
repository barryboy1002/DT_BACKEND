-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create ENUM types first
CREATE TYPE plan AS ENUM('paid', 'free');
CREATE TYPE movement_type AS ENUM ('sale','purchase','adjustment', 'spoilage', 'transfer');
CREATE TYPE pay_type AS ENUM ('cash', 'mpesa','credit');

-- Create businesses table (no dependencies)
CREATE TABLE businesses(
	business_id uuid DEFAULT gen_random_uuid(),
	name VARCHAR(200) NOT NULL,
	ac_status plan,
	phone VARCHAR(20),
	Email VARCHAR(120) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	PRIMARY KEY(business_id)
);

-- Create users table (depends on businesses)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(business_id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create categories table (depends on businesses)
CREATE TABLE categories(
	category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	business_id uuid REFERENCES businesses(business_id),
	name VARCHAR(100) NOT NULL
);

-- Create products table (depends on businesses and categories)
CREATE TABLE products(
	product_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	business_id uuid NOT NULL REFERENCES businesses(business_id),
	category_id INT  NOT NULL REFERENCES categories(category_id),
	name VARCHAR(200) NOT NULL,
	barcode VARCHAR(100) UNIQUE,
	buying_price DECIMAL(10,2) NOT NULL CHECK(buying_price >= 0),
	selling_price DECIMAL(10,2) NOT NULL CHECK(selling_price >= 0),
	brand VARCHAR(100),
	unit VARCHAR(50),
	low_stock_threshhold DECIMAL(10,2) NOT NULL CHECK(low_stock_threshhold >= 0),
	description TEXT,
	created_at TIMESTAMP DEFAULT NOW()
);

-- Create stock_movements table (depends on products and businesses)
CREATE TABLE stock_movements(
	movement_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	product_id INT NOT NULL REFERENCES  products(product_id),
	business_id uuid NOT NULL REFERENCES businesses(business_id),
	cause movement_type NOT NULL,
	quantity DECIMAL(10,2) NOT NULL, --positive=in negative=out
	note TEXT,
	date_time TIMESTAMP DEFAULT NOW(),
	CHECK (quantity <> 0),
	CHECK (
	    (cause = 'purchase' AND quantity > 0)
	    OR
	    (cause IN ('sale','spoilage') AND quantity < 0)
	    OR
	    (cause IN ('adjustment','transfer'))
	)
);

-- Create stock view (depends on stock_movements)
CREATE VIEW stock AS 
SELECT
	product_id,
	SUM(quantity) AS quantity
FROM stock_movements GROUP BY product_id;

-- Create sales table (depends on businesses)
CREATE TABLE sales(
	sale_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	business_id UUID NOT NULL REFERENCES businesses(business_id),
	customer_name VARCHAR(150),
	payment_method pay_type NOT NULL,
	receipt_number varchar(50) NOT NULL UNIQUE,
	receipt_url text,
	date_time TIMESTAMP DEFAULT NOW()
);

-- Create sale_items table (depends on sales and products)
CREATE TABLE sale_items(
	sale_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	sale_id INT NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
	product_id  INT NOT NULL REFERENCES products(product_id),
	quantity DECIMAL(10,2) NOT NULL,
	unit_price DECIMAL(10,2) NOT NULL
);

-- Create suppliers table (depends on businesses)
CREATE TABLE suppliers(
	supplier_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
	business_id uuid NOT NULL REFERENCES businesses (business_id),	
	name VARCHAR(200) NOT NULL,
	phone VARCHAR(20) NOT NULL,
	email VARCHAR (150) NOT NULL,
	payment_terms VARCHAR(100),
	created_at TIMESTAMP DEFAULT NOW()
);

-- Create purchases table (depends on suppliers and businesses)
CREATE TABLE purchases(
	purchases_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	supplier_id uuid NOT NULL REFERENCES suppliers(supplier_id),
	business_id uuid NOT NULL REFERENCES businesses(business_id),
	payment_method pay_type NOT NULL,
	date_ordered TIMESTAMP DEFAULT NOW(),
	date_arrived TIMESTAMP
);

-- Create purchase_items table (depends on purchases and products)
CREATE TABLE purchase_items(
	purchase_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	purchase_id INT NOT NULL REFERENCES purchases(purchases_id) ON DELETE CASCADE,
	product_id INT NOT NULL REFERENCES products(product_id),
	quantity DECIMAL(10,2) NOT NULL CHECK(quantity > 0),
	unit_price DECIMAL(10,2) NOT NULL CHECK(unit_price >= 0) 
);