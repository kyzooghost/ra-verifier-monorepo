const express = require('express');
const { TappdClient } = require('@phala/dstack-sdk')
// DSTACK_SIMULATOR_ENDPOINT=http://tappd-simulator:8090
const endpoint = process.env.DSTACK_SIMULATOR_ENDPOINT || 'http://localhost:8090'
const client = new TappdClient(endpoint)

const app = express();
const RECEIVE_PORT = 4000;

app.get('/', async (req, res) => {
    console.log(endpoint)
    const randomNumString = Math.random().toString();
    console.log('randomNumString - ', randomNumString)
    const getRemoteAttestation = await client.tdxQuote(randomNumString);
    res.json(getRemoteAttestation);
});
  
app.listen(RECEIVE_PORT, () => {
    console.log(`Remote Attestation Generator Service listening on port ${RECEIVE_PORT}`);
});
