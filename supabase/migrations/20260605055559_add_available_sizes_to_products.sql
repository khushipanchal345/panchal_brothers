ALTER TABLE products ADD COLUMN IF NOT EXISTS available_sizes integer[] DEFAULT '{}';

-- Backfill: derive available_sizes from existing inventory table
UPDATE products p
SET available_sizes = sub.sizes
FROM (
  SELECT product_id, array_agg(DISTINCT size::integer ORDER BY size::integer) AS sizes
  FROM inventory
  WHERE stock_quantity > 0
  GROUP BY product_id
) sub
WHERE p.id = sub.product_id;