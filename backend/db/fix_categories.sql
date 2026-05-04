-- ============================================================
-- FarmFresh - Add missing 'sweets' category
-- Run this in Oracle SQL Developer.
--
-- This script ensures the 'sweets' category exists in the
-- categories table, as some seeded products reference it.
-- ============================================================

DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM categories WHERE category_id = 'sweets';
  
  IF v_count = 0 THEN
    INSERT INTO categories (category_id, label, icon) 
    VALUES ('sweets', 'Sweets', 'gift-outline');
    DBMS_OUTPUT.PUT_LINE('✅ Category ''sweets'' added successfully.');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ℹ️ Category ''sweets'' already exists.');
  END IF;
  
  COMMIT;
END;
/
