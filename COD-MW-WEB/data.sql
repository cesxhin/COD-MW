create table account
(
    uno varchar(250) primary key,
    password varchar(250) not null,
    email_cod varchar(250) not null,
    password_cod varchar(300) not null,
    authToken varchar(500) default null,
    authTokenResetPassw varchar(500) default null,
    admin boolean default false
);

create table players
(
    /*ceschin#439042 */
    tag_username varchar(250) primary key
    platform varchar(50) not null,
    uno varchar(250) references account(uno) not null,
);

create table rankingSchemas
(
    id serial primary key,
    name varchar(250) not null,
    playersNumber integer not null,
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
    end_time time NOT NULL,
    mode varchar(24) NOT NULL,     /* duo, trio, quad */
    id_schema integer references rankingSchemas(id),
    finished boolean default false
);

create table globalRankings
(
    id integer references tournaments (id) PRIMARY KEY, /*change name to tournamentID */
    teams json not null
);

/*
json_teams
{
    "teams" :[
        {
            "teamName" : "ffdf",
            "placement" : 1,
            "totalPoints":150,
            "matchs":
            [
                {
                    "rankWZ": 2,
                    players : [
                        {
                            username : "",
                            kills : 5
                            killPoints: "15" // 1 kill = 5 points
                        },
                        {
                            username : "",
                            kills : 0,
                            killPoints : 5*schema,
                        },
                        {
                            username : "",
                            kills : 0,
                            killPoints : 0*schema //killPoints = kills * killSchemaPointsBased,
                        }
                    ],
                    "totalPointsMatch": 20+10
                },
                {
                    ...
                },
                {
                    ...
                }
            ]
        },
    ] 
        
    }
}
*/

create table teams(
    name primary key,
    players json not null
);

create table teamRankings (
    id integer references tournaments(id),
    teamID varchar(256) references teams(name) on delete cascade,
    teamResults json not null,
    PRIMARY KEY (id, teamID);
);

/*
    
    {
        teamName : "Luna",
        totalPoints : 100,
        tournamentPlace : 2
        matches : [
            {
                matchID : '2iro',
                totalPointsMatch : 10,
                players : [
                    {
                        username : "",
                        kills : 5
                        killPoints: "15" // 1 kill = 5 points
                        details: 
                        {
                            ...
                        }
                    },
                    {
                        username : "",
                        kills : 0,
                        killPoints : 0*schema,
                        details: 
                        {
                            ...
                        }
                    },
                    {
                        username : "",
                        kills : 0,
                        killPoints : 0*schema //killPoints = kills * killSchemaPointsBased,
                        details: 
                        {
                            ...
                        }
                    }
                ]
            },
            {
                ...
            },
            {
                ...
            }
        ]
    }

    {
        teamName : "Luna",
        totalPoints : 100,
        tournamentPlace : 2
        matches : [
            {
                matchID : '2iro',
                totalPointsMatch : 10,
                players : [
                    {
                        username : "cesxhin",
                        kills : 2
                        killPoints: "10" // 1 kill = 5 points
                        details:
                        {
                            ...
                        }
                    },
                    {
                        username : "mateo",
                        kills : 2
                        killPoints: "10" // 1 kill = 5 points
                        details:
                        {
                            ...
                        }
                    }
                ]
            },
            {
                matchID : '2ir123123123123o',
                totalPointsMatch : 20,
                players : [
                    {
                        username : "cesxhin",
                        kills : 4
                        killPoints: "20" // 1 kill = 5 points
                        details:
                        {
                            ...
                        }
                    },
                    {
                        username : "mateo",
                        kills : 2
                        killPoints: "10" // 1 kill = 5 points
                        details:
                        {
                            ...
                        }
                    }
                ]
            },
            {
                matchID : '2ir123123123123o',
                totalPointsMatch : 20,
                players : [
                    {
                        username : "cesxhin",
                        kills : 4
                        killPoints: "20" // 1 kill = 5 points
                        details:
                        {
                            ...
                        }
                    }
                ]
            }
        ]
    }
*/

/* da confermare
non son sicuro se usare la chiave esterna per team o un json;
punterei per la chiave esterna visto che una volta chiuse le iscrizioni finita li e si azzerra tutto a inizio torneo */

create table registrations (
    registrationTime timestamp default now(),
    teamID  varchar(250) references teams(name) on delete cascade, 
    tournamentID integer references tournaments(id) on delete cascade,
    closed boolean default false, /* forse meglio fare una costante */
    primary key(teamID, tournamentID) 
);

INSERT INTO account VALUES ('1','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','1','1'),('2','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','2','2'),('3','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','3','3'),('4','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','4','4'),('5','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','5','5'),('6','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','6','6');

INSERT INTO players VALUES ('mario#1234', 'psn', '1'), ('luca#567', 'battle', '2'),  ('fred#2222', 'xbl', '3'), ('gianni#333', 'psn', '4'), ('dario#8888', 'xbl', '5'), ('pippo#7777', 'battle', '6');