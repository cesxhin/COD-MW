create table account
(
    uno varchar(250) primary key,
    password varchar(250) not null,
    email_cod varchar(250) not null,
    password_cod varchar(300) not null,
    admin boolean default false
);

create table players
(
    /*ceschin#439042 */
    tag_username varchar(250) primary key
    platform varchar(50) not null,
    uno varchar(250) references account(uno) not null,
);
/*da decidere*/
create table resultsWZ
(
    matchID integer primary key,
    playerID varchar(250) references players(tag_username) on delete cascade,
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
    start_date date NOT NULL,                 
    start_time time NOT NULL,  
    mode varchar(24) NOT NULL,               
    number_matches integer,
    id_schema integer references rankingSchemas(id),
    id_team varchar(250) references teams(name),
    finished boolean default false
);

/*teams whitelist*/
CREATE VIEW teamsWhiteList AS 
SELECT name, player1 as boss FROM teams


CREATE VIEW countTeamPlayers AS
SELECT Count(*) 


/* SELECT * FROM teams where player1 = ,.....;

if(onefield == qualcosa ) //controlla se uno dei campi è vuoto 
{
    SELECT * FROM team
    UPDATE TEAMS SET onefield  = null;
} */
/*da decidere*/
create table teams
(
    name varchar(250) primary key,
    players json not null
);
/*

    [
        {
            "player":"user#tag"
        },
        {
            "player":"user#tag"
        },
        {
            "player":"user#tag"
        },
        {
            "player":"user#tag"
        }
    ]

    

*/
/*da decidere*/
create table rankings
(
    id serial primary key,
    position integer not null,
    total_point integer not null,
    json_teams json not null,
    id_tournament integer references tournaments (id)
);
/*
json_teams
{
    "teams" :[
        {
            "teamName" : "ffdf",
            "players":
            [
                {
                    "username":"username#1234",
                    "match":
                    [
                        {
                            "rank" : 54
                            "kill" : 3
                            "assists" : 1
                            "damageDone" : 170
                        },
                        {
                            "rank" : 5
                            "kill" : 24
                            "assists" : 5
                            "damageDone" : 220
                        },
                        ....
                    ]
                }, 
                {
                    "username":"username#1234"
                    "rank" : 54
                    "kill" : 3
                    "assists" : 1
                    "damageDone" : 170
                },
                ...
            ]
        },
        {
            "teamName" : "team2",
            "players" : [{}]
        }
    ] 
        
    }
}
*/


/*da decidere
create table team_tournaments
{
    id serial primary key,
    id_tournaments serial references tournaments(id),
    id_team varchar(250) references team(name)
}*/

INSERT INTO account VALUES ('1','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','1','1'),('2','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','2','2'),('3','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','3','3'),('4','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','4','4'),('5','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','5','5'),('6','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','6','6');


INSERT INTO players VALUES ('mario#1234', 'psn', '1'), ('luca#567', 'battle', '2'),  ('fred#2222', 'xbl', '3'), ('gianni#333', 'psn', '4'), ('dario#8888', 'xbl', '5'), ('pippo#7777', 'battle', '6');