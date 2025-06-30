-- V5__add_sale_percent_and_holiday_discount.sql
-- Add sale_percent to products table
-- Thêm cột sale_percent nếu chưa tồn tại (MySQL)
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'sale_percent');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN sale_percent DECIMAL(5,2);', 'SELECT 1;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Thêm cột is_featured nếu chưa tồn tại (MySQL)
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_featured');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;', 'SELECT 1;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create holidays table
CREATE TABLE holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);

-- Create product_holiday_discount table
CREATE TABLE product_holiday_discount (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    holiday_id INT NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (holiday_id) REFERENCES holidays(id)
);

-- Add a sample holiday

-- Add Vietnamese public holidays
INSERT INTO holidays (name, date) VALUES ('Tết Dương lịch', '2025-01-01');
INSERT INTO holidays (name, date) VALUES ('Tết Nguyên Đán', '2025-01-29'); -- Ngày mùng 1 Tết 2025
INSERT INTO holidays (name, date) VALUES ('Tết Nguyên Đán', '2025-01-30'); -- Mùng 2 Tết
INSERT INTO holidays (name, date) VALUES ('Tết Nguyên Đán', '2025-01-31'); -- Mùng 3 Tết
INSERT INTO holidays (name, date) VALUES ('Giỗ Tổ Hùng Vương', '2025-04-10');
INSERT INTO holidays (name, date) VALUES ('Ngày Giải phóng miền Nam', '2025-04-30');
INSERT INTO holidays (name, date) VALUES ('Ngày Quốc tế Lao động', '2025-05-01');
INSERT INTO holidays (name, date) VALUES ('Quốc khánh', '2025-09-02');

-- Add sample product holiday discounts for Vietnamese holidays
-- Giả sử các sản phẩm có id từ 1 đến 3
INSERT INTO product_holiday_discount (product_id, holiday_id, discount_percent) VALUES (1, 1, 10.00); -- Tết Dương lịch
INSERT INTO product_holiday_discount (product_id, holiday_id, discount_percent) VALUES (2, 2, 15.00); -- Tết Nguyên Đán mùng 1
INSERT INTO product_holiday_discount (product_id, holiday_id, discount_percent) VALUES (3, 3, 20.00); -- Tết Nguyên Đán mùng 2
INSERT INTO product_holiday_discount (product_id, holiday_id, discount_percent) VALUES (1, 4, 25.00); -- Tết Nguyên Đán mùng 3
INSERT INTO product_holiday_discount (product_id, holiday_id, discount_percent) VALUES (2, 5, 12.00); -- Giỗ Tổ Hùng Vương
INSERT INTO product_holiday_discount (product_id, holiday_id, discount_percent) VALUES (3, 6, 18.00); -- 30/4
INSERT INTO product_holiday_discount (product_id, holiday_id, discount_percent) VALUES (1, 7, 10.00); -- 1/5
INSERT INTO product_holiday_discount (product_id, holiday_id, discount_percent) VALUES (2, 8, 30.00); -- Quốc khánh

