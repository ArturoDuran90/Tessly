CREATE TABLE IF NOT EXISTS vehicles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  vin          VARCHAR(17) NOT NULL UNIQUE,
  display_name VARCHAR(50),
  model        VARCHAR(20),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS snapshots (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id    INT NOT NULL,
  battery_level TINYINT,
  rated_range   DECIMAL(6,2),
  odometer      DECIMAL(10,2),
  latitude      DECIMAL(9,6),
  longitude     DECIMAL(9,6),
  is_charging   BOOLEAN DEFAULT FALSE,
  is_plugged_in BOOLEAN DEFAULT FALSE,
  outside_temp  DECIMAL(4,1),
  recorded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS trips (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id     INT NOT NULL,
  start_lat      DECIMAL(9,6),
  start_lng      DECIMAL(9,6),
  end_lat        DECIMAL(9,6),
  end_lng        DECIMAL(9,6),
  start_odometer DECIMAL(10,2),
  end_odometer   DECIMAL(10,2),
  miles_driven   DECIMAL(6,2),
  energy_used_kwh DECIMAL(6,3),
  efficiency     DECIMAL(5,2),
  started_at     TIMESTAMP,
  ended_at       TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS charging_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id    INT NOT NULL,
  location_name VARCHAR(100),
  latitude      DECIMAL(9,6),
  longitude     DECIMAL(9,6),
  kwh_added     DECIMAL(6,3),
  cost_usd      DECIMAL(6,2),
  charge_limit  TINYINT,
  started_at    TIMESTAMP,
  ended_at      TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
