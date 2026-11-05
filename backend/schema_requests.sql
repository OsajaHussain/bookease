CREATE TABLE IF NOT EXISTS appointment_requests (
  appointment_id INT NOT NULL PRIMARY KEY,
  description TEXT NULL,
  image_data MEDIUMTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;