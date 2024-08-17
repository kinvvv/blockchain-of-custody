const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { createContext, CryptoFactory } = require('sawtooth-sdk-js/signing');
const CryptoJS = require('crypto-js')
const protobuf = require('sawtooth-sdk-js/protobuf')
const { createHash } = require('crypto');
const axios = require('axios');
const _hash = (x) => createHash('sha512').update(x).digest('hex').toLowerCase();
const secp256k1 = require('secp256k1')
const { Secp256k1PrivateKey } = require('sawtooth-sdk-js/signing/secp256k1');
const { transcode } = require('buffer');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://shin:1234@localhost:27017/blockchain_forensic', { useNewUrlParser: true, useUnifiedTopology: true, authSource: 'admin' });

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  encryptedPrivKey: { type: String, required: true },
  pubKey: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

app.post('/api/signup', async (req, res) => {
  try {
    const { id, password } = req.body;

    const existingUser = await User.findOne({ id });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const context = createContext('secp256k1');
    const privKey = context.newRandomPrivateKey();
    const signer = new CryptoFactory(context).newSigner(privKey);
    const pubKey = signer.getPublicKey().asHex();

    const encryptedPrivKey = CryptoJS.AES.encrypt(privKey.asHex(), password).toString();

    const newUser = new User({
      id,
      passwordHash,
      encryptedPrivKey,
      pubKey
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    const user = await User.findOne({ id });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({ message: 'Login successful', userId: id, publicKey: user.pubKey });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const FAMILY_NAME = 'coc';
const FAMILY_VERSION = '1.0';
const NAMESPACE = _hash(FAMILY_NAME).substring(0, 6);

app.post('/api/register-transaction', async (req, res) => {
  try {
    const { userId, password, transactionData } = req.body;

    const user = await User.findOne({id: userId});
    if(!user) {
      return res.status(404).json({message: 'User not found'});
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch) {
      return res.status(400).json({message: 'Invalid password'});
    }

    const bytes = CryptoJS.AES.decrypt(user.encryptedPrivKey, password);
    const privateKeyHex = bytes.toString(CryptoJS.enc.Utf8);

    const privateKey = Secp256k1PrivateKey.fromHex(privateKeyHex);
    const context = createContext('secp256k1');
    const signer = new CryptoFactory(context).newSigner(privateKey);

    const payload = {
      ...transactionData,
      userId: userId
    };
    const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf-8');

    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
      familyName: FAMILY_NAME,
      familyVersion: FAMILY_VERSION,
      inputs: [NAMESPACE],
      outputs: [NAMESPACE],
      signerPublicKey: signer.getPublicKey().asHex(),
      nonce: Math.random().toString(),
      batcherPublicKey: signer.getPublicKey().asHex(),
      dependencies: [],
      payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
    }).finish();

    const transaction = protobuf.Transaction.create({
      header: transactionHeaderBytes,
      headerSignature: signer.sign(transactionHeaderBytes),
      payload: payloadBytes
    });

    const transactions = [transaction];

    const batchHeaderBytes = protobuf.BatchHeader.encode({
      signerPublicKey: signer.getPublicKey().asHex(),
      transactionIds: transactions.map(t => t.headerSignature)
    }).finish();

    const batch = protobuf.Batch.create({
      header: batchHeaderBytes,
      headerSignature: signer.sign(batchHeaderBytes),
      transactions: transactions
    });

    const batches = [batch];
    const batchListBytes = protobuf.BatchList.encode({
      batches: batches
    }).finish();

    const response = await axios.post('http://localhost:8008/batches', batchListBytes, {
      headers: {
        'Content-Type': 'application/octet-stream'
      },
    });

    res.json({message: 'Transaction submitted successfully', response: response.data});
  } catch (error) {
    console.error('Error in register transaction:', error);
    res.status(500).json({message: 'Internal server error', error: error.message});
  }
});

function parseTransactionData(data) {
  try{
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Error parsing transaction data:', error);
    return null;
  }
}

app.get('/api/search-transaction/:address', async (req, res) => {
  try {
    const { address } = req.params;
    console.log('Searching for address:', address);

    const stateResponse = await axios.get(`http://localhost:8008/state/${address}`);
    console.log('Raw Sawtooth API response:', stateResponse.data);

    if (stateResponse.data && stateResponse.data.data) {
      const parsedData = parseTransactionData(stateResponse.data.data);
      console.log('Parsed transaction data:', parsedData);
      
      if (parsedData && parsedData.entries && parsedData.entries.length > 0) {
        const formattedData = {
          address: address,
          entries: parsedData.entries
        };
        res.json(formattedData);
      } else {
        res.status(404).json({message: 'No valid entries found in the transaction data'});
      }
    } else {
      console.log('Unexpected response structure:', stateResponse.data);
      res.status(404).json({message: 'Transaction data not found or in unexpected format'});
    }
  } catch(error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({message: 'Internal server error', error: error.message});
  }
});

const authenticateUser = async (req, res, next) => {
  const userId = req.headers.authorization?.split(' ')[1];
  const pubKey = req.query.pubKey;

  if (!userId || !pubKey) {
    return res.status(401).json({ error: '인증 정보가 없습니다.'});
  }

  try {
    const user = await User.findOne({id: userId, pubKey: pubKey});
    if (!user) {
      return res.status(401).json({error: '유효하지 않은 인증 정보'});
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({error: '서버 오류'});
  }
};

app.get('/api/my-transactions', authenticateUser, async (req, res) => {
  try {
    const {pubKey} = req.query;

    const response = await axios.get('http://localhost:8008/transactions');

    const filteredTransactions = response.data.data.filter(transaction => {
      return transaction.header.signer_public_key === pubKey;
    });

    const formattedTransactions = filteredTransactions.map(transaction => {
      const payload = parseTransactionData(transaction.payload);

      return {
        registrationTime: payload.registrationTime,
        transactionId: transaction.header_signature,
        caseNum: payload.caseNum,
        imageFileName: payload.imageFileName,
        deviceType: payload.deviceType,
        status: payload.status,
        imageType: payload.imageType,
      };
    });

    res.json(formattedTransactions);
  } catch (error) {
    console.error('트랜잭션 조회 중 오류 발생:', error);
    res.status(500).json({error: '서버 오류가 발생했습니다.'});
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));