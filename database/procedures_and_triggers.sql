-- =====================================================================
-- URATRO // STORED PROCEDURES & TRIGGERS
-- =====================================================================
USE smart_metro_db;

DROP PROCEDURE IF EXISTS sp_TapInPassenger;
DROP PROCEDURE IF EXISTS sp_TapOutPassenger;
DROP TRIGGER IF EXISTS trg_EmergencyIncident_AutoCascade;
DROP TRIGGER IF EXISTS trg_Maintenance_AutoRestore;

DELIMITER $$

-- 1. Tap-In Procedure
CREATE PROCEDURE sp_TapInPassenger(
    IN p_passenger_id INT,
    IN p_station_id INT,
    IN p_payment_method VARCHAR(50),
    OUT p_ticket_id INT,
    OUT p_status_code VARCHAR(20),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_balance DECIMAL(10,2);
    DECLARE v_active_ticket INT DEFAULT 0;
    DECLARE v_station_status VARCHAR(50);

    -- Check Station Status
    SELECT Status INTO v_station_status FROM Station WHERE Station_ID = p_station_id;
    IF v_station_status IS NULL THEN
        SET p_status_code = 'STATION_NOT_FOUND';
        SET p_message = 'Error: Station ID does not exist.';
        SET p_ticket_id = NULL;
    ELSEIF v_station_status != 'Operational' THEN
        SET p_status_code = 'STATION_CLOSED';
        SET p_message = CONCAT('Cannot tap in: Station status is ', v_station_status);
        SET p_ticket_id = NULL;
    ELSE
        -- Check if passenger already has an open journey
        SELECT Ticket_ID INTO v_active_ticket 
        FROM Ticket 
        WHERE Passenger_ID = p_passenger_id AND Exit_Time IS NULL 
        LIMIT 1;

        SELECT Card_Balance INTO v_balance FROM Passenger WHERE Passenger_ID = p_passenger_id FOR UPDATE;

        IF v_active_ticket > 0 THEN
            SET p_status_code = 'ALREADY_IN_TRANSIT';
            SET p_message = 'Passenger already has an ongoing journey. Tap out first.';
            SET p_ticket_id = v_active_ticket;
        ELSEIF v_balance < 20.00 AND p_payment_method = 'Smart Card' THEN
            SET p_status_code = 'INSUFFICIENT_FUNDS';
            SET p_message = CONCAT('Insufficient balance: ₹', v_balance, '. Minimum ₹20.00 required.');
            SET p_ticket_id = NULL;
        ELSE
            -- Create Ticket Record
            INSERT INTO Ticket (Passenger_ID, Entry_Station_ID, Entry_Time, Exit_Station_ID, Exit_Time, Fare, Payment_Method)
            VALUES (p_passenger_id, p_station_id, NOW(), NULL, NULL, 0.00, p_payment_method);
            
            SET p_ticket_id = LAST_INSERT_ID();
            SET p_status_code = 'TAP_IN_SUCCESS';
            SET p_message = 'Tap-in verified. Turnstile gate opened.';
        END IF;
    END IF;
END$$

-- 2. Tap-Out Procedure
CREATE PROCEDURE sp_TapOutPassenger(
    IN p_ticket_id INT,
    IN p_exit_station_id INT,
    OUT p_fare DECIMAL(8,2),
    OUT p_new_balance DECIMAL(10,2),
    OUT p_status_code VARCHAR(20),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_passenger_id INT;
    DECLARE v_entry_station_id INT;
    DECLARE v_station_hops INT DEFAULT 1;
    DECLARE v_calculated_fare DECIMAL(8,2) DEFAULT 10.00;
    DECLARE v_card_balance DECIMAL(10,2);
    DECLARE v_exit_time DATETIME;
    DECLARE v_payment_mode VARCHAR(50);

    START TRANSACTION;

    SELECT Passenger_ID, Entry_Station_ID, Exit_Time, Payment_Method 
    INTO v_passenger_id, v_entry_station_id, v_exit_time, v_payment_mode
    FROM Ticket 
    WHERE Ticket_ID = p_ticket_id FOR UPDATE;

    IF v_passenger_id IS NULL THEN
        SET p_status_code = 'TICKET_NOT_FOUND';
        SET p_message = 'Invalid Ticket ID.';
        ROLLBACK;
    ELSEIF v_exit_time IS NOT NULL THEN
        SET p_status_code = 'TICKET_ALREADY_CLOSED';
        SET p_message = 'Ticket has already completed transit.';
        ROLLBACK;
    ELSE
        -- Calculate station hops
        SET v_station_hops = ABS(p_exit_station_id - v_entry_station_id);
        IF v_station_hops = 0 THEN
            SET v_calculated_fare = 10.00;
        ELSE
            SET v_calculated_fare = LEAST(10.00 + (v_station_hops * 10.00), 60.00);
        END IF;

        SELECT Card_Balance INTO v_card_balance FROM Passenger WHERE Passenger_ID = v_passenger_id FOR UPDATE;

        IF v_payment_mode = 'Smart Card' THEN
            SET v_card_balance = v_card_balance - v_calculated_fare;
            UPDATE Passenger SET Card_Balance = v_card_balance WHERE Passenger_ID = v_passenger_id;
        END IF;

        UPDATE Ticket 
        SET Exit_Station_ID = p_exit_station_id,
            Exit_Time = NOW(),
            Fare = v_calculated_fare
        WHERE Ticket_ID = p_ticket_id;

        SET p_fare = v_calculated_fare;
        SET p_new_balance = v_card_balance;
        SET p_status_code = 'TAP_OUT_SUCCESS';
        SET p_message = CONCAT('Tap-out approved. Fare: ₹', v_calculated_fare, '. Remaining balance: ₹', v_card_balance);

        COMMIT;
    END IF;
END$$

-- 3. Autonomous Cascade Trigger on Emergency Incident
CREATE TRIGGER trg_EmergencyIncident_AutoCascade
AFTER INSERT ON Emergency_Incident
FOR EACH ROW
BEGIN
    IF NEW.Breakdown = TRUE OR NEW.Power = TRUE THEN
        UPDATE Metro 
        SET Current_Status = 'Under Maintenance' 
        WHERE Metro_ID = NEW.Metro_ID;
    END IF;

    IF NEW.Signal_Failure = TRUE OR NEW.Power = TRUE THEN
        UPDATE Track 
        SET Condition_Status = 'Critical Maintenance' 
        WHERE Track_ID = NEW.Track_ID;
    END IF;
END$$

-- 4. Autonomous Restore Trigger on Maintenance Job Completion
CREATE TRIGGER trg_Maintenance_AutoRestore
AFTER UPDATE ON Maintenance_Job
FOR EACH ROW
BEGIN
    DECLARE v_pending_jobs INT DEFAULT 0;

    IF NEW.Resolution_Status = 'Completed' AND OLD.Resolution_Status != 'Completed' THEN
        SELECT COUNT(*) INTO v_pending_jobs
        FROM Maintenance_Job
        WHERE Metro_ID = NEW.Metro_ID AND Resolution_Status != 'Completed';

        IF v_pending_jobs = 0 THEN
            UPDATE Metro SET Current_Status = 'Active' WHERE Metro_ID = NEW.Metro_ID;
        END IF;
    END IF;
END$$

DELIMITER ;
