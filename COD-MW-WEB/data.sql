create table account
(
    uno varchar(250) primary key,
    password varchar(250) not null,
    email_cod varchar(250) not null,
    password_cod varchar(300) not null
);
create table resultsMultiplayer
(
    matchID integer primary key,
    result integer,
    duration integer,
    map varchar(250),
    kill integer,
    headshots integer,
    assists integer,
    deaths integer,
    suicides integer,
    damageDone integer,
    executions integer,
    shotsFired integer,
    nearmisses integer,
    shotsMissed integer,
    shotsLanded integer,
    id_account varchar(250) references account(username) on delete cascade
);

create table tournaments
(
    id serial primary key,
    start_date varchar(50),
    start_time varchar(50),
    number_matches integer,
    id_schema integer references rankingSchemas(id)
);

create table rankingSchemas
(
    id serial primary key,
    name varchar(250) not null,
    points_top1 integer not null,
    points_top2 integer not null,
    points_top3 integer not null,
    points_top5 integer not null,
    points_top10 integer not null,
    points_top15 integer not null,
    points_top20 integer not null,
    kill integer not null
);



