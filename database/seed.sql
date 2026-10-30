-- =====================================================================
-- URATRO // SMART METRO DATABASE - EXTENDED SEED DATASET
-- =====================================================================
USE smart_metro_db;

-- Clear previous test data safely
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Maintenance_Engineer_Job;
TRUNCATE TABLE Maintenance_Job;
TRUNCATE TABLE Security_Incident;
TRUNCATE TABLE Emergency_Incident;
TRUNCATE TABLE Daily_Train_Schedule;
TRUNCATE TABLE Ticket;
TRUNCATE TABLE Track;
TRUNCATE TABLE Route_Station_Mapping;
TRUNCATE TABLE Route;
TRUNCATE TABLE Employee;
TRUNCATE TABLE Metro;
TRUNCATE TABLE Station;
TRUNCATE TABLE Passenger;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. PASSENGERS
INSERT INTO Passenger (Passenger_ID, Name, Contact, Card_Balance) VALUES
(1, 'Rahul Sharma', '9876543210', 450.00),
(2, 'Priya Singh', '9123456789', 1250.50),
(3, 'Amit Verma', '9988776655', 180.00),
(4, 'Sneha Gupta', '9811223344', 850.75),
(5, 'Vikram Malhotra', '9723456781', 340.00),
(6, 'Ananya Roy', '9654321890', 60.00),
(7, 'Rohan Kapoor', '9543210987', 920.00),
(8, 'Divya Nair', '9432109876', 500.00),
(9, 'Karan Joshi', '9321098765', 15.00),
(10, 'Meera Patel', '9210987654', 720.25);

-- 2. STATIONS (Jaipur Metro Grid with GPS Coordinates)
INSERT INTO Station (Station_ID, Name, Type, Status, GPS_Coordinates) VALUES
(1, 'Mansarovar', 'Terminal', 'Operational', '26.8500° N, 75.7600° E'),
(2, 'New Atish Market', 'Normal', 'Operational', '26.8620° N, 75.7680° E'),
(3, 'Vivek Vihar', 'Normal', 'Operational', '26.8740° N, 75.7760° E'),
(4, 'Shyam Nagar', 'Normal', 'Operational', '26.8850° N, 75.7820° E'),
(5, 'Civil Lines', 'Normal', 'Operational', '26.9010° N, 75.7920° E'),
(6, 'Railway Station', 'Interchange', 'Operational', '26.9200° N, 75.7980° E'),
(7, 'Sindhi Camp', 'Interchange', 'Operational', '26.9260° N, 75.8030° E'),
(8, 'Chandpole', 'Terminal', 'Operational', '26.9320° N, 75.8110° E'),
(9, 'Chhoti Chaupar', 'Normal', 'Operational', '26.9270° N, 75.8200° E'),
(10, 'Badi Chaupar', 'Terminal', 'Operational', '26.9240° N, 75.8280° E');

-- 3. METROS (Rolling Stock Rakes)
INSERT INTO Metro (Metro_ID, Model, Capacity, Mfg_Date, Current_Status) VALUES
(1, 'Alstom Metropolis 2020', 950, '2020-05-15', 'Active'),
(2, 'BEML Metro Series-2', 900, '2021-08-20', 'Active'),
(3, 'Alstom Metropolis 2023', 1000, '2023-01-10', 'Under Maintenance'),
(4, 'Hyundai Rotem Express', 1050, '2022-11-04', 'Active'),
(5, 'CRRC Vanguard 3000', 980, '2024-03-12', 'Active');

-- 4. EMPLOYEES
INSERT INTO Employee (Emp_ID, Name, Role, Shift) VALUES
(1, 'Rajesh Kumar', 'Driver', 'Morning'),
(2, 'Vikram Singh', 'Engineer', 'Evening'),
(3, 'Manoj Sharma', 'Security', 'Night'),
(4, 'Suresh Patel', 'Driver', 'Evening'),
(5, 'Aditi Rao', 'Station Master', 'Morning'),
(6, 'Deepak Verma', 'Engineer', 'Morning'),
(7, 'Harish Joshi', 'Driver', 'Night'),
(8, 'Kavita Sen', 'Security', 'Morning');

-- 5. ROUTES
INSERT INTO Route (Route_ID, Route_Name, Start_Station_ID, End_Station_ID) VALUES
(1, 'Pink Line (East-West Corridor)', 1, 10),
(2, 'Blue Line (North-South Connector)', 6, 8);

-- 6. ROUTE_STATION_MAPPING (Sequence Ordering)
INSERT INTO Route_Station_Mapping (Route_ID, Station_ID, Sequence_Number) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 4, 4),
(1, 5, 5),
(1, 6, 6),
(1, 7, 7),
(1, 8, 8),
(1, 9, 9),
(1, 10, 10),
(2, 6, 1),
(2, 7, 2),
(2, 8, 3);

