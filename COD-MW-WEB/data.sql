create table account
(
    uno varchar(250) primary key,
    password varchar(250) not null,
    email_cod varchar(250) not null,
    password_cod varchar(300) not null,
    admin boolean not null,
    tag_username varchar(250) not null,
    platform varchar(50) not null
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
    kill integer not null,
    gulag boolean not null
);


create table tournaments
(
    id serial primary key,
    start_date varchar(50),
    start_time varchar(50),
    number_matches integer,
    id_schema integer references rankingSchemas(id)
);

create table team
(
    name varchar(250) primary key,
    player1 varchar(250) not null,
    player1_boss boolean default false,
    player2 varchar(250),
    player2_boss boolean default false,
    player3 varchar(250),
    player3_boss boolean default false,
    player4 varchar(250),
    player4_boss boolean default false
);

create table team_tournaments
{
    id serial primary key,
    id_tournaments serial references tournaments(id),
    id_team varchar(250) references team(name)
}