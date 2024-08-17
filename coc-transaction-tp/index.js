const argv = require('minimist')(process.argv.slice(2));
const { TransactionProcessor } = require('sawtooth-sdk-js/processor');
const transactionHandler = require('./handler');

const VALIDATOR_URL = argv.C || 'tcp://localhost:4004';

const transactionProcessor = new TransactionProcessor(VALIDATOR_URL);

transactionProcessor.addHandler(new transactionHandler());
transactionProcessor.start();

console.log(`Starting transaction processor at ${VALIDATOR_URL}`);

process.on('SIGUSR2', () => {
    transactionProcessor._handleShutdown();
})