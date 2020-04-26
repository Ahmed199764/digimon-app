DROP TABLE IF EXISTS cards;

CREATE TABLE cards
(
    id SERIAL PRIMARY KEY,
    name varchar(225),
    image varchar(255),
    level varchar(255)
)