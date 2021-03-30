create table account
(
    uno varchar(250) primary key,
    password varchar(256) not null,
    username_cod varchar(250) not null,
    password_cod varchar(500) not null
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
    id_account varchar(250) references account(username)
);
insert into account values ('cesxhin','password','','');