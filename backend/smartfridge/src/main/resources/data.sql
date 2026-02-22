INSERT INTO Allergy (id, tag) VALUES (1, 'en:gluten');
INSERT INTO Allergy (id, tag) VALUES (2, 'en:crustaceans');
INSERT INTO Allergy (id, tag) VALUES (3, 'en:eggs');
INSERT INTO Allergy (id, tag) VALUES (4, 'en:fish');
INSERT INTO Allergy (id, tag) VALUES (5, 'en:peanuts');
INSERT INTO Allergy (id, tag) VALUES (6, 'en:soybeans');
INSERT INTO Allergy (id, tag) VALUES (7, 'en:milk');
INSERT INTO Allergy (id, tag) VALUES (8, 'en:nuts');
INSERT INTO Allergy (id, tag) VALUES (9, 'en:celery');
INSERT INTO Allergy (id, tag) VALUES (10, 'en:mustard');
INSERT INTO Allergy (id, tag) VALUES (11, 'en:sesame-seeds');
INSERT INTO Allergy (id, tag) VALUES (12, 'en:sulphur-dioxide-and-sulphites');
INSERT INTO Allergy (id, tag) VALUES (13, 'en:lupin');
INSERT INTO Allergy (id, tag) VALUES (14, 'en:molluscs');

-- Password (BCrypt) for all seeded users: secret123
INSERT INTO users (id, userName, password, email, firstName, lastName, avatar, role) VALUES
    (1, 'admin_home', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'admin_home@mail.com', 'Admin', 'Home', 'avatar_admin.png', 1),
    (2, 'guest_home', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'guest_home@mail.com', 'Guest', 'Home', NULL, 1),
    (3, 'new_admin', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'new_admin@mail.com', 'New', 'Admin', 'avatar_new_admin.png', 1),
    (4, 'outsider_user', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'outsider_user@mail.com', 'Outsider', 'User', 'https://example.com/missing-avatar.png', 1),
    (5, 'maria_test', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'maria_test@mail.com', 'Maria', 'Test', 'avatar_maria.png', 1),
    (6, 'lucas_test', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'lucas_test@mail.com', 'Lucas', 'Test', NULL, 1),
    (7, 'sofia_test', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'sofia_test@mail.com', 'Sofia', 'Test', 'avatar_sofia.png', 1),
    (8, 'diego_test', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'diego_test@mail.com', 'Diego', 'Test', NULL, 1);

INSERT INTO Household (id, name, description, countryCode, regionCode, regionName, admin_id) VALUES
    (10, 'Casa Centro', 'Hogar principal para pruebas', 'ES', 'GA', 'Galicia', 1),
    (11, 'Casa Norte', 'Segundo hogar para pruebas', 'ES', 'AS', 'Asturias', 3),
    (12, 'Piso Universidad', 'Hogar compartido de estudiantes', 'ES', 'MD', 'Madrid', 1),
    (13, 'Casa Playa', 'Casa vacacional para verano', 'ES', 'VC', 'Valencia', 1),
    (14, 'Oficina', 'Hogar de pruebas para otros usuarios', 'ES', 'CT', 'Cataluna', 3);

INSERT INTO UserHousehold (userId, householdId, joinedAt) VALUES
    (1, 10, '2026-02-17 09:00:00'),
    (2, 10, '2026-02-17 09:05:00'),
    (3, 10, '2026-02-17 09:10:00'),
    (4, 10, '2026-02-17 09:15:00'),
    (1, 11, '2026-02-18 08:00:00'),
    (3, 11, '2026-02-18 08:01:00'),
    (5, 11, '2026-02-18 08:05:00'),
    (1, 12, '2026-02-19 12:00:00'),
    (6, 12, '2026-02-19 12:02:00'),
    (7, 12, '2026-02-19 12:04:00'),
    (8, 12, '2026-02-19 12:06:00'),
    (1, 13, '2026-02-20 09:00:00'),
    (3, 14, '2026-02-20 09:10:00'),
    (4, 14, '2026-02-20 09:12:00');

-- status enum (ordinal): 0 = ACCEPTED, 1 = PENDING, 2 = REJECTED
/* INSERT INTO HouseholdInvitation (id, householdId, hostId, guestId, sendingDate, responseDate, status) VALUES
    (100, 10, 1, 3, '2026-02-17 11:00:00', NULL, 1),
    (101, 10, 1, 4, '2026-02-17 11:10:00', '2026-02-17 11:30:00', 0),
    (102, 11, 3, 2, '2026-02-17 11:20:00', '2026-02-17 11:40:00', 2),
    (103, 12, 1, 5, '2026-02-19 15:20:00', NULL, 1); */
