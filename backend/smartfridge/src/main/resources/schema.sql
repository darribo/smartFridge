/* DROP TABLE IF EXISTS HouseholdInvitation; */
DROP TABLE IF EXISTS ProductItem;
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
    name VARCHAR(30) NOT NULL,
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
    name VARCHAR(30) NOT NULL,
    brand VARCHAR(50),
    image VARCHAR(255),
    quantity DECIMAL(5,2) NOT NULL,
    unit TINYINT NOT NULL,
    vegetarian BOOLEAN,
    vegan BOOLEAN,
    nutriScoreGrade TINYINT,
    novaGroup TINYINT,
    createdAt DATETIME NOT NULL,
    defaultPrice DECIMAL(5,2),
    --isFavorite BOOLEAN NOT NULL,
    FOREIGN KEY (householdId) REFERENCES Household(id) ON DELETE CASCADE
);

CREATE TABLE ProductItem (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    productId BIGINT NOT NULL,
    purchaseDate DATETIME NOT NULL,
    expirationDate DATETIME,
    -- openedAt DATETIME,
    -- daysSinceProductWasOpened INTEGER,
    pricePaid DECIMAL(5,2), --TODO: Si es diferente actualizar el por defecto del producto o dejarlo?
    FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
)

--TODO: ALERGIAS
--TODO: CATEGORY TAGS
