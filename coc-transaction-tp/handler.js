const { TransactionHandler } = require('sawtooth-sdk-js/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk-js/processor/exceptions');
const crypto = require('crypto');
const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase();

const FAMILY_NAME = 'coc';
const FAMILY_VERSION = '1.0';
const NAMESPACE = _hash(FAMILY_NAME).substring(0, 6);

class CoCTransactionHandler extends TransactionHandler {
  constructor() {
    super(FAMILY_NAME, [FAMILY_VERSION], [NAMESPACE]);
  }

  apply(transactionProcessRequest, context) {
    const payload = JSON.parse(Buffer.from(transactionProcessRequest.payload, 'utf8').toString());
    const header = transactionProcessRequest.header;
    const userPublicKey = header.signerPublicKey;

    const {
      registrationTime,
      status,
      caseNum,
      location,
      checkerName,
      deviceType,
      imageType,
      imageFileName,
      imageHash,
      userId,
    } = payload;
    
    if (!registrationTime || !status || !caseNum || !location || !checkerName || !deviceType || !imageType || !imageFileName || !imageHash || !userId || !status) {
      throw new InvalidTransaction('All fields are required');
    }

    const address = NAMESPACE + crypto.createHash('sha512').update(caseNum).digest('hex').substring(0, 8) + crypto.createHash('sha512').update(imageHash).digest('hex').substring(0, 56);

    return context.getState([address]).then((stateValues) => {
      let stateValue = {};
      if (stateValues[address] && stateValues[address].length > 0) {
        stateValue = JSON.parse(Buffer.from(stateValues[address], 'base64').toString());
      }

      let newEntry = {
        registrationTime,
        status,
        caseNum,
        location,
        checkerName,
        deviceType,
        imageType,
        imageFileName,
        imageHash,
        userId,
        owner: userPublicKey
      };

      Object.keys(newEntry).forEach(key => {
        if (newEntry[key] === undefined) {
          newEntry[key] = null;
        }
      });

      if (!stateValue.entries) {
        stateValue.entries = [newEntry];
      } else {
        stateValue.entries.push(newEntry);
      }

      let encodedStateValue = Buffer.from(JSON.stringify(stateValue)).toString('base64');

      let entries = {
        [address]: encodedStateValue
      };

      return context.setState(entries);
    });
  }
}

module.exports = CoCTransactionHandler;
