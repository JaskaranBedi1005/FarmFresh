-- ============================================================
-- FarmFresh - Fix Sequences After Re-Seeding
-- Run this in Oracle SQL Developer if you get ORA-00001
-- (unique constraint violated) during registration.
--
-- This resets all sequences to start ABOVE the current max ID
-- in each table, preventing conflicts with seeded data.
-- ============================================================

DECLARE
  v_max_users    NUMBER;
  v_max_products NUMBER;
  v_max_orders   NUMBER;
  v_max_items    NUMBER;
  v_max_cart     NUMBER;
  v_max_addr     NUMBER;
BEGIN
  -- Get current max IDs (default to 0 if tables are empty)
  SELECT NVL(MAX(user_id),       0) INTO v_max_users    FROM users;
  SELECT NVL(MAX(product_id),    0) INTO v_max_products FROM products;
  SELECT NVL(MAX(order_id),      0) INTO v_max_orders   FROM orders;
  SELECT NVL(MAX(order_item_id), 0) INTO v_max_items    FROM order_items;
  SELECT NVL(MAX(cart_item_id),  0) INTO v_max_cart     FROM cart_items;
  SELECT NVL(MAX(address_id),    0) INTO v_max_addr     FROM user_addresses;

  -- Drop and recreate sequences starting ABOVE current max
  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_users';
  EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_users START WITH '
    || (v_max_users + 1) || ' INCREMENT BY 1 NOCACHE NOCYCLE';

  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_products';
  EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_products START WITH '
    || (v_max_products + 1) || ' INCREMENT BY 1 NOCACHE NOCYCLE';

  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_orders';
  EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_orders START WITH '
    || (v_max_orders + 1) || ' INCREMENT BY 1 NOCACHE NOCYCLE';

  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_order_items';
  EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_order_items START WITH '
    || (v_max_items + 1) || ' INCREMENT BY 1 NOCACHE NOCYCLE';

  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_cart_items';
  EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_cart_items START WITH '
    || (v_max_cart + 1) || ' INCREMENT BY 1 NOCACHE NOCYCLE';

  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_addresses';
  EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_addresses START WITH '
    || (v_max_addr + 1) || ' INCREMENT BY 1 NOCACHE NOCYCLE';

  DBMS_OUTPUT.PUT_LINE('✅ Sequences reset successfully:');
  DBMS_OUTPUT.PUT_LINE('   seq_users       → starts at ' || (v_max_users + 1));
  DBMS_OUTPUT.PUT_LINE('   seq_products    → starts at ' || (v_max_products + 1));
  DBMS_OUTPUT.PUT_LINE('   seq_orders      → starts at ' || (v_max_orders + 1));
  DBMS_OUTPUT.PUT_LINE('   seq_order_items → starts at ' || (v_max_items + 1));
  DBMS_OUTPUT.PUT_LINE('   seq_cart_items  → starts at ' || (v_max_cart + 1));
  DBMS_OUTPUT.PUT_LINE('   seq_addresses   → starts at ' || (v_max_addr + 1));
END;
/
