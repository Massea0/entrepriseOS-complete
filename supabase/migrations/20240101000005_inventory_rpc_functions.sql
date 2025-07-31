-- RPC function to process multiple stock movements in a transaction
CREATE OR REPLACE FUNCTION process_stock_movements(p_movements jsonb)
RETURNS jsonb AS $$
DECLARE
    v_movement jsonb;
    v_movement_id uuid;
    v_results jsonb[] := '{}';
    v_result jsonb;
BEGIN
    -- Process each movement
    FOR v_movement IN SELECT * FROM jsonb_array_elements(p_movements)
    LOOP
        -- Insert the movement
        INSERT INTO stock_movements (
            type,
            product_id,
            quantity,
            from_warehouse_id,
            from_position_id,
            to_warehouse_id,
            to_position_id,
            lot_number,
            serial_numbers,
            reference_type,
            reference_id,
            reason,
            cost,
            created_by,
            organization_id
        ) VALUES (
            (v_movement->>'type')::movement_type,
            (v_movement->>'productId')::uuid,
            (v_movement->>'quantity')::integer,
            (v_movement->>'fromWarehouseId')::uuid,
            (v_movement->>'fromPositionId')::uuid,
            (v_movement->>'toWarehouseId')::uuid,
            (v_movement->>'toPositionId')::uuid,
            v_movement->>'lotNumber',
            CASE 
                WHEN v_movement->'serialNumbers' IS NOT NULL 
                THEN ARRAY(SELECT jsonb_array_elements_text(v_movement->'serialNumbers'))
                ELSE NULL
            END,
            v_movement->>'reference_type',
            (v_movement->>'reference_id')::uuid,
            v_movement->>'reason',
            (v_movement->>'cost')::decimal,
            (v_movement->>'created_by')::uuid,
            (v_movement->>'organization_id')::uuid
        ) RETURNING id INTO v_movement_id;
        
        -- Build result
        v_result := jsonb_build_object(
            'id', v_movement_id,
            'success', true
        );
        
        v_results := array_append(v_results, v_result);
    END LOOP;
    
    RETURN jsonb_build_array(v_results);
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION process_stock_movements(jsonb) TO authenticated;