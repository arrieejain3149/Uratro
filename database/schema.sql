-- =====================================================================
-- URATRO // SMART METRO DATABASE - COMPLETE MASTER DDL & PROCEDURES SCRIPT
-- =====================================================================
CREATE DATABASE IF NOT EXISTS smart_metro_db;
USE smart_metro_db;

-- 1. PASSENGERS
CREATE TABLE IF NOT EXISTS Passenger (
    Passenger_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Contact VARCHAR(20) NOT NULL,
    Card_Balance DECIMAL(10,2) DEFAULT 0.00
);

-- 2. STATIONS
CREATE TABLE IF NOT EXISTS Station (
    Station_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Type VARCHAR(50) NOT NULL,
    Status VARCHAR(50) DEFAULT 'Operational',
    GPS_Coordinates VARCHAR(100)
);

-- 3. METRO TRAINS
CREATE TABLE IF NOT EXISTS Metro (
    Metro_ID INT AUTO_INCREMENT PRIMARY KEY,
    Model VARCHAR(50) NOT NULL,
    Capacity INT NOT NULL,
    Mfg_Date DATE,
    Current_Status VARCHAR(50) DEFAULT 'Active'
);

-- 4. EMPLOYEES
CREATE TABLE IF NOT EXISTS Employee (
    Emp_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    Shift VARCHAR(20) NOT NULL
);

-- 5. ROUTES
CREATE TABLE IF NOT EXISTS Route (
    Route_ID INT AUTO_INCREMENT PRIMARY KEY,
    Route_Name VARCHAR(100) NOT NULL,
    Start_Station_ID INT NOT NULL,
    End_Station_ID INT NOT NULL,
    FOREIGN KEY (Start_Station_ID) REFERENCES Station(Station_ID) ON DELETE RESTRICT,
    FOREIGN KEY (End_Station_ID) REFERENCES Station(Station_ID) ON DELETE RESTRICT
);

-- 6. ROUTE_STATION_MAPPING (Junction Table)
CREATE TABLE IF NOT EXISTS Route_Station_Mapping (
    Route_ID INT NOT NULL,
    Station_ID INT NOT NULL,
    Sequence_Number INT NOT NULL,
    PRIMARY KEY (Route_ID, Station_ID),
    FOREIGN KEY (Route_ID) REFERENCES Route(Route_ID) ON DELETE CASCADE,
    FOREIGN KEY (Station_ID) REFERENCES Station(Station_ID) ON DELETE RESTRICT
);

-- 7. TRACKS
CREATE TABLE IF NOT EXISTS Track (
    Track_ID INT AUTO_INCREMENT PRIMARY KEY,
    Route_ID INT NOT NULL,
    Length DECIMAL(8,2) NOT NULL,
    Condition_Status VARCHAR(50) DEFAULT 'Good',
    FOREIGN KEY (Route_ID) REFERENCES Route(Route_ID) ON DELETE CASCADE
);

-- 8. TICKETS
CREATE TABLE IF NOT EXISTS Ticket (
    Ticket_ID INT AUTO_INCREMENT PRIMARY KEY,
    Passenger_ID INT NOT NULL,
    Entry_Station_ID INT NOT NULL,
    Exit_Station_ID INT,
    Entry_Time DATETIME NOT NULL,
    Exit_Time DATETIME,
    Fare DECIMAL(8,2) DEFAULT 0.00,
    Payment_Method VARCHAR(50) DEFAULT 'Smart Card',
    FOREIGN KEY (Passenger_ID) REFERENCES Passenger(Passenger_ID) ON DELETE CASCADE,
    FOREIGN KEY (Entry_Station_ID) REFERENCES Station(Station_ID) ON DELETE RESTRICT,
    FOREIGN KEY (Exit_Station_ID) REFERENCES Station(Station_ID) ON DELETE RESTRICT
);

-- 9. DAILY TRAIN SCHEDULE
CREATE TABLE IF NOT EXISTS Daily_Train_Schedule (
    Schedule_ID INT AUTO_INCREMENT PRIMARY KEY,
    Metro_ID INT NOT NULL,
    Route_ID INT NOT NULL,
    Driver_Emp_ID INT NOT NULL,
    Date DATE NOT NULL,
    Shift VARCHAR(20) NOT NULL,
    FOREIGN KEY (Metro_ID) REFERENCES Metro(Metro_ID) ON DELETE CASCADE,
    FOREIGN KEY (Route_ID) REFERENCES Route(Route_ID) ON DELETE CASCADE,
    FOREIGN KEY (Driver_Emp_ID) REFERENCES Employee(Emp_ID) ON DELETE RESTRICT
);

-- 10. EMERGENCY INCIDENTS
CREATE TABLE IF NOT EXISTS Emergency_Incident (
    Incident_ID INT AUTO_INCREMENT PRIMARY KEY,
    Metro_ID INT NOT NULL,
    Track_ID INT NOT NULL,
    Reporter_Emp_ID INT NOT NULL,
    Breakdown BOOLEAN DEFAULT FALSE,
    Power BOOLEAN DEFAULT FALSE,
    Signal_Failure BOOLEAN DEFAULT FALSE,
    Timestamp DATETIME NOT NULL,
    Location_Description VARCHAR(255),
    Resolution_Status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (Metro_ID) REFERENCES Metro(Metro_ID) ON DELETE CASCADE,
    FOREIGN KEY (Track_ID) REFERENCES Track(Track_ID) ON DELETE CASCADE,
    FOREIGN KEY (Reporter_Emp_ID) REFERENCES Employee(Emp_ID) ON DELETE RESTRICT
);

-- 11. SECURITY INCIDENTS
CREATE TABLE IF NOT EXISTS Security_Incident (
    Security_Inc_ID INT AUTO_INCREMENT PRIMARY KEY,
    Station_ID INT NOT NULL,
    Reporter_Emp_ID INT NOT NULL,
    Category_Type VARCHAR(50) NOT NULL,
    Timestamp DATETIME NOT NULL,
    Details TEXT,
    Resolution_Status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (Station_ID) REFERENCES Station(Station_ID) ON DELETE CASCADE,
    FOREIGN KEY (Reporter_Emp_ID) REFERENCES Employee(Emp_ID) ON DELETE RESTRICT
);

-- 12. MAINTENANCE JOBS
CREATE TABLE IF NOT EXISTS Maintenance_Job (
    Job_ID INT AUTO_INCREMENT PRIMARY KEY,
    Metro_ID INT NOT NULL,
    Component VARCHAR(100) NOT NULL,
    Job_Type VARCHAR(50) NOT NULL,
    Scheduled_Date DATETIME NOT NULL,
    Resolution_Status VARCHAR(50) DEFAULT 'Scheduled',
    FOREIGN KEY (Metro_ID) REFERENCES Metro(Metro_ID) ON DELETE CASCADE
);

-- 13. MAINTENANCE ENGINEER ASSIGNMENT (Junction Table)
CREATE TABLE IF NOT EXISTS Maintenance_Engineer_Job (
    Job_ID INT NOT NULL,
    Engineer_Emp_ID INT NOT NULL,
    Role_on_Job VARCHAR(100),
    PRIMARY KEY (Job_ID, Engineer_Emp_ID),
    FOREIGN KEY (Job_ID) REFERENCES Maintenance_Job(Job_ID) ON DELETE CASCADE,
    FOREIGN KEY (Engineer_Emp_ID) REFERENCES Employee(Emp_ID) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- INDEXES FOR LOW-LATENCY ANALYTICAL RETRIEVAL
-- ---------------------------------------------------------------------
-- (Executed safely with duplicate handling in setup script or ALTER TABLE)

