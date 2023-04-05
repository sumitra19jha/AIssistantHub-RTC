const winston = require("winston");
const {
    format
} = winston;
const path = require("path");

/*
- Logging on console shows up only if you start with the command -> NODE_ENV="debug" node main.js
- Logging format on console is different from the log format in the log file.
- logs/error.log contains the following:
-- a) All error logs i.e. logs present in the code with the level 'error'
-- b) All unhandled exeptions
-- c) All unhandled rejected promises
- All logs (including errors) are logged in logs/combined.log 
- Log levels:
  error: 0, 
  warn: 1, 
  info: 2, 
  http: 3,
  verbose: 4, 
  debug: 5, 
  silly: 6 
- With slight modifications, logging format is picked from - https://stackoverflow.com/a/56091110/10345461
*/

const logFormat = format.printf(
    (info) =>
    `\n${info.timestamp} ${info.level} [${info.label}]: ${
      info.message
    } \nmetadata: ${JSON.stringify(info.metadata)}`
);

const logger = winston.createLogger({
    level: "debug",
    format: format.combine(
        format.label({
            label: path.basename(require.main.filename)
        }),
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        // Format the metadata object
        format.metadata({
            fillExcept: [
                "message",
                "level",
                "timestamp",
                "label",
                "environment",
                "service",
            ],
        })
    ),
    defaultMeta: {
        environment: "staging",
        service: "recording-asg"
    },
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston.transports.File({
            filename: "./logs/error.log",
            level: "error",
            format: format.combine(format.json()),
            maxsize: 1000000,
            maxFiles: 100,
        }),
        // Write all logs to `combined.log`
        new winston.transports.File({
            filename: "./logs/combined.log",
            format: format.combine(format.json()),
            maxsize: 1000000,
            maxFiles: 100,
        }),
    ],
    // Write all unhandled exceptions to `error.log`
    exceptionHandlers: [
        new winston.transports.File({
            filename: "./logs/error.log",
            format: format.combine(format.json()),
            maxsize: 1000000,
            maxFiles: 100,
        }),
    ],
    // Write all unhandled rejected promises to `error.log`
    rejectionHandlers: [
        new winston.transports.File({
            filename: "./logs/error.log",
            format: format.combine(format.json()),
            maxsize: 1000000,
            maxFiles: 100,
        }),
    ],
    exitOnError: false,
});

// If the app is started with the command:
// NODE_ENV="debug" node main.js
// Then the below code makes sure that the logs are printed on console as well along with the log files.
if (process.env.LOGLEVEL === "DEBUG") {
    logger.add(
        new winston.transports.Console({
            format: format.combine(format.colorize(), logFormat),
        })
    );
}

function log(level, message, metadata) {
    if (typeof metadata != 'object' && metadata != null) {
        metadata = {
            "value": metadata
        };
    }
    logger.log(level, message, metadata);
}

module.exports.log = log;