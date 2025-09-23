Please follow the steps in the Hackathon Setup guide and run the below queries as per requirement.

Endpoints used to connect with the blockchain
get balances:
http://localhost:1317/cosmos/bank/v1beta1/balances/wasm19weunt25ekfqe5v7mj0k69dwzhdt8qfa0uawuz

get transaction history:
http://localhost:1317/cosmos/tx/v1beta1/txs?query=transfer.sender='wasm19weunt25ekfqe5v7mj0k69dwzhdt8qfa0uawuz'

get all transactions:
http://localhost:1317/cosmos/tx/v1beta1/txs?query=message.action='/cosmwasm.wasm.v1.MsgExecuteContract'

get all accounts:
http://localhost:1317//cosmos/auth/v1beta1/accounts

Other Queries and messages to execute on smart contract

{"get_risk_score":{"address":"wasm19weunt25ekfqe5v7mj0k69dwzhdt8qfa0uawuz"}}

{
  "send": {
    "recipient": "wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5"
  }
}

{
  "oracle_data_update": {
    "data": "{\"address\":\"wasm19weunt25ekfqe5v7mj0k69dwzhdt8qfa0uawuz\",\"risk_score\":6}",
    "signature": "eFg176qDdw1KDxKVQuSWYKXyWVnOzA+GjOwU4rCzhUAw90Xx0dB4bWXU1hRZTh8bOSihju+hGSc3cZ55wcFzPw=="
  }
}

Dependency
npm install @cosmjs/stargate @cosmjs/encoding axios dotenv

Setup:
Once sync with beaker config is done
Conpile and deploy the smart contract
Start oracle server(app.ts)
start the AML server(finalaml.py)

Other important docker commands

docker run --rm -it --mount type=volume,source=wasmd_data,target=/root/.wasmd `
  soumithbasina/wfblockchain:latest /opt/setup_wasmd.sh


docker run --rm -it -p 26657:26657 -p 26656:26656 -p 1317:1317 --mount type=volume,source=wasmd_data,target=/root/.wasmd soumithbasina/wfblockchain:latest /opt/run_wasmd.sh



