SELECT *
FROM livedIn l
JOIN person p ON l.personID = p.personID
WHERE l.addressID = 1 AND l.year = 1920;

SELECT l.familyID, l.notes, p.firstName, p.lastName
FROM livedIn l JOIN person p ON l.personID = p.personID
WHERE l.addressID = 1 AND l.year = 1920 AND l.relationToHead = 'Head';