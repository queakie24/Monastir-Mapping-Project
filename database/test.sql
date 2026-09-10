INSERT INTO person (personID, firstName, lastName, birthYear, birthPlace, sex, spouseID, marriageYear) VALUES
('YAA_1861', 'Yehuda', 'Alboher', 1861, 'Monastir, Turkey', 'M', 'BSC_1863', 1882),
('BSC_1863', 'Buena', 'Camhi', 1863, 'Monastir, Turkey', 'F', 'YAA_1861', 1882),
('SYA_1902', 'Samuel', 'Alboher', 1902, 'Monastir, Turkey', 'M', NULL, NULL),
('EYA_1909', 'Esther', 'Alboher', 1909, 'Monastir, Turkey', 'F', NULL, NULL);

INSERT INTO livedIn(personID, addressID, familyID, relationToHead, year, occupation, notes) VALUES
('YAA_1861', 1, 'YehAlb1861', 'Head', 1920, 'Pen Maker', NULL),
('BSC_1863', 1, 'YehAlb1861', 'Wife', 1920, NULL, NULL),
('SYA_1902', 1, 'YehAlb1861', 'Son', 1920, NULL, NULL),
('EYA_1909', 1, 'YehAlb1861', 'Daughter', 1920, NULL, NULL);