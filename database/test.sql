INSERT INTO person (personID, firstName, lastName, birthYear, birthPlace, photo, notes) VALUES
('GRH_1889', 'Gabriel', 'Hasson', 1889, 'Monastir, Turkey', 'No', ''),
('MUnC_1885', 'Molly', 'Cohen', 1885, 'Castoria, Greece', 'No', ''),
('AGH_1912', 'Anna', 'Hasson', 1912, 'New York City, USA', 'No', ''),
('RGH_1917', 'Ralph', 'Hasson', 1917, 'New York City, USA', 'No', '');

INSERT INTO livedIn (personID, addressID, familyID, relationToHead, year, occupation) VALUES
('GRH_1889', 1, 'GabHas1889', 'Head', 1920, 'Presser'),
('MUnC_1885', 1, 'GabHas1889', 'Wife', 1920, 'Housewife'),
('AGH_1912', 1, 'GabHas1889', 'Daughter', 1920, ''),
('RGH_1917', 1, 'GabHas1889', 'Son', 1920, '');