-- 7. TRACKS
INSERT INTO Track (Track_ID, Route_ID, Length, Condition_Status) VALUES
(1, 1, 12.80, 'Good'),
(2, 1, 9.40, 'Good'),
(3, 2, 6.20, 'Needs Inspection'),
(4, 2, 4.50, 'Good');

-- 8. TICKETS (Historical & Active Commuter Journeys)
INSERT INTO Ticket (Ticket_ID, Passenger_ID, Entry_Station_ID, Exit_Station_ID, Entry_Time, Exit_Time, Fare, Payment_Method) VALUES
(1, 1, 1, 5, NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR - INTERVAL 38 MINUTE, 40.00, 'Smart Card'),
(2, 2, 2, 8, NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 3 HOUR - INTERVAL 25 MINUTE, 50.00, 'Smart Card'),
(3, 3, 6, 10, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR - INTERVAL 40 MINUTE, 40.00, 'Token'),
(4, 4, 1, 8, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR - INTERVAL 20 MINUTE, 50.00, 'Smart Card'),
(5, 5, 5, 7, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR - INTERVAL 45 MINUTE, 20.00, 'UPI'),
(6, 7, 1, 6, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 30 MINUTE, 40.00, 'Smart Card'),
(7, 8, 3, 7, NOW() - INTERVAL 45 MINUTE, NOW() - INTERVAL 15 MINUTE, 30.00, 'Smart Card'),
-- Active Journey (exit is null)
(8, 2, 1, NULL, NOW() - INTERVAL 12 MINUTE, NULL, 0.00, 'Smart Card');

-- 9. DAILY_TRAIN_SCHEDULE
INSERT INTO Daily_Train_Schedule (Schedule_ID, Metro_ID, Route_ID, Driver_Emp_ID, Date, Shift) VALUES
(1, 1, 1, 1, CURDATE(), 'Morning'),
(2, 2, 1, 4, CURDATE(), 'Evening'),
(3, 4, 2, 7, CURDATE(), 'Night'),
(4, 5, 2, 1, CURDATE(), 'Morning');

-- 10. EMERGENCY INCIDENTS
INSERT INTO Emergency_Incident (Incident_ID, Metro_ID, Track_ID, Reporter_Emp_ID, Breakdown, Power, Signal_Failure, Timestamp, Location_Description, Resolution_Status) VALUES
(1, 3, 1, 2, FALSE, TRUE, FALSE, NOW() - INTERVAL 1 DAY, 'Power grid fluctuation near Mansarovar substation', 'Resolved'),
(2, 1, 3, 1, FALSE, FALSE, TRUE, NOW() - INTERVAL 4 HOUR, 'Signaling interlock delay at Railway Interchange', 'Resolved'),
(3, 3, 2, 6, TRUE, FALSE, FALSE, NOW() - INTERVAL 2 HOUR, 'Braking pressure variance detected on Track 2', 'In Progress');

-- 11. SECURITY INCIDENTS
INSERT INTO Security_Incident (Security_Inc_ID, Station_ID, Reporter_Emp_ID, Incident_Type, Timestamp, Details, Resolution_Status) VALUES
(1, 6, 3, 'Dispute', NOW() - INTERVAL 1 DAY, 'Commuter heated debate regarding baggage scanning queue.', 'Resolved'),
(2, 7, 8, 'Medical', NOW() - INTERVAL 3 HOUR, 'Elderly passenger required emergency glucose hydration at platform 2.', 'Resolved'),
(3, 8, 3, 'Unattended Item', NOW() - INTERVAL 40 MINUTE, 'Suspicious briefcase scanned and identified as forgotten luggage.', 'In Progress');

-- 12. MAINTENANCE JOBS
INSERT INTO Maintenance_Job (Job_ID, Metro_ID, Component, Job_Type, Scheduled_Date, Resolution_Status) VALUES
(1, 3, 'HVAC Cooling Subsystem', 'Emergency', NOW() - INTERVAL 2 DAY, 'Completed'),
(2, 1, 'Braking Calipers & Hydraulic Pad', 'Routine', NOW() - INTERVAL 1 DAY, 'Completed'),
(3, 3, 'Traction Motor Stator', 'Emergency', NOW(), 'In Progress'),
(4, 2, 'Pneumatic Door Interlock', 'Routine', NOW() + INTERVAL 1 DAY, 'Scheduled');

-- 13. MAINTENANCE ENGINEER ASSIGNMENT
INSERT INTO Maintenance_Engineer_Job (Job_ID, Engineer_Emp_ID, Role_on_Job) VALUES
(1, 2, 'Lead Cryogenic Technician'),
(2, 6, 'Inspection Supervisor'),
(3, 2, 'Lead Traction Specialist'),
(3, 6, 'Assistant Electrical Engineer'),
(4, 6, 'Mechanical Inspector');
