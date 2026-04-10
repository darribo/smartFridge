/* DROP TABLE IF EXISTS HouseholdInvitation; */
DROP TABLE IF EXISTS RecipeIngredient;
DROP TABLE IF EXISTS Recipe;
DROP TABLE IF EXISTS ProductItemTransaction;
DROP TABLE IF EXISTS ProductItem;
DROP TABLE IF EXISTS ProductAllergy;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS UserHousehold;
DROP TABLE IF EXISTS UserAllergy;
DROP TABLE IF EXISTS RefreshToken;
DROP TABLE IF EXISTS Allergy;
DROP TABLE IF EXISTS Household;
DROP TABLE IF EXISTS users;

--TODO: SI SE BORRA UN USUARIO HAY QUE GESTIONAR QUE SI ES ADMIN SE ALGUN HOUSEHOLD SE CAMBIE EL ADMIN O SE BORRE
CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    role TINYINT NOT NULL
);

CREATE TABLE Household (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(500),
    countryCode VARCHAR(10) NOT NULL,
    regionCode VARCHAR(10) NOT NULL,
    regionName VARCHAR(100) NOT NULL,
    admin_id BIGINT,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE UserHousehold (
    userId BIGINT NOT NULL,
    householdId BIGINT NOT NULL,
    joinedAt DATETIME NOT NULL,
    PRIMARY KEY (userId, householdId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (householdId) REFERENCES Household(id) ON DELETE CASCADE
);

CREATE TABLE Allergy (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE UserAllergy (
    userId BIGINT NOT NULL,
    allergyId BIGINT NOT NULL,
    PRIMARY KEY (userId, allergyId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (allergyId) REFERENCES Allergy(id) ON DELETE CASCADE
);

/* CREATE TABLE HouseholdInvitation (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    householdId BIGINT NOT NULL,
    hostId BIGINT NOT NULL,
    guestId BIGINT NOT NULL,
    sendingDate DATETIME NOT NULL,
    responseDate DATETIME,
    status TINYINT NOT NULL
); */


CREATE TABLE Product (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    householdId BIGINT NOT NULL,
    barcode VARCHAR(13),
    name VARCHAR(80) NOT NULL,
    brand VARCHAR(50),
    image VARCHAR(1000),
    quantity DECIMAL(7,2) NOT NULL,
    unit TINYINT NOT NULL,
    vegetarian BOOLEAN,
    vegan BOOLEAN,
    nutriScoreGrade TINYINT,
    novaGroup TINYINT,
    createdAt DATETIME NOT NULL,
    defaultPrice DECIMAL(5,2),
    daysAfterOpening INTEGER,
    --isFavorite BOOLEAN NOT NULL,
    FOREIGN KEY (householdId) REFERENCES Household(id) ON DELETE CASCADE
);

CREATE TABLE ProductAllergy (
    productId BIGINT NOT NULL,
    allergyId BIGINT NOT NULL,
    PRIMARY KEY (productId, allergyId),
    FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
    FOREIGN KEY (allergyId) REFERENCES Allergy(id) ON DELETE CASCADE
);

CREATE TABLE ProductItem (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    productId BIGINT NOT NULL,
    purchaseDate DATETIME NOT NULL,
    expirationDate DATETIME,
    storageLocation VARCHAR(20) NOT NULL,
    pricePaid DECIMAL(5,2),
    openedAt DATETIME,
    initialQuantityValue DECIMAL(7,2),
    quantityRemainingValue DECIMAL(7,2),
    discardDate DATETIME,
    FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
);

CREATE TABLE ProductItemTransaction (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    productItemId BIGINT NOT NULL,
    userId BIGINT,
    type VARCHAR(10) NOT NULL,
    quantityDeltaValue DECIMAL(7,2),
    createdAt DATETIME NOT NULL,
    FOREIGN KEY (productItemId) REFERENCES ProductItem(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
--TODO: CATEGORY TAGS

CREATE TABLE Recipe (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    createdByUserId BIGINT NOT NULL,

    title VARCHAR(150) NOT NULL,
    description VARCHAR(2000),
    image VARCHAR(1000),

    servings INT,
    preparationMinutes INT,
    cookingMinutes INT,
    totalMinutes INT,

    difficulty TINYINT,

    -- TODO: estimatedCaloriesPerServing DECIMAL(7,2),
    -- TODO: estimatedTotalCost DECIMAL(7,2),
    -- TODO: estimatedCostPerServing DECIMAL(7,2),

    cuisineType TINYINT,
    dietType TINYINT,
    mealType TINYINT,
    seasonType TINYINT,

    vegetarian BOOLEAN,
    vegan BOOLEAN,

    instructions TEXT NOT NULL,
    notes TEXT,

    generationSource VARCHAR(20) NOT NULL,

    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,

    FOREIGN KEY (createdByUserId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE RecipeIngredient (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    recipeId BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,
    quantityValue DECIMAL(7,2),
    unit TINYINT,
    notes VARCHAR(255),
    optionalIngredient BOOLEAN NOT NULL DEFAULT FALSE,
    displayOrder INT NOT NULL,

    productId BIGINT,

    FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE SET NULL
);
