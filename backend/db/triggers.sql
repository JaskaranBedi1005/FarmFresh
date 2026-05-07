-- ================================================================
-- FarmFresh — Triggers, Cursors & Stored Procedures
-- Database: Supabase (PostgreSQL)
--
-- RUN ORDER:
--   1. schema.sql   (creates tables)
--   2. triggers.sql (this file — creates functions & triggers)
--
-- All functions use PL/pgSQL.
-- Cursors are used wherever row-by-row processing is needed.
-- ================================================================


-- ================================================================
-- SECTION 1: AUTO-UPDATE `updated_at` TIMESTAMP
-- Tables: users, products, orders
-- ================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers first (safe re-run)
DROP TRIGGER IF EXISTS trg_users_updated_at    ON users;
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
DROP TRIGGER IF EXISTS trg_orders_updated_at   ON orders;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ================================================================
-- SECTION 2: STOCK GUARD — PREVENT NEGATIVE STOCK
-- Table: products
-- Fires BEFORE any UPDATE that touches the stock column.
-- ================================================================

CREATE OR REPLACE FUNCTION fn_stock_guard()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION
            'Stock cannot go negative. product_id=%, attempted stock=%',
            NEW.product_id, NEW.stock;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stock_guard ON products;

CREATE TRIGGER trg_stock_guard
    BEFORE UPDATE OF stock ON products
    FOR EACH ROW EXECUTE FUNCTION fn_stock_guard();


-- ================================================================
-- SECTION 3: RESTORE STOCK ON ORDER CANCELLATION  ← CURSOR USED
-- Table: orders (AFTER UPDATE of status)
-- When an order transitions to 'cancelled', iterates over every
-- order_item using a cursor and adds the quantity back to stock.
-- ================================================================

CREATE OR REPLACE FUNCTION fn_restore_stock_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
    -- CURSOR: fetch all items belonging to the cancelled order
    cur_order_items CURSOR FOR
        SELECT oi.product_id, oi.quantity
        FROM   order_items oi
        WHERE  oi.order_id = NEW.order_id;

    v_product_id INT;
    v_quantity   INT;
BEGIN
    -- Only act when status transitions TO 'cancelled'
    IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN

        OPEN cur_order_items;
        LOOP
            FETCH cur_order_items INTO v_product_id, v_quantity;
            EXIT WHEN NOT FOUND;

            -- Restore the stock for each product
            UPDATE products
            SET    stock = stock + v_quantity
            WHERE  product_id = v_product_id;

        END LOOP;
        CLOSE cur_order_items;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restore_stock_on_cancel ON orders;

CREATE TRIGGER trg_restore_stock_on_cancel
    AFTER UPDATE OF status ON orders
    FOR EACH ROW EXECUTE FUNCTION fn_restore_stock_on_cancel();


-- ================================================================
-- SECTION 4: LOG EVERY ORDER STATUS CHANGE
-- Table: orders (AFTER UPDATE of status)
-- Inserts one row into order_status_log per status change.
-- ================================================================

CREATE OR REPLACE FUNCTION fn_log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only write a log row if the status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_log (order_id, old_status, new_status)
        VALUES (NEW.order_id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_order_status_change ON orders;

CREATE TRIGGER trg_log_order_status_change
    AFTER UPDATE OF status ON orders
    FOR EACH ROW EXECUTE FUNCTION fn_log_order_status_change();


-- ================================================================
-- SECTION 5: FLAG LOW STOCK PRODUCTS
-- Table: products (AFTER UPDATE of stock)
-- Logs into low_stock_log when stock crosses DOWN through 5.
-- ================================================================

CREATE OR REPLACE FUNCTION fn_flag_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger only when stock drops FROM above 5 TO 5 or below
    IF NEW.stock <= 5 AND OLD.stock > 5 THEN
        INSERT INTO low_stock_log (product_id, product_name, farmer_id, stock_at_log)
        VALUES (NEW.product_id, NEW.name, NEW.farmer_id, NEW.stock);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flag_low_stock ON products;

CREATE TRIGGER trg_flag_low_stock
    AFTER UPDATE OF stock ON products
    FOR EACH ROW EXECUTE FUNCTION fn_flag_low_stock();


-- ================================================================
-- SECTION 6: RECALCULATE FARMER RATING              ← CURSOR USED
-- Table: products (AFTER UPDATE of rating / review_count)
-- Uses a parameterised cursor to compute a weighted average rating
-- across ALL of the farmer's active products, then updates users.
-- ================================================================

CREATE OR REPLACE FUNCTION fn_update_farmer_rating()
RETURNS TRIGGER AS $$
DECLARE
    -- Parameterised cursor — scoped to the affected farmer
    cur_products CURSOR (p_farmer_id INT) FOR
        SELECT rating, review_count
        FROM   products
        WHERE  farmer_id    = p_farmer_id
          AND  is_active    = 1
          AND  review_count > 0;

    v_rating        NUMERIC(3,1);
    v_review_count  INT;
    v_weighted_sum  NUMERIC := 0;
    v_total_reviews INT     := 0;
BEGIN
    OPEN cur_products(NEW.farmer_id);
    LOOP
        FETCH cur_products INTO v_rating, v_review_count;
        EXIT WHEN NOT FOUND;

        v_weighted_sum  := v_weighted_sum  + (v_rating * v_review_count);
        v_total_reviews := v_total_reviews + v_review_count;
    END LOOP;
    CLOSE cur_products;

    -- Only update if there are any reviews to average
    IF v_total_reviews > 0 THEN
        UPDATE users
        SET    rating       = ROUND((v_weighted_sum / v_total_reviews)::NUMERIC, 1),
               review_count = v_total_reviews
        WHERE  user_id = NEW.farmer_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_farmer_rating ON products;

CREATE TRIGGER trg_update_farmer_rating
    AFTER UPDATE OF rating, review_count ON products
    FOR EACH ROW EXECUTE FUNCTION fn_update_farmer_rating();


-- ================================================================
-- SECTION 7: BATCH LOW-STOCK SCAN (STORED PROCEDURE) ← CURSOR USED
-- Call manually from Supabase SQL Editor:
--     SELECT fn_scan_all_low_stock();
-- Iterates ALL active products with stock <= 5 and logs them
-- if not already logged today. Useful for daily cron/health checks.
-- ================================================================

CREATE OR REPLACE FUNCTION fn_scan_all_low_stock()
RETURNS void AS $$
DECLARE
    -- Cursor over every active product with critically low stock
    cur_low CURSOR FOR
        SELECT product_id, name, farmer_id, stock
        FROM   products
        WHERE  is_active = 1
          AND  stock     <= 5
        ORDER BY stock ASC;

    v_product_id   INT;
    v_product_name VARCHAR(200);
    v_farmer_id    INT;
    v_stock        INT;
    v_already_logged BOOLEAN;
BEGIN
    OPEN cur_low;
    LOOP
        FETCH cur_low INTO v_product_id, v_product_name, v_farmer_id, v_stock;
        EXIT WHEN NOT FOUND;

        -- Avoid duplicate log entries for the same day
        SELECT EXISTS (
            SELECT 1 FROM low_stock_log
            WHERE  product_id = v_product_id
              AND  DATE(logged_at) = CURRENT_DATE
        ) INTO v_already_logged;

        IF NOT v_already_logged THEN
            INSERT INTO low_stock_log (product_id, product_name, farmer_id, stock_at_log)
            VALUES (v_product_id, v_product_name, v_farmer_id, v_stock);
        END IF;

    END LOOP;
    CLOSE cur_low;
END;
$$ LANGUAGE plpgsql;


-- ================================================================
-- SECTION 8: VALIDATE ORDER STATUS TRANSITION
-- Table: orders (BEFORE UPDATE of status)
-- Enforces a legal state machine so status can never jump to an
-- invalid state (e.g. going from 'delivered' back to 'pending').
-- ================================================================

CREATE OR REPLACE FUNCTION fn_validate_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    -- Map of allowed next-statuses for each current status
    v_allowed_next TEXT[];
BEGIN
    CASE OLD.status
        WHEN 'pending'          THEN v_allowed_next := ARRAY['confirmed', 'cancelled'];
        WHEN 'confirmed'        THEN v_allowed_next := ARRAY['packed',    'cancelled'];
        WHEN 'packed'           THEN v_allowed_next := ARRAY['out_for_delivery', 'cancelled'];
        WHEN 'out_for_delivery' THEN v_allowed_next := ARRAY['delivered', 'cancelled'];
        WHEN 'delivered'        THEN v_allowed_next := ARRAY[]::TEXT[];   -- terminal state
        WHEN 'cancelled'        THEN v_allowed_next := ARRAY[]::TEXT[];   -- terminal state
        ELSE                         v_allowed_next := ARRAY[]::TEXT[];
    END CASE;

    IF NEW.status <> OLD.status AND NOT (NEW.status = ANY(v_allowed_next)) THEN
        RAISE EXCEPTION
            'Invalid status transition: "%" → "%" is not allowed for order_id=%',
            OLD.status, NEW.status, NEW.order_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_status_transition ON orders;

CREATE TRIGGER trg_validate_status_transition
    BEFORE UPDATE OF status ON orders
    FOR EACH ROW EXECUTE FUNCTION fn_validate_status_transition();


-- ================================================================
-- QUICK VERIFICATION QUERIES
-- Run these after applying triggers to confirm they were created.
-- ================================================================

-- List all triggers in the database
-- SELECT trigger_name, event_object_table, event_manipulation, action_timing
-- FROM   information_schema.triggers
-- WHERE  trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;

-- List all custom functions
-- SELECT routine_name, routine_type
-- FROM   information_schema.routines
-- WHERE  routine_schema = 'public'
-- ORDER BY routine_name;
