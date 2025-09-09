-- Citizens
CREATE TABLE IF NOT EXISTS citizens (
  citizenId TEXT PRIMARY KEY,
  firstname TEXT,
  house TEXT,
  age INTEGER,
  chariotLicence TEXT
);

-- Chariot Licences
CREATE TABLE IF NOT EXISTS chariot_licences (
  licenceNumber TEXT PRIMARY KEY,
  model TEXT,
  vin TEXT
);

-- Speeding Fines
CREATE TABLE IF NOT EXISTS speeding_fines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  licenceNumber TEXT,
  citizenId TEXT,
  speed INTEGER,
  fineAmount INTEGER,
  paid BOOLEAN,
  paymentCard TEXT
);

-- Relationships
CREATE TABLE IF NOT EXISTS relationships (
  fromCitizenId TEXT,
  toCitizenId TEXT,
  relationshipType TEXT
);

