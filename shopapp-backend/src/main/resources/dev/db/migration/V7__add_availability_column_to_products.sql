-- Flyway migration: add availability column to products
-- Works for MySQL 8+; default to 'IN_STOCK' and add a CHECK constraint to limit values

ALTER TABLE products
    ADD COLUMN availability VARCHAR(20) NOT NULL DEFAULT 'IN_STOCK';

ALTER TABLE products
    ADD CONSTRAINT chk_products_availability
        CHECK (availability IN ('IN_STOCK','OUT_OF_STOCK','PREORDER','DISCONTINUED'));

