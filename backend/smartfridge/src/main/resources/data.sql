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
    (2, 'guest_home', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'guest_home@mail.com', 'Guest', 'Home', NULL, 1);
/*,
    (3, 'new_admin', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'new_admin@mail.com', 'New', 'Admin', 'avatar_new_admin.png', 1),
    (4, 'outsider_user', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'outsider_user@mail.com', 'Outsider', 'User', 'https://example.com/missing-avatar.png', 1),
    (5, 'maria_test', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'maria_test@mail.com', 'Maria', 'Test', 'avatar_maria.png', 1),
    (6, 'lucas_test', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'lucas_test@mail.com', 'Lucas', 'Test', NULL, 1),
    (7, 'sofia_test', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'sofia_test@mail.com', 'Sofia', 'Test', 'avatar_sofia.png', 1),
    (8, 'diego_test', '$2a$10$W5j1lZ2sXbGQaWgN/LvIuuhX5b9qHOikAlV1BnmjjNtMJGsqc6Mm2', 'diego_test@mail.com', 'Diego', 'Test', NULL, 1);

INSERT INTO UserAllergy(userId, allergyId) VALUES
    (1, 1),
    (1, 7),
    (2, 5),
    (3, 3),
    (3, 8),
    (4, 2),
    (4, 6),
    (4, 9),
    (5, 4),
    (5, 10),
    (6, 11),
    (7, 12),
    (8, 13),
    (8, 14);

*/
INSERT INTO Household (id, name, description, countryCode, regionCode, regionName, admin_id) VALUES
    (10, 'Casa Centro', 'Hogar principal para pruebas', 'ES', 'GA', 'Galicia', 1);
/*,
    (11, 'Casa Norte', 'Segundo hogar para pruebas', 'ES', 'AS', 'Asturias', 3)
    (12, 'Piso Universidad', 'Hogar compartido de estudiantes', 'ES', 'MD', 'Madrid', 1),
    (13, 'Casa Playa', 'Casa vacacional para verano', 'ES', 'VC', 'Valencia', 1),
    (14, 'Oficina', 'Hogar de pruebas para otros usuarios', 'ES', 'CT', 'Cataluna', 3);

*/
INSERT INTO UserHousehold (userId, householdId, joinedAt) VALUES
    (1, 10, '2026-02-17 09:00:00'),
    (2, 10, '2026-02-17 09:05:00');
/* Usuarios adicionales comentados:
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
*/

INSERT INTO Product (
    id, householdId, barcode, name, brand, image, quantity, unit, vegetarian, vegan, nutriScoreGrade, novaGroup, createdAt, defaultPrice, daysAfterOpening
) VALUES
    (100, 10, '8437000010011', 'Leche Entera', 'Granja Norte', NULL, 1.00, 3, 1, 0, 1, 0, '2026-03-01 10:00:00', 1.35, 5),
    (101, 10, '8437000010012', 'Leche Semidesnatada', 'Granja Norte', NULL, 1.00, 3, 1, 0, 1, 0, '2026-03-01 10:10:00', 1.30, 5),
    (102, 10, '8437000010020', 'Yogur Natural', 'La Vaquera', NULL, 4.00, 4, 1, 0, 0, 0, '2026-03-01 10:20:00', 2.10, 7),
    (103, 10, '8437000010030', 'Arroz Redondo', 'Campo Vivo', NULL, 1.00, 1, 1, 1, 1, 0, '2026-03-01 10:30:00', 1.25, NULL),
    (104, 10, '8437000010040', 'Pasta Espagueti', 'Trigo Oro', NULL, 500.00, 0, 1, 1, 1, 2, '2026-03-01 10:40:00', 1.05, NULL),
    (105, 10, '8437000010050', 'Tomate Triturado', 'Huerta Casa', NULL, 400.00, 0, 1, 1, 2, 0, '2026-03-01 10:50:00', 0.95, 3),
    (106, 10, '8437000010060', 'Pan Integral', 'Horno Sur', NULL, 500.00, 0, 1, 1, 2, 0, '2026-03-01 11:00:00', 1.80, 4),
    (107, 10, '8437000010070', 'Queso Curado', 'Sierra Alta', NULL, 250.00, 0, 1, 0, 3, 2, '2026-03-01 11:10:00', 3.90, 30);

