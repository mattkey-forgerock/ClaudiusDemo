-- Citizens
INSERT INTO citizens (citizenId, firstname, house, age, chariotLicence) VALUES
  ('marcus123', 'Marcus', 'Claudius', 50, 'chariot123'),
  ('julia123', 'Julia', 'Claudius', 48, 'chariot123'),
  ('lucius123', 'Lucius', 'Claudius', 17, 'chariot123');

-- Chariot Licence
INSERT INTO chariot_licences (licenceNumber, model, vin) VALUES
  ('chariot123', 'Pegasus3000', 'CONFIDENTIAL123');

-- Speeding Fines
INSERT INTO speeding_fines (licenceNumber, citizenId, speed, fineAmount, paid, paymentCard) VALUES
  ('chariot123', 'marcus123', 4, 300, 1, '4111111111111111'),
  ('chariot123', 'julia123', 3, 250, 1, '5555555555554444'),
  ('chariot123', 'julia123', 7, 200, 0, NULL);

-- Relationships
INSERT INTO relationships (fromCitizenId, toCitizenId, relationshipType) VALUES
  ('marcus123', 'julia123', 'SPOUSE_OF'),
  ('julia123', 'marcus123', 'SPOUSE_OF'),
  ('marcus123', 'lucius123', 'PARENT_OF'),
  ('julia123', 'lucius123', 'PARENT_OF'),
  ('lucius123', 'marcus123', 'CHILD_OF'),
  ('lucius123', 'julia123', 'CHILD_OF');
