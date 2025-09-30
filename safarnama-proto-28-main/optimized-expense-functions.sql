-- 🚀 OPTIMIZED EXPENSE DATABASE FUNCTIONS
-- These functions provide atomic operations for faster expense updates

-- Function to add expense and return new total in one operation
CREATE OR REPLACE FUNCTION add_expense_with_total(
    p_trip_id UUID,
    p_user_id UUID,
    p_description TEXT,
    p_amount DECIMAL(10,2),
    p_category TEXT,
    p_date TEXT,
    p_time TEXT
) RETURNS JSON AS $$
DECLARE
    new_expense_id UUID;
    new_total DECIMAL(10,2);
BEGIN
    -- Verify the trip belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM trips 
        WHERE id = p_trip_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Trip not found or access denied';
    END IF;

    -- Insert the expense
    INSERT INTO expenses (
        trip_id, user_id, description, amount, category, date, time
    ) VALUES (
        p_trip_id, p_user_id, p_description, p_amount, p_category, p_date, p_time
    ) RETURNING id INTO new_expense_id;

    -- Get the updated total (trigger should have updated it)
    SELECT total_expenses INTO new_total
    FROM trips
    WHERE id = p_trip_id;

    -- Return both expense ID and new total
    RETURN json_build_object(
        'expense_id', new_expense_id,
        'new_total', new_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update expense and return new total
CREATE OR REPLACE FUNCTION update_expense_with_total(
    p_expense_id UUID,
    p_user_id UUID,
    p_description TEXT DEFAULT NULL,
    p_amount DECIMAL(10,2) DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_date TEXT DEFAULT NULL,
    p_time TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    expense_trip_id UUID;
    new_total DECIMAL(10,2);
    updated_expense RECORD;
BEGIN
    -- Get the trip ID and verify ownership
    SELECT trip_id INTO expense_trip_id
    FROM expenses
    WHERE id = p_expense_id AND user_id = p_user_id;

    IF expense_trip_id IS NULL THEN
        RAISE EXCEPTION 'Expense not found or access denied';
    END IF;

    -- Update the expense with provided values
    UPDATE expenses
    SET 
        description = COALESCE(p_description, description),
        amount = COALESCE(p_amount, amount),
        category = COALESCE(p_category, category),
        date = COALESCE(p_date, date),
        time = COALESCE(p_time, time),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_expense_id AND user_id = p_user_id
    RETURNING * INTO updated_expense;

    -- Get the updated total (trigger should have updated it)
    SELECT total_expenses INTO new_total
    FROM trips
    WHERE id = expense_trip_id;

    -- Return expense details and new total
    RETURN json_build_object(
        'description', updated_expense.description,
        'amount', updated_expense.amount,
        'category', updated_expense.category,
        'date', updated_expense.date,
        'time', updated_expense.time,
        'new_total', new_total,
        'trip_id', expense_trip_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete expense and return new total
CREATE OR REPLACE FUNCTION delete_expense_with_total(
    p_expense_id UUID,
    p_user_id UUID
) RETURNS JSON AS $$
DECLARE
    expense_trip_id UUID;
    new_total DECIMAL(10,2);
BEGIN
    -- Get the trip ID and verify ownership before deletion
    SELECT trip_id INTO expense_trip_id
    FROM expenses
    WHERE id = p_expense_id AND user_id = p_user_id;

    IF expense_trip_id IS NULL THEN
        RAISE EXCEPTION 'Expense not found or access denied';
    END IF;

    -- Delete the expense
    DELETE FROM expenses
    WHERE id = p_expense_id AND user_id = p_user_id;

    -- Get the updated total (trigger should have updated it)
    SELECT total_expenses INTO new_total
    FROM trips
    WHERE id = expense_trip_id;

    -- Return new total and trip ID
    RETURN json_build_object(
        'new_total', new_total,
        'trip_id', expense_trip_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trip expenses with pagination and totals
CREATE OR REPLACE FUNCTION get_trip_expenses_with_stats(
    p_trip_id UUID,
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
    trip_total DECIMAL(10,2);
    expense_count INTEGER;
    expenses_data JSON;
BEGIN
    -- Verify trip ownership
    IF NOT EXISTS (
        SELECT 1 FROM trips 
        WHERE id = p_trip_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Trip not found or access denied';
    END IF;

    -- Get trip total and expense count
    SELECT 
        total_expenses,
        (SELECT COUNT(*) FROM expenses WHERE trip_id = p_trip_id AND user_id = p_user_id)
    INTO trip_total, expense_count
    FROM trips
    WHERE id = p_trip_id;

    -- Get paginated expenses
    SELECT json_agg(
        json_build_object(
            'id', id,
            'description', description,
            'amount', amount,
            'category', category,
            'date', date,
            'time', time,
            'created_at', created_at
        ) ORDER BY created_at DESC
    ) INTO expenses_data
    FROM (
        SELECT *
        FROM expenses
        WHERE trip_id = p_trip_id AND user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT p_limit OFFSET p_offset
    ) sub;

    -- Return comprehensive data
    RETURN json_build_object(
        'expenses', COALESCE(expenses_data, '[]'::json),
        'total_amount', trip_total,
        'total_count', expense_count,
        'limit', p_limit,
        'offset', p_offset,
        'has_more', expense_count > (p_offset + p_limit)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to batch add multiple expenses
CREATE OR REPLACE FUNCTION batch_add_expenses(
    p_trip_id UUID,
    p_user_id UUID,
    p_expenses JSON
) RETURNS JSON AS $$
DECLARE
    expense_item JSON;
    new_expense_id UUID;
    inserted_expenses JSON[] := '{}';
    new_total DECIMAL(10,2);
BEGIN
    -- Verify the trip belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM trips 
        WHERE id = p_trip_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Trip not found or access denied';
    END IF;

    -- Insert each expense
    FOR expense_item IN SELECT * FROM json_array_elements(p_expenses)
    LOOP
        INSERT INTO expenses (
            trip_id, user_id, description, amount, category, date, time
        ) VALUES (
            p_trip_id,
            p_user_id,
            expense_item->>'description',
            (expense_item->>'amount')::DECIMAL(10,2),
            expense_item->>'category',
            expense_item->>'date',
            expense_item->>'time'
        ) RETURNING id INTO new_expense_id;

        -- Add to results array
        inserted_expenses := inserted_expenses || json_build_object(
            'id', new_expense_id,
            'description', expense_item->>'description',
            'amount', (expense_item->>'amount')::DECIMAL(10,2),
            'category', expense_item->>'category',
            'date', expense_item->>'date',
            'time', expense_item->>'time'
        );
    END LOOP;

    -- Get the updated total
    SELECT total_expenses INTO new_total
    FROM trips
    WHERE id = p_trip_id;

    -- Return results
    RETURN json_build_object(
        'expenses', array_to_json(inserted_expenses),
        'new_total', new_total,
        'count', array_length(inserted_expenses, 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expense statistics by category
CREATE OR REPLACE FUNCTION get_expense_stats_by_category(
    p_trip_id UUID,
    p_user_id UUID
) RETURNS JSON AS $$
DECLARE
    stats_data JSON;
BEGIN
    -- Verify trip ownership
    IF NOT EXISTS (
        SELECT 1 FROM trips 
        WHERE id = p_trip_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Trip not found or access denied';
    END IF;

    -- Get category statistics
    SELECT json_agg(
        json_build_object(
            'category', category,
            'total_amount', total_amount,
            'count', expense_count,
            'avg_amount', avg_amount
        )
    ) INTO stats_data
    FROM (
        SELECT 
            category,
            SUM(amount) as total_amount,
            COUNT(*) as expense_count,
            ROUND(AVG(amount), 2) as avg_amount
        FROM expenses
        WHERE trip_id = p_trip_id AND user_id = p_user_id
        GROUP BY category
        ORDER BY total_amount DESC
    ) sub;

    RETURN COALESCE(stats_data, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance if they don't exist
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_trip_user 
ON expenses(trip_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_created_at 
ON expenses(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_category 
ON expenses(category) WHERE category IS NOT NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🚀 Optimized expense functions created successfully!';
    RAISE NOTICE '⚡ Functions available:';
    RAISE NOTICE '   - add_expense_with_total()';
    RAISE NOTICE '   - update_expense_with_total()';
    RAISE NOTICE '   - delete_expense_with_total()';
    RAISE NOTICE '   - get_trip_expenses_with_stats()';
    RAISE NOTICE '   - batch_add_expenses()';
    RAISE NOTICE '   - get_expense_stats_by_category()';
    RAISE NOTICE '📈 Performance indexes created';
    RAISE NOTICE '🔐 Security policies enforced';
END $$;