-- Cập nhật sale_percent và is_featured cho 50 sản phẩm mẫu
UPDATE products SET sale_percent = 10.00, is_featured = TRUE WHERE id = 1;
UPDATE products SET sale_percent = 15.00, is_featured = FALSE WHERE id = 2;
UPDATE products SET sale_percent = 20.00, is_featured = TRUE WHERE id = 3;
UPDATE products SET sale_percent = 5.00, is_featured = FALSE WHERE id = 4;
UPDATE products SET sale_percent = 12.50, is_featured = TRUE WHERE id = 5;
UPDATE products SET sale_percent = 8.00, is_featured = FALSE WHERE id = 6;
UPDATE products SET sale_percent = 18.00, is_featured = TRUE WHERE id = 7;
UPDATE products SET sale_percent = 0.00, is_featured = FALSE WHERE id = 8;
UPDATE products SET sale_percent = 25.00, is_featured = TRUE WHERE id = 9;
UPDATE products SET sale_percent = 7.00, is_featured = FALSE WHERE id = 10;
UPDATE products SET sale_percent = 13.00, is_featured = TRUE WHERE id = 11;
UPDATE products SET sale_percent = 9.00, is_featured = FALSE WHERE id = 12;
UPDATE products SET sale_percent = 22.00, is_featured = TRUE WHERE id = 13;
UPDATE products SET sale_percent = 6.00, is_featured = FALSE WHERE id = 14;
UPDATE products SET sale_percent = 11.00, is_featured = TRUE WHERE id = 15;
UPDATE products SET sale_percent = 14.00, is_featured = FALSE WHERE id = 16;
UPDATE products SET sale_percent = 19.00, is_featured = TRUE WHERE id = 17;
UPDATE products SET sale_percent = 3.00, is_featured = FALSE WHERE id = 18;
UPDATE products SET sale_percent = 16.00, is_featured = TRUE WHERE id = 19;
UPDATE products SET sale_percent = 4.00, is_featured = FALSE WHERE id = 20;
UPDATE products SET sale_percent = 21.00, is_featured = TRUE WHERE id = 21;
UPDATE products SET sale_percent = 2.00, is_featured = FALSE WHERE id = 22;
UPDATE products SET sale_percent = 17.00, is_featured = TRUE WHERE id = 23;
UPDATE products SET sale_percent = 1.00, is_featured = FALSE WHERE id = 24;
UPDATE products SET sale_percent = 23.00, is_featured = TRUE WHERE id = 25;
UPDATE products SET sale_percent = 24.00, is_featured = FALSE WHERE id = 26;
UPDATE products SET sale_percent = 26.00, is_featured = TRUE WHERE id = 27;
UPDATE products SET sale_percent = 27.00, is_featured = FALSE WHERE id = 28;
UPDATE products SET sale_percent = 28.00, is_featured = TRUE WHERE id = 29;
UPDATE products SET sale_percent = 29.00, is_featured = FALSE WHERE id = 30;
UPDATE products SET sale_percent = 30.00, is_featured = TRUE WHERE id = 31;
UPDATE products SET sale_percent = 31.00, is_featured = FALSE WHERE id = 32;
UPDATE products SET sale_percent = 32.00, is_featured = TRUE WHERE id = 33;
UPDATE products SET sale_percent = 33.00, is_featured = FALSE WHERE id = 34;
UPDATE products SET sale_percent = 34.00, is_featured = TRUE WHERE id = 35;
UPDATE products SET sale_percent = 35.00, is_featured = FALSE WHERE id = 36;
UPDATE products SET sale_percent = 36.00, is_featured = TRUE WHERE id = 37;
UPDATE products SET sale_percent = 37.00, is_featured = FALSE WHERE id = 38;
UPDATE products SET sale_percent = 38.00, is_featured = TRUE WHERE id = 39;
UPDATE products SET sale_percent = 39.00, is_featured = FALSE WHERE id = 40;
UPDATE products SET sale_percent = 40.00, is_featured = TRUE WHERE id = 41;
UPDATE products SET sale_percent = 41.00, is_featured = FALSE WHERE id = 42;
UPDATE products SET sale_percent = 42.00, is_featured = TRUE WHERE id = 43;
UPDATE products SET sale_percent = 43.00, is_featured = FALSE WHERE id = 44;
UPDATE products SET sale_percent = 44.00, is_featured = TRUE WHERE id = 45;
UPDATE products SET sale_percent = 45.00, is_featured = FALSE WHERE id = 46;
UPDATE products SET sale_percent = 46.00, is_featured = TRUE WHERE id = 47;
UPDATE products SET sale_percent = 47.00, is_featured = FALSE WHERE id = 48;
UPDATE products SET sale_percent = 48.00, is_featured = TRUE WHERE id = 49;
UPDATE products SET sale_percent = 49.00, is_featured = FALSE WHERE id = 50;
UPDATE products SET sale_percent = 50.00, is_featured = TRUE WHERE id = 51;
UPDATE products SET sale_percent = 51.00, is_featured = FALSE WHERE id = 52;
UPDATE products SET sale_percent = 52.00, is_featured = TRUE WHERE id = 53;
UPDATE products SET sale_percent = 53.00, is_featured = FALSE WHERE id = 54;
UPDATE products SET sale_percent = 54.00, is_featured = TRUE WHERE id = 55;
UPDATE products SET sale_percent = 55.00, is_featured = FALSE WHERE id = 56;
UPDATE products SET sale_percent = 56.00, is_featured = TRUE WHERE id = 57;
UPDATE products SET sale_percent = 57.00, is_featured = FALSE WHERE id = 58;
UPDATE products SET sale_percent = 58.00, is_featured = TRUE WHERE id = 59;
UPDATE products SET sale_percent = 59.00, is_featured = FALSE WHERE id = 60;
UPDATE products SET sale_percent = 60.00, is_featured = TRUE WHERE id = 61;
UPDATE products SET sale_percent = 61.00, is_featured = FALSE WHERE id = 62;
UPDATE products SET sale_percent = 62.00, is_featured = TRUE WHERE id = 63;
UPDATE products SET sale_percent = 63.00, is_featured = FALSE WHERE id = 64;
UPDATE products SET sale_percent = 64.00, is_featured = TRUE WHERE id = 65;
UPDATE products SET sale_percent = 65.00, is_featured = FALSE WHERE id = 66;
UPDATE products SET sale_percent = 66.00, is_featured = TRUE WHERE id = 67;
UPDATE products SET sale_percent = 67.00, is_featured = FALSE WHERE id = 68;
UPDATE products SET sale_percent = 68.00, is_featured = TRUE WHERE id = 69;
UPDATE products SET sale_percent = 69.00, is_featured = FALSE WHERE id = 70;
UPDATE products SET sale_percent = 70.00, is_featured = TRUE WHERE id = 71;
UPDATE products SET sale_percent = 71.00, is_featured = FALSE WHERE id = 72;
UPDATE products SET sale_percent = 72.00, is_featured = TRUE WHERE id = 73;
UPDATE products SET sale_percent = 73.00, is_featured = FALSE WHERE id = 74;
UPDATE products SET sale_percent = 74.00, is_featured = TRUE WHERE id = 75;
UPDATE products SET sale_percent = 75.00, is_featured = FALSE WHERE id = 76;
UPDATE products SET sale_percent = 76.00, is_featured = TRUE WHERE id = 77;
UPDATE products SET sale_percent = 77.00, is_featured = FALSE WHERE id = 78;
UPDATE products SET sale_percent = 78.00, is_featured = TRUE WHERE id = 79;
UPDATE products SET sale_percent = 79.00, is_featured = FALSE WHERE id = 80;
UPDATE products SET sale_percent = 80.00, is_featured = TRUE WHERE id = 81;
UPDATE products SET sale_percent = 81.00, is_featured = FALSE WHERE id = 82;
UPDATE products SET sale_percent = 82.00, is_featured = TRUE WHERE id = 83;
UPDATE products SET sale_percent = 83.00, is_featured = FALSE WHERE id = 84;
UPDATE products SET sale_percent = 84.00, is_featured = TRUE WHERE id = 85;
UPDATE products SET sale_percent = 85.00, is_featured = FALSE WHERE id = 86;
UPDATE products SET sale_percent = 86.00, is_featured = TRUE WHERE id = 87;
UPDATE products SET sale_percent = 87.00, is_featured = FALSE WHERE id = 88;
UPDATE products SET sale_percent = 88.00, is_featured = TRUE WHERE id = 89;
UPDATE products SET sale_percent = 89.00, is_featured = FALSE WHERE id = 90;
UPDATE products SET sale_percent = 90.00, is_featured = TRUE WHERE id = 91;
UPDATE products SET sale_percent = 91.00, is_featured = FALSE WHERE id = 92;
UPDATE products SET sale_percent = 92.00, is_featured = TRUE WHERE id = 93;
UPDATE products SET sale_percent = 93.00, is_featured = FALSE WHERE id = 94;
UPDATE products SET sale_percent = 94.00, is_featured = TRUE WHERE id = 95;
UPDATE products SET sale_percent = 95.00, is_featured = FALSE WHERE id = 96;
UPDATE products SET sale_percent = 96.00, is_featured = TRUE WHERE id = 97;
UPDATE products SET sale_percent = 97.00, is_featured = FALSE WHERE id = 98;
UPDATE products SET sale_percent = 98.00, is_featured = TRUE WHERE id = 99;
UPDATE products SET sale_percent = 99.00, is_featured = FALSE WHERE id = 100;
