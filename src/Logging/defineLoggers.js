const winston = require('winston');
const { format } = winston;
const { combine, label, timestamp,prettyPrint } = format;

//
// Configure the logger for `Generic Repository`
//
winston.loggers.add('generic', {
  format: combine(
    label({ label: 'Generic Repository' }),
    timestamp(),
    prettyPrint()
  ),
  transports: [
    new winston.transports.File({ filename: 'genericRepo.log', level : 'error' })
  ]
});

//
// Configure the logger for `Team Repository`
//
winston.loggers.add('team', {
    format: combine(
      label({ label: 'Team Repository' }),
      timestamp(),
      prettyPrint()
    ),
    transports: [
      new winston.transports.File({ filename: 'teamRepo.log', level : 'error' })
    ]
  });