-- Products adicionales para household 10
-- unit: 0=G, 1=KG, 2=ML, 3=L, 4=UNIT
-- nutriScoreGrade: 0=A, 1=B, 2=C, 3=D, 4=E  (NULL si no hay)
-- novaGroup: 0=GROUP_1, 1=GROUP_2, 2=GROUP_3, 3=GROUP_4  (NULL si no hay)
INSERT INTO Product (id, householdId, barcode, name, brand, image, quantity, unit, vegetarian, vegan, nutriScoreGrade, novaGroup, createdAt, defaultPrice, daysAfterOpening) VALUES
    (108, 10, '8437000010080', 'Huevos Camperos',      'Granja Feliz',  NULL, 12.00, 4, 1, 0, 0, 0, '2026-03-02 09:00:00', 2.90, NULL),
    (109, 10, '8437000010090', 'Aceite de Oliva Virgen Extra', 'Oro Verde', NULL, 750.00, 2, 1, 1, 0, 0, '2026-03-02 09:10:00', 4.50, NULL),
    (110, 10, '8437000010100', 'Pechuga de Pollo',     'Carnicería Sur', NULL, 500.00, 0, 0, 0, 0, 0, '2026-03-02 09:20:00', 3.80, 2),
    (111, 10, '8437000010110', 'Patatas',               NULL,            NULL, 2.00,  1, 1, 1, 0, 0, '2026-03-02 09:30:00', 1.20, 30),
    (112, 10, '8437000010120', 'Cebolla',               NULL,            NULL, 1.00,  1, 1, 1, 0, 0, '2026-03-02 09:40:00', 0.90, 20),
    (113, 10, '8437000010130', 'Ajo',                   NULL,            NULL, 250.00,0, 1, 1, 0, 0, '2026-03-02 09:50:00', 0.80, 60),
    (114, 10, '8437000010140', 'Zanahoria',             NULL,            NULL, 1.00,  1, 1, 1, 0, 0, '2026-03-02 10:00:00', 1.10, 14),
    (115, 10, '8437000010150', 'Mantequilla',           'Astur',         NULL, 250.00,0, 1, 0, 2, 1, '2026-03-02 10:10:00', 2.20, 30),
    (116, 10, '8437000010160', 'Nata para Cocinar',     'Lacteaes',      NULL, 200.00,2, 1, 0, 3, 3, '2026-03-02 10:20:00', 1.40, 3),
    (117, 10, '8437000010170', 'Harina de Trigo',       'Harimsa',       NULL, 1.00,  1, 1, 1, 0, 0, '2026-03-02 10:30:00', 0.95, NULL),
    (118, 10, '8437000010180', 'Atún en Lata',          'Mar Azul',      NULL, 3.00,  4, 0, 0, 0, 3, '2026-03-02 10:40:00', 2.60, 2),
    (119, 10, '8437000010190', 'Lentejas',              'Campo Vivo',    NULL, 500.00,0, 1, 1, 0, 0, '2026-03-02 10:50:00', 1.30, NULL),
    (120, 10, '8437000010200', 'Garbanzos Cocidos',     'El Molino',     NULL, 400.00,0, 1, 1, 1, 0, '2026-03-02 11:00:00', 1.10, 3),
    (121, 10, '8437000010210', 'Jamón York',            'El Cortador',   NULL, 200.00,0, 0, 0, 2, 3, '2026-03-02 11:10:00', 2.50, 5),
    (122, 10, '8437000010220', 'Tomate Frito',          'Apis',          NULL, 350.00,0, 1, 1, 2, 3, '2026-03-02 11:20:00', 1.20, 5),
    (123, 10, '8437000010230', 'Caldo de Verduras',     'Aneto',         NULL, 1.00,  3, 1, 1, 1, 2, '2026-03-02 11:30:00', 2.80, 5),
    (124, 10, '8437000010240', 'Pimiento Rojo',         NULL,            NULL, 500.00,0, 1, 1, 0, 0, '2026-03-02 11:40:00', 1.50, 7),
    (125, 10, '8437000010250', 'Espinacas Frescas',     NULL,            NULL, 300.00,0, 1, 1, 0, 0, '2026-03-02 11:50:00', 2.20, 3);

-- ProductItems para household 10 (algunos productos con stock)
-- storageLocation: PANTRY, FRIDGE, FREEZER
INSERT INTO ProductItem (id, productId, purchaseDate, expirationDate, storageLocation, pricePaid, openedAt, initialQuantityValue, quantityRemainingValue, discardDate) VALUES
    (200, 100, '2026-03-20 10:00:00', '2026-04-05 00:00:00', 'FRIDGE',  1.35, NULL,  1.00, 1.00, NULL),
    (201, 100, '2026-03-28 10:00:00', '2026-04-10 00:00:00', 'FRIDGE',  1.35, NULL,  1.00, 1.00, NULL),
    (202, 102, '2026-03-15 10:00:00', '2026-04-01 00:00:00', 'FRIDGE',  2.10, NULL,  NULL,    NULL,    NULL),
    (203, 103, '2026-03-01 10:00:00', NULL,                  'PANTRY',  1.25, NULL,  1.00, 0.75, NULL),
    (204, 104, '2026-03-10 10:00:00', NULL,                  'PANTRY',  1.05, '2026-03-10 12:00:00', 500.00, 320.00, NULL),
    (205, 105, '2026-03-18 10:00:00', '2026-06-01 00:00:00', 'PANTRY',  0.95, NULL,  400.00,  400.00,  NULL),
    (206, 106, '2026-03-29 10:00:00', '2026-04-02 00:00:00', 'PANTRY',  1.80, '2026-03-29 12:00:00', 500.00, 380.00, NULL),
    (207, 107, '2026-03-05 10:00:00', '2026-05-05 00:00:00', 'FRIDGE',  3.90, NULL,  250.00,  180.00,  NULL),
    (208, 108, '2026-03-25 10:00:00', '2026-04-10 00:00:00', 'FRIDGE',  2.90, NULL,  NULL,    NULL,    NULL),
    (209, 109, '2026-03-01 10:00:00', NULL,                  'PANTRY',  4.50, '2026-03-01 12:00:00', 750.00, 600.00, NULL),
    (210, 110, '2026-03-30 10:00:00', '2026-04-01 00:00:00', 'FRIDGE',  3.80, NULL,  500.00,  500.00,  NULL),
    (211, 111, '2026-03-20 10:00:00', NULL,                  'PANTRY',  1.20, NULL,  2.00, 1.50, NULL),
    (212, 112, '2026-03-20 10:00:00', NULL,                  'PANTRY',  0.90, NULL,  1.00, 0.80, NULL),
    (213, 115, '2026-03-15 10:00:00', '2026-04-15 00:00:00', 'FRIDGE',  2.20, '2026-03-20 09:00:00', 250.00, 200.00, NULL),
    (214, 117, '2026-03-01 10:00:00', NULL,                  'PANTRY',  0.95, NULL,  1.00, 0.90, NULL),
    (215, 118, '2026-03-10 10:00:00', '2026-07-01 00:00:00', 'PANTRY',  2.60, NULL,  NULL,    NULL,    NULL),
    (216, 119, '2026-03-01 10:00:00', NULL,                  'PANTRY',  1.30, NULL,  500.00,  500.00,  NULL),
    (217, 122, '2026-03-15 10:00:00', '2026-06-01 00:00:00', 'PANTRY',  1.20, NULL,  350.00,  350.00,  NULL),
    (218, 123, '2026-03-10 10:00:00', '2026-09-01 00:00:00', 'PANTRY',  2.80, NULL,  1.00, 1.00, NULL),
    (219, 125, '2026-03-30 10:00:00', '2026-04-02 00:00:00', 'FRIDGE',  2.20, NULL,  300.00,  300.00,  NULL);

-- Recipes para usuario 1 (admin_home)
-- difficulty:   0=EASY, 1=MEDIUM, 2=HARD
-- cuisineType:  0=SPANISH, 1=ITALIAN, 7=MEDITERRANEAN
-- dietType:     0=STANDARD, 1=VEGETARIAN, 2=VEGAN
-- mealType:     0=BREAKFAST, 1=LUNCH, 2=DINNER
-- seasonType:   0=SPRING, 1=SUMMER, 2=AUTUMN, 3=WINTER, 4=ALL_YEAR
INSERT INTO Recipe (id, createdByUserId, householdId, title, description, image, servings, preparationMinutes, cookingMinutes, totalMinutes, difficulty, cuisineType, dietType, mealType, seasonType, vegetarian, vegan, instructions, notes, generationSource, createdAt, updatedAt) VALUES
    (1, 1, 10, 'Tortilla de Patatas',
        'La tortilla española clásica, jugosa por dentro y dorada por fuera.',
        NULL, 4, 15, 20, 35, 0, 0, 1, 1, 4, 1, 0,
        '1. Pela y corta las patatas en láminas finas.\n2. Fríelas en abundante aceite a fuego medio hasta que estén tiernas.\n3. Bate los huevos con sal y añade las patatas escurridas.\n4. Cuaja la tortilla en una sartén antiadherente a fuego suave, dándole la vuelta con un plato.',
        'El truco está en no dejarla cuajar demasiado para que quede jugosa.',
        'USER', '2026-03-10 12:00:00', '2026-03-10 12:00:00'),

    (2, 1, 10, 'Lentejas con Verduras',
        'Guiso tradicional de lentejas con zanahoria, cebolla y ajo. Reconfortante y nutritivo.',
        NULL, 4, 10, 40, 50, 0, 0, 2, 2, 3, 1, 1,
        '1. Pon las lentejas en una olla con agua fría.\n2. Añade la zanahoria en rodajas, la cebolla troceada y los ajos enteros.\n3. Agrega el tomate frito y el caldo.\n4. Cocina a fuego medio 35-40 minutos hasta que las lentejas estén tiernas.\n5. Salpimienta y ajusta de líquido si es necesario.',
        'No hace falta remojar las lentejas pardinas.',
        'USER', '2026-03-12 19:00:00', '2026-03-12 19:00:00'),

    (3, 1, 10, 'Pasta con Tomate y Atún',
        'Receta rápida de pasta con salsa de tomate casera y atún. Lista en 20 minutos.',
        NULL, 2, 5, 15, 20, 0, 1, 0, 1, 4, 0, 0,
        '1. Cuece la pasta en agua con sal según indicaciones del paquete.\n2. Sofríe el ajo laminado en aceite.\n3. Añade el tomate triturado y cocina 10 minutos.\n4. Incorpora el atún escurrido, mezcla y sirve sobre la pasta.',
        'Con atún en aceite queda más sabroso.',
        'USER', '2026-03-15 13:30:00', '2026-03-15 13:30:00'),

    (4, 1, 10, 'Pollo al Ajillo',
        'Clásico pollo al ajillo en su punto, con los ajos dorados y jugosos.',
        NULL, 3, 10, 30, 40, 1, 0, 0, 2, 4, 0, 0,
        '1. Salpimienta los trozos de pollo.\n2. Dora el pollo en aceite caliente a fuego alto por todos los lados.\n3. Añade los ajos sin pelar y baja el fuego.\n4. Agrega el vino blanco, tapa y cocina 20 minutos hasta que el pollo esté hecho.',
        'Aplasta ligeramente los ajos antes de echarlos para que suelten más sabor.',
        'USER', '2026-03-18 20:00:00', '2026-03-18 20:00:00'),

    (5, 1, 10, 'Ensalada de Garbanzos',
        'Ensalada mediterránea fresquita con garbanzos, pimiento y cebolla morada.',
        NULL, 2, 10, 0, 10, 0, 7, 2, 1, 1, 1, 1,
        '1. Escurre y enjuaga los garbanzos cocidos.\n2. Corta el pimiento en tiras y la cebolla en juliana fina.\n3. Mezcla todo en un bol.\n4. Aliña con aceite de oliva, zumo de limón, sal y comino al gusto.',
        'Mejor si reposa 30 minutos en la nevera antes de servir.',
        'USER', '2026-03-20 14:00:00', '2026-03-20 14:00:00'),

    (6, 1, 10, 'Espinacas a la Crema',
        'Espinacas salteadas con nata y ajo, cremosas y listas en 15 minutos.',
        NULL, 2, 5, 10, 15, 0, 0, 1, 2, 3, 1, 0,
        '1. Saltea los ajos laminados en mantequilla a fuego medio.\n2. Añade las espinacas frescas y rehoga hasta que pierdan el volumen.\n3. Vierte la nata y cocina 5 minutos hasta que espese.\n4. Salpimienta y sirve caliente.',
        'Puedes añadir un poco de nuez moscada rallada al final.',
        'USER', '2026-03-22 21:00:00', '2026-03-22 21:00:00');

-- RecipeIngredients (unit: 0=G, 1=KG, 2=ML, 3=L, 4=UNIT)
INSERT INTO RecipeIngredient (id, recipeId, name, quantityValue, unit, notes, optionalIngredient, displayOrder, productId) VALUES
    -- Tortilla de Patatas (recipeId=1)
    (1,  1, 'Huevos',           6.00,   4, NULL,                    0, 1, 108),
    (2,  1, 'Patatas',          500.00, 0, NULL,                    0, 2, 111),
    (3,  1, 'Cebolla',          1.00,   4, 'Opcional si no gusta',  1, 3, 112),
    (4,  1, 'Aceite de oliva',  100.00, 2, NULL,                    0, 4, 109),
    (5,  1, 'Sal',              NULL,   NULL, NULL,                 0, 5, NULL),
    -- Lentejas con Verduras (recipeId=2)
    (6,  2, 'Lentejas pardinas', 300.00, 0, NULL,                   0, 1, 119),
    (7,  2, 'Zanahoria',         2.00,   4, NULL,                   0, 2, 114),
    (8,  2, 'Cebolla',           1.00,   4, NULL,                   0, 3, 112),
    (9,  2, 'Ajo',               3.00,   4, NULL,                   0, 4, 113),
    (10, 2, 'Tomate frito',      200.00, 0, NULL,                   0, 5, 122),
    (11, 2, 'Caldo de verduras', 500.00, 2, NULL,                   0, 6, 123),
    -- Pasta con Tomate y Atún (recipeId=3)
    (12, 3, 'Pasta espagueti',   400.00, 0, NULL,                   0, 1, 104),
    (13, 3, 'Tomate triturado',  400.00, 0, NULL,                   0, 2, 105),
    (14, 3, 'Atún en lata',      2.00,   4, NULL,                   0, 3, 118),
    (15, 3, 'Ajo',               2.00,   4, NULL,                   0, 4, 113),
    (16, 3, 'Aceite de oliva',   50.00,  2, NULL,                   0, 5, 109),
    -- Pollo al Ajillo (recipeId=4)
    (17, 4, 'Pechuga de pollo',  500.00, 0, NULL,                   0, 1, 110),
    (18, 4, 'Ajo',               8.00,   4, 'Sin pelar',            0, 2, 113),
    (19, 4, 'Aceite de oliva',   80.00,  2, NULL,                   0, 3, 109),
    (20, 4, 'Vino blanco',       100.00, 2, NULL,                   0, 4, NULL),
    -- Ensalada de Garbanzos (recipeId=5)
    (21, 5, 'Garbanzos cocidos', 400.00, 0, NULL,                   0, 1, 120),
    (22, 5, 'Pimiento rojo',     1.00,   4, NULL,                   0, 2, 124),
    (23, 5, 'Cebolla',           0.50,   4, NULL,                   0, 3, 112),
    (24, 5, 'Aceite de oliva',   50.00,  2, NULL,                   0, 4, 109),
    (25, 5, 'Limón',             1.00,   4, NULL,                   0, 5, NULL),
    -- Espinacas a la Crema (recipeId=6)
    (26, 6, 'Espinacas frescas', 300.00, 0, NULL,                   0, 1, 125),
    (27, 6, 'Nata para cocinar', 200.00, 2, NULL,                   0, 2, 116),
    (28, 6, 'Ajo',               2.00,   4, NULL,                   0, 3, 113),
    (29, 6, 'Mantequilla',       20.00,  0, NULL,                   0, 4, 115);

/* Invitaciones comentadas (referencian usuarios adicionales comentados):
-- status enum (ordinal): 0 = ACCEPTED, 1 = PENDING, 2 = REJECTED
INSERT INTO HouseholdInvitation (id, householdId, hostId, guestId, sendingDate, responseDate, status) VALUES
    (100, 10, 1, 3, '2026-02-17 11:00:00', NULL, 1),
    (101, 10, 1, 4, '2026-02-17 11:10:00', '2026-02-17 11:30:00', 0),
    (102, 11, 3, 2, '2026-02-17 11:20:00', '2026-02-17 11:40:00', 2),
    (103, 12, 1, 5, '2026-02-19 15:20:00', NULL, 1);
*/
