-- =====================================================================
-- URATRO // HIGH-PERFORMANCE ANALYTICAL VIEWS
-- =====================================================================
USE smart_metro_db;

-- 1. Origin-Destination (O-D) Commuter Flow Matrix
CREATE OR REPLACE VIEW vw_OriginDestinationMatrix AS
SELECT 
    s_in.Station_ID AS Origin_Station_ID,
    s_in.Name AS Origin_Station,
    s_out.Station_ID AS Destination_Station_ID,
    s_out.Name AS Destination_Station,
    COUNT(t.Ticket_ID) AS Total_Journeys,
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.Entry_Time, t.Exit_Time)), 1) AS Avg_Travel_Minutes,
    SUM(t.Fare) AS Total_Revenue_Generated,
    ROUND(AVG(t.Fare), 2) AS Avg_Fare_Paid
FROM Ticket t
JOIN Station s_in ON t.Entry_Station_ID = s_in.Station_ID
JOIN Station s_out ON t.Exit_Station_ID = s_out.Station_ID
WHERE t.Exit_Time IS NOT NULL
GROUP BY s_in.Station_ID, s_in.Name, s_out.Station_ID, s_out.Name
ORDER BY Total_Journeys DESC;

-- 2. Hourly Station Congestion Matrix
CREATE OR REPLACE VIEW vw_StationHourlyCongestion AS
SELECT 
    s.Station_ID,
    s.Name AS Station_Name,
    s.Type AS Station_Type,
    HOUR(t.Entry_Time) AS Hour_Of_Day,
    COUNT(t.Ticket_ID) AS Entries_Count,
    CASE 
        WHEN COUNT(t.Ticket_ID) >= 20 THEN 'Severe Congestion'
        WHEN COUNT(t.Ticket_ID) >= 10 THEN 'Moderate Transit'
        ELSE 'Normal Flow'
    END AS Congestion_Tier
FROM Station s
LEFT JOIN Ticket t ON s.Station_ID = t.Entry_Station_ID
GROUP BY s.Station_ID, s.Name, s.Type, HOUR(t.Entry_Time)
ORDER BY Hour_Of_Day ASC, Entries_Count DESC;

-- 3. Fleet Health & MTBF Reliability Matrix
CREATE OR REPLACE VIEW vw_FleetHealthAnalytics AS
SELECT 
    m.Metro_ID,
    m.Model,
    m.Capacity,
    m.Current_Status,
    COUNT(DISTINCT e.Incident_ID) AS Total_Emergency_Incidents,
    COUNT(DISTINCT j.Job_ID) AS Total_Maintenance_Jobs,
    SUM(CASE WHEN e.Breakdown = TRUE THEN 1 ELSE 0 END) AS Mechanical_Breakdowns,
    SUM(CASE WHEN e.Power = TRUE THEN 1 ELSE 0 END) AS Power_Failures,
    SUM(CASE WHEN e.Signal_Failure = TRUE THEN 1 ELSE 0 END) AS Signaling_Errors
FROM Metro m
LEFT JOIN Emergency_Incident e ON m.Metro_ID = e.Metro_ID
LEFT JOIN Maintenance_Job j ON m.Metro_ID = j.Metro_ID
GROUP BY m.Metro_ID, m.Model, m.Capacity, m.Current_Status;

-- 4. Route Financial Yield & Utilization
CREATE OR REPLACE VIEW vw_RouteFinancialYield AS
SELECT 
    r.Route_ID,
    r.Route_Name,
    COUNT(DISTINCT s.Schedule_ID) AS Daily_Dispatched_Trips,
    COUNT(DISTINCT t.Ticket_ID) AS Total_Commuter_Trips,
    COALESCE(SUM(t.Fare), 0.00) AS Total_Route_Revenue,
    ROUND(COALESCE(AVG(t.Fare), 0.00), 2) AS Average_Ticket_Yield
FROM Route r
LEFT JOIN Daily_Train_Schedule s ON r.Route_ID = s.Route_ID
LEFT JOIN Route_Station_Mapping rsm ON r.Route_ID = rsm.Route_ID
LEFT JOIN Ticket t ON rsm.Station_ID = t.Entry_Station_ID
GROUP BY r.Route_ID, r.Route_Name;
