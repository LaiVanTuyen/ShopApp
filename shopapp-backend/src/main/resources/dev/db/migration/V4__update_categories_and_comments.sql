
-- =====================================================================
-- Sửa bảng 'categories': Thêm cột 'image' nếu chưa tồn tại
-- =====================================================================
SELECT COUNT(*)
INTO @columnCount
FROM INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'ShopApp' -- <-- Thay 'ShopApp' bằng tên database của bạn nếu cần
  AND TABLE_NAME = 'categories'
  AND COLUMN_NAME = 'image';

-- Nếu cột chưa tồn tại, tạo câu lệnh ALTER TABLE. Nếu đã tồn tại, dùng câu lệnh vô hại.
SET @alterStatement = IF(@columnCount = 0,
                         'ALTER TABLE `categories` ADD COLUMN `image` VARCHAR(255) NULL;',
                         'SELECT 1;');

-- Chuẩn bị và thực thi câu lệnh
PREPARE stmt FROM @alterStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- =====================================================================
-- Sửa bảng 'comments': Thêm cột 'rating' nếu chưa tồn tại
-- =====================================================================
SELECT COUNT(*)
INTO @columnCount
FROM INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'ShopApp' -- <-- Thay 'ShopApp' bằng tên database của bạn nếu cần
  AND TABLE_NAME = 'comments'
  AND COLUMN_NAME = 'rating';

-- Nếu cột chưa tồn tại, tạo câu lệnh ALTER TABLE. Nếu đã tồn tại, dùng câu lệnh vô hại.
SET @alterStatement = IF(@columnCount = 0,
                         'ALTER TABLE `comments` ADD COLUMN `rating` INT NULL;',
                         'SELECT 1;');

-- Chuẩn bị và thực thi câu lệnh
PREPARE stmt FROM @alterStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Dọn dẹp biến session
SET @columnCount = NULL;
SET @alterStatement = NULL;

UPDATE categories
SET
    name = CASE id
               WHEN 2 THEN 'Fresh Fruit'
               WHEN 3 THEN 'Dried Fruit'
               WHEN 4 THEN 'Vegetables'
               WHEN 5 THEN 'Drink Fruits'
               WHEN 6 THEN 'Meat'
        END,
    image = CASE id
                WHEN 2 THEN 'cat-1.jpg'
                WHEN 3 THEN 'cat-2.jpg'
                WHEN 4 THEN 'cat-3.jpg'
                WHEN 5 THEN 'cat-4.jpg'
                WHEN 6 THEN 'cat-5.jpg'
        END
WHERE
    id IN (2, 3, 4, 5, 6);


-- =====================================================================
-- Tối ưu hóa: Thêm chỉ mục (index) cho các cột khóa ngoại.
-- Việc này giúp tăng tốc độ truy vấn, đặc biệt là các phép JOIN.
-- Script sẽ kiểm tra và chỉ thêm nếu chỉ mục chưa tồn tại.
-- =====================================================================

-- 1. Bảng `products` - Chỉ mục cho `category_id`
SELECT COUNT(1) INTO @idxExists FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ShopApp' AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_category_id';

SET @alterSql = IF(@idxExists = 0,
                   'ALTER TABLE `products` ADD INDEX `idx_products_category_id`(`category_id`);',
                   '');
PREPARE stmt FROM @alterSql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 2. Bảng `users` - Chỉ mục cho `role_id`
SELECT COUNT(1) INTO @idxExists FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ShopApp' AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_role_id';

SET @alterSql = IF(@idxExists = 0,
                   'ALTER TABLE `users` ADD INDEX `idx_users_role_id`(`role_id`);',
                   '');
PREPARE stmt FROM @alterSql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 3. Bảng `order_details` - Chỉ mục cho `order_id`
SELECT COUNT(1) INTO @idxExists FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ShopApp' AND TABLE_NAME = 'order_details' AND INDEX_NAME = 'idx_orderdetails_order_id';

SET @alterSql = IF(@idxExists = 0,
                   'ALTER TABLE `order_details` ADD INDEX `idx_orderdetails_order_id`(`order_id`);',
                   '');
PREPARE stmt FROM @alterSql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 4. Bảng `order_details` - Chỉ mục cho `product_id`
SELECT COUNT(1) INTO @idxExists FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ShopApp' AND TABLE_NAME = 'order_details' AND INDEX_NAME = 'idx_orderdetails_product_id';

SET @alterSql = IF(@idxExists = 0,
                   'ALTER TABLE `order_details` ADD INDEX `idx_orderdetails_product_id`(`product_id`);',
                   '');
PREPARE stmt FROM @alterSql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 5. Bảng `tokens` - Chỉ mục cho `user_id`
SELECT COUNT(1) INTO @idxExists FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ShopApp' AND TABLE_NAME = 'tokens' AND INDEX_NAME = 'idx_tokens_user_id';

SET @alterSql = IF(@idxExists = 0,
                   'ALTER TABLE `tokens` ADD INDEX `idx_tokens_user_id`(`user_id`);',
                   '');
PREPARE stmt FROM @alterSql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 6. Bảng `comments` - Chỉ mục cho `user_id`
SELECT COUNT(1) INTO @idxExists FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ShopApp' AND TABLE_NAME = 'comments' AND INDEX_NAME = 'idx_comments_user_id';

SET @alterSql = IF(@idxExists = 0,
                   'ALTER TABLE `comments` ADD INDEX `idx_comments_user_id`(`user_id`);',
                   '');
PREPARE stmt FROM @alterSql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 7. Bảng `comments` - Chỉ mục cho `product_id`
SELECT COUNT(1) INTO @idxExists FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ShopApp' AND TABLE_NAME = 'comments' AND INDEX_NAME = 'idx_comments_product_id';

SET @alterSql = IF(@idxExists = 0,
                   'ALTER TABLE `comments` ADD INDEX `idx_comments_product_id`(`product_id`);',
                   '');
PREPARE stmt FROM @alterSql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- Dọn dẹp các biến session
SET @alterSql = NULL;
SET @idxExists = NULL;