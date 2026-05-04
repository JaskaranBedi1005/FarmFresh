CREATE OR REPLACE PACKAGE BODY farmfresh_pkg AS

  -- ── REGISTER USER ──────────────────────────────────────────────
  FUNCTION register_user(
    p_name     IN VARCHAR2,
    p_email    IN VARCHAR2,
    p_phone    IN VARCHAR2,
    p_password IN VARCHAR2,
    p_role     IN VARCHAR2,
    p_address  IN VARCHAR2 DEFAULT NULL,
    p_location IN VARCHAR2 DEFAULT NULL
  ) RETURN NUMBER IS
    v_user_id NUMBER;
    v_count   NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count FROM users WHERE phone = p_phone;
    IF v_count > 0 THEN
      RAISE_APPLICATION_ERROR(-20001, 'Phone number already registered');
    END IF;

    IF p_email IS NOT NULL THEN
      SELECT COUNT(*) INTO v_count FROM users WHERE email = p_email;
      IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Email already registered');
      END IF;
    END IF;

    v_user_id := seq_users.NEXTVAL;

    INSERT INTO users (user_id, name, email, phone, password_hash, role, address, location)
    VALUES (v_user_id, p_name, p_email, p_phone, p_password, p_role, p_address, p_location);

    COMMIT;
    RETURN v_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END register_user;

  -- ── LOGIN USER ─────────────────────────────────────────────────
  FUNCTION login_user(
    p_phone IN VARCHAR2,
    p_role  IN VARCHAR2
  ) RETURN SYS_REFCURSOR IS
    v_cursor SYS_REFCURSOR;
  BEGIN
    OPEN v_cursor FOR
      SELECT user_id, name, email, phone, role, avatar_url,
             address, location, about, years_of_experience,
             verified, rating, review_count, bank_account, upi_id,
             is_active, created_at
      FROM   users
      WHERE  phone = p_phone
        AND  role  = p_role
        AND  is_active = 1;
    RETURN v_cursor;
  END login_user;

  -- ── ADD PRODUCT ────────────────────────────────────────────────
  FUNCTION add_product(
    p_farmer_id   IN NUMBER,
    p_category_id IN VARCHAR2,
    p_name        IN VARCHAR2,
    p_description IN VARCHAR2,
    p_price       IN NUMBER,
    p_unit        IN VARCHAR2,
    p_stock       IN NUMBER,
    p_discount    IN NUMBER,
    p_image_url   IN VARCHAR2,
    p_tags        IN VARCHAR2
  ) RETURN NUMBER IS
    v_product_id NUMBER;
    v_role       VARCHAR2(10);
  BEGIN
    -- Verify user is a farmer
    SELECT role INTO v_role FROM users WHERE user_id = p_farmer_id;
    IF v_role != 'farmer' THEN
      RAISE_APPLICATION_ERROR(-20010, 'Only farmers can add products');
    END IF;

    v_product_id := seq_products.NEXTVAL;

    INSERT INTO products (
      product_id, farmer_id, category_id, name, description,
      price, unit, stock, discount, image_url, tags
    ) VALUES (
      v_product_id, p_farmer_id, p_category_id, p_name, p_description,
      p_price, p_unit, p_stock, p_discount, p_image_url, p_tags
    );

    COMMIT;
    RETURN v_product_id;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END add_product;

  -- ── UPDATE PRODUCT ─────────────────────────────────────────────
  PROCEDURE update_product(
    p_product_id  IN NUMBER,
    p_farmer_id   IN NUMBER,
    p_name        IN VARCHAR2,
    p_description IN VARCHAR2,
    p_price       IN NUMBER,
    p_unit        IN VARCHAR2,
    p_stock       IN NUMBER,
    p_discount    IN NUMBER,
    p_image_url   IN VARCHAR2,
    p_tags        IN VARCHAR2
  ) IS
    v_count NUMBER;
  BEGIN
    -- Verify ownership
    SELECT COUNT(*) INTO v_count
    FROM products
    WHERE product_id = p_product_id AND farmer_id = p_farmer_id;

    IF v_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20011, 'Product not found or unauthorized');
    END IF;

    UPDATE products
    SET name        = NVL(p_name, name),
        description = NVL(p_description, description),
        price       = NVL(p_price, price),
        unit        = NVL(p_unit, unit),
        stock       = NVL(p_stock, stock),
        discount    = NVL(p_discount, discount),
        image_url   = NVL(p_image_url, image_url),
        tags        = NVL(p_tags, tags),
        updated_at  = SYSDATE
    WHERE product_id = p_product_id;

    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END update_product;

  -- ── DELETE PRODUCT ─────────────────────────────────────────────
  PROCEDURE delete_product(
    p_product_id IN NUMBER,
    p_farmer_id  IN NUMBER
  ) IS
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count
    FROM products
    WHERE product_id = p_product_id AND farmer_id = p_farmer_id;

    IF v_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20012, 'Product not found or unauthorized');
    END IF;

    -- Soft delete
    UPDATE products
    SET is_active  = 0,
        updated_at = SYSDATE
    WHERE product_id = p_product_id;

    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END delete_product;

  -- ── GET PRODUCTS ───────────────────────────────────────────────
  FUNCTION get_products(
    p_category_id IN VARCHAR2 DEFAULT NULL,
    p_farmer_id   IN NUMBER   DEFAULT NULL,
    p_featured    IN NUMBER   DEFAULT NULL,
    p_search      IN VARCHAR2 DEFAULT NULL
  ) RETURN SYS_REFCURSOR IS
    v_cursor SYS_REFCURSOR;
  BEGIN
    OPEN v_cursor FOR
      SELECT p.product_id, p.name, p.category_id, p.farmer_id,
             NVL(u.name, 'Unknown Farmer') AS farmer_name, NVL(u.location, 'India') AS farmer_location,
             u.avatar_url AS farmer_avatar, NVL(u.verified, 0) AS farmer_verified,
             p.price, p.unit, p.stock, p.discount,
             p.image_url, p.featured, p.rating, p.review_count,
             p.description, p.tags, p.created_at
      FROM   products p
      LEFT JOIN users u ON u.user_id = p.farmer_id
      WHERE  p.is_active = 1
        AND  (p_category_id IS NULL OR p_category_id = 'all' OR p.category_id = p_category_id)
        AND  (p_farmer_id   IS NULL OR p.farmer_id   = p_farmer_id)
        AND  (p_featured    IS NULL OR p.featured     = p_featured)
        AND  (p_search      IS NULL
               OR UPPER(p.name)        LIKE '%' || UPPER(p_search) || '%'
               OR UPPER(p.description) LIKE '%' || UPPER(p_search) || '%'
               OR UPPER(p.tags)        LIKE '%' || UPPER(p_search) || '%')
      ORDER BY p.featured DESC, p.rating DESC, p.created_at DESC;
    RETURN v_cursor;
  END get_products;

  -- ── ADD TO CART ────────────────────────────────────────────────
  PROCEDURE add_to_cart(
    p_user_id    IN NUMBER,
    p_product_id IN NUMBER,
    p_quantity   IN NUMBER
  ) IS
    v_count NUMBER;
    v_stock NUMBER;
  BEGIN
    -- Check stock
    SELECT stock INTO v_stock FROM products WHERE product_id = p_product_id AND is_active = 1;
    IF v_stock < p_quantity THEN
      RAISE_APPLICATION_ERROR(-20020, 'Insufficient stock');
    END IF;

    -- Upsert cart
    SELECT COUNT(*) INTO v_count
    FROM cart_items
    WHERE user_id = p_user_id AND product_id = p_product_id;

    IF v_count > 0 THEN
      UPDATE cart_items
      SET quantity = quantity + p_quantity, added_at = SYSDATE
      WHERE user_id = p_user_id AND product_id = p_product_id;
    ELSE
      INSERT INTO cart_items (cart_item_id, user_id, product_id, quantity)
      VALUES (seq_cart_items.NEXTVAL, p_user_id, p_product_id, p_quantity);
    END IF;

    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END add_to_cart;

  -- ── UPDATE CART QUANTITY ───────────────────────────────────────
  PROCEDURE update_cart_quantity(
    p_user_id    IN NUMBER,
    p_product_id IN NUMBER,
    p_quantity   IN NUMBER
  ) IS
  BEGIN
    IF p_quantity <= 0 THEN
      DELETE FROM cart_items
      WHERE user_id = p_user_id AND product_id = p_product_id;
    ELSE
      UPDATE cart_items
      SET quantity = p_quantity, added_at = SYSDATE
      WHERE user_id = p_user_id AND product_id = p_product_id;
    END IF;
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END update_cart_quantity;

  -- ── REMOVE FROM CART ───────────────────────────────────────────
  PROCEDURE remove_from_cart(
    p_user_id    IN NUMBER,
    p_product_id IN NUMBER
  ) IS
  BEGIN
    DELETE FROM cart_items
    WHERE user_id = p_user_id AND product_id = p_product_id;
    COMMIT;
  END remove_from_cart;

  -- ── CLEAR CART ─────────────────────────────────────────────────
  PROCEDURE clear_cart(p_user_id IN NUMBER) IS
  BEGIN
    DELETE FROM cart_items WHERE user_id = p_user_id;
    COMMIT;
  END clear_cart;

  -- ── GET CART ───────────────────────────────────────────────────
  FUNCTION get_cart(p_user_id IN NUMBER) RETURN SYS_REFCURSOR IS
    v_cursor SYS_REFCURSOR;
  BEGIN
    OPEN v_cursor FOR
      SELECT ci.cart_item_id, ci.product_id, ci.quantity, ci.added_at,
             p.name, p.price, p.unit, p.discount, p.image_url, p.stock,
             p.farmer_id, NVL(u.name, 'Unknown Farmer') AS farmer_name,
             ROUND(p.price * (1 - p.discount/100), 2) AS effective_price,
             ROUND(p.price * (1 - p.discount/100) * ci.quantity, 2) AS line_total
      FROM   cart_items ci
      JOIN   products   p ON p.product_id = ci.product_id
      LEFT JOIN users   u ON u.user_id    = p.farmer_id
      WHERE  ci.user_id = p_user_id
        AND  p.is_active = 1
      ORDER BY ci.added_at DESC;
    RETURN v_cursor;
  END get_cart;

  -- ── PLACE ORDER ────────────────────────────────────────────────
  FUNCTION place_order(
    p_customer_id      IN NUMBER,
    p_delivery_address IN VARCHAR2,
    p_payment_mode     IN VARCHAR2,
    p_special_note     IN VARCHAR2 DEFAULT NULL
  ) RETURN NUMBER IS
    v_order_id      NUMBER;
    v_order_ref     VARCHAR2(20);
    v_subtotal      NUMBER := 0;
    v_delivery      NUMBER := 0;
    v_grand_total   NUMBER := 0;
    v_farmer_id     NUMBER;
    v_cart_count    NUMBER;
  BEGIN
    -- Check cart
    SELECT COUNT(*) INTO v_cart_count FROM cart_items WHERE user_id = p_customer_id;
    IF v_cart_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20030, 'Cart is empty');
    END IF;

    -- Calculate totals
    SELECT SUM(ROUND(p.price * (1 - p.discount/100), 2) * ci.quantity)
    INTO   v_subtotal
    FROM   cart_items ci
    JOIN   products   p ON p.product_id = ci.product_id
    WHERE  ci.user_id = p_customer_id AND p.is_active = 1;

    v_delivery    := CASE WHEN v_subtotal >= 200 THEN 0 ELSE 30 END;
    v_grand_total := v_subtotal + v_delivery;

    -- Assumes single farmer per order for simplicity
    SELECT p.farmer_id INTO v_farmer_id
    FROM   cart_items ci
    JOIN   products   p ON p.product_id = ci.product_id
    WHERE  ci.user_id = p_customer_id AND ROWNUM = 1;

    v_order_id  := seq_orders.NEXTVAL;
    v_order_ref := 'ORD' || LPAD(v_order_id, 6, '0');

    -- Insert order
    INSERT INTO orders (
      order_id, order_ref, customer_id, farmer_id,
      delivery_address, payment_mode, special_note,
      subtotal, delivery_charge, grand_total, status
    ) VALUES (
      v_order_id, v_order_ref, p_customer_id, v_farmer_id,
      p_delivery_address, p_payment_mode, p_special_note,
      v_subtotal, v_delivery, v_grand_total, 'confirmed'
    );

    -- Copy cart items into order_items & decrement stock
    FOR rec IN (
      SELECT ci.product_id, ci.quantity,
             p.name AS product_name, p.unit,
             ROUND(p.price * (1 - p.discount/100), 2) AS unit_price
      FROM   cart_items ci
      JOIN   products   p ON p.product_id = ci.product_id
      WHERE  ci.user_id = p_customer_id AND p.is_active = 1
    ) LOOP
      -- Verify stock once more
      DECLARE
        v_stock NUMBER;
      BEGIN
        SELECT stock INTO v_stock FROM products WHERE product_id = rec.product_id FOR UPDATE;
        IF v_stock < rec.quantity THEN
          ROLLBACK;
          RAISE_APPLICATION_ERROR(-20031, 'Insufficient stock for: ' || rec.product_name);
        END IF;

        -- Insert order item
        INSERT INTO order_items (order_item_id, order_id, product_id, product_name, quantity, unit_price, unit)
        VALUES (seq_order_items.NEXTVAL, v_order_id, rec.product_id, rec.product_name, rec.quantity, rec.unit_price, rec.unit);

        -- Decrement stock
        UPDATE products SET stock = stock - rec.quantity WHERE product_id = rec.product_id;
      END;
    END LOOP;

    -- Clear cart
    DELETE FROM cart_items WHERE user_id = p_customer_id;

    COMMIT;
    RETURN v_order_id;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END place_order;

  -- ── UPDATE ORDER STATUS ────────────────────────────────────────
  PROCEDURE update_order_status(
    p_order_id  IN NUMBER,
    p_status    IN VARCHAR2,
    p_farmer_id IN NUMBER DEFAULT NULL
  ) IS
    v_count NUMBER;
  BEGIN
    IF p_farmer_id IS NOT NULL THEN
      SELECT COUNT(*) INTO v_count FROM orders
      WHERE order_id = p_order_id AND farmer_id = p_farmer_id;
      IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20040, 'Order not found or unauthorized');
      END IF;
    END IF;

    UPDATE orders
    SET status     = p_status,
        updated_at = SYSDATE
    WHERE order_id = p_order_id;

    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END update_order_status;

  -- ── GET ORDERS ─────────────────────────────────────────────────
  FUNCTION get_orders(
    p_user_id IN NUMBER,
    p_role    IN VARCHAR2
  ) RETURN SYS_REFCURSOR IS
    v_cursor SYS_REFCURSOR;
  BEGIN
    IF p_role = 'customer' THEN
      OPEN v_cursor FOR
        SELECT o.order_id, o.order_ref, o.customer_id, o.farmer_id,
               o.delivery_address, o.payment_mode, o.special_note,
               o.subtotal, o.delivery_charge, o.grand_total,
               o.status, o.created_at, o.updated_at,
               uc.name AS customer_name,
               uf.name AS farmer_name
        FROM   orders o
        JOIN   users  uc ON uc.user_id = o.customer_id
        LEFT JOIN users uf ON uf.user_id = o.farmer_id
        WHERE  o.customer_id = p_user_id
        ORDER BY o.created_at DESC;
    ELSE
      OPEN v_cursor FOR
        SELECT o.order_id, o.order_ref, o.customer_id, o.farmer_id,
               o.delivery_address, o.payment_mode, o.special_note,
               o.subtotal, o.delivery_charge, o.grand_total,
               o.status, o.created_at, o.updated_at,
               uc.name AS customer_name,
               uf.name AS farmer_name
        FROM   orders o
        JOIN   users  uc ON uc.user_id = o.customer_id
        LEFT JOIN users uf ON uf.user_id = o.farmer_id
        WHERE  o.farmer_id = p_user_id
        ORDER BY o.created_at DESC;
    END IF;
    RETURN v_cursor;
  END get_orders;

  -- ── GET FARMER STATS ───────────────────────────────────────────
  FUNCTION get_farmer_stats(p_farmer_id IN NUMBER) RETURN SYS_REFCURSOR IS
    v_cursor SYS_REFCURSOR;
  BEGIN
    OPEN v_cursor FOR
      SELECT
        -- Today's stats
        (SELECT NVL(SUM(grand_total), 0) FROM orders
         WHERE farmer_id = p_farmer_id
           AND TRUNC(created_at) = TRUNC(SYSDATE)
           AND status != 'cancelled') AS today_sales,
        (SELECT COUNT(*) FROM orders
         WHERE farmer_id = p_farmer_id
           AND TRUNC(created_at) = TRUNC(SYSDATE)
           AND status != 'cancelled') AS today_orders,
        -- Monthly
        (SELECT NVL(SUM(grand_total), 0) FROM orders
         WHERE farmer_id = p_farmer_id
           AND TRUNC(created_at,'MM') = TRUNC(SYSDATE,'MM')
           AND status != 'cancelled') AS monthly_earnings,
        -- Pending
        (SELECT COUNT(*) FROM orders
         WHERE farmer_id = p_farmer_id
           AND status IN ('confirmed','packed')) AS pending_orders,
        -- Products
        (SELECT COUNT(*) FROM products WHERE farmer_id = p_farmer_id AND is_active = 1) AS total_products,
        (SELECT COUNT(*) FROM products WHERE farmer_id = p_farmer_id AND is_active = 1 AND stock < 10) AS low_stock
      FROM DUAL;
    RETURN v_cursor;
  END get_farmer_stats;

END farmfresh_pkg;
/
