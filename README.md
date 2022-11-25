# LoveToken Faucet

A quick, lovely faucet website for LOVE - an ERC20 token on Goerli testnet. This dApp is deployed on [IPFS](https://ipfs.tech/), meaning it's completely Decentralized! Unlike those 'dApps' who whose websites are published on a centralized platform.

## Tokenomics
- Max supply of LOVE will never exceed 100 million
- The *creator*, i.e. the person to deploy the `LoveToken` contract, will get 70% of the total supply at the time of deployment, which is equal to 70 million
- The rest of the 30% of the supply is left for the miner reward, the person who includes a transaction of LOVE into his block
  - No one, not even the creator of **LoveToken** can manually mint new tokens
  - Earning block rewards is the only way to bring new tokens in the network
  - The block reward is by default set at 50 LOVE, this number can be changed by the creator by calling the `setBlockReward(uint)` function
- LOVE has upto 18 decimal precision
  - One **LoveToken** can be divided in 18 smaller parts
- The creator also has the power to destroy the **LoveToken** contract
  - This would remove all LOVE in circulation

## Faucet Contract
- Anyone could get 20 LOVE (the `withdrawalAmount`) every 24 hours (the `withdrawalPeriod`) by calling the `getTokens()` function of the `LoveFaucet` contract
- Only the creator of **LoveToken**, is allowed to change the `withdrawalAmount` and `withdrawalPeriod` of the faucet

## Demo 🚀
- **LoveToken** contract: [LOVE](https://goerli.etherscan.io/token/0x0203b585f090C7Fd0694003f098cbe0A1F5dbFab)
- **LoveFaucet** contract: [LoveFaucet](https://goerli.etherscan.io/address/0x8263754F5854F0bccb8606af594C667325366abd)
- LoveFaucet website IPFS link: [Faucet](https://ipfs.fleek.co/ipfs/QmWAonf9Zjfxmux6sYRWbFNyg184A8vK2NtaEZkt3X4vGw/)

## Tech Stack
JavaScritpt along with the React framework and the Bulma CSS library was used to create the frontend.
Hardhat and ethers.js, for compiling, testing and deploying the contracts.
The smart contracts were written in Solidity, with the help of [OpenZepplin](https://www.openzeppelin.com/) libraries and Remix IDE.

## Limitations
While some basic functionalities of **LoveToken** contract is tested in hardhat, following are few known issues which still persists:
- While transfering tokens directly from MetaMask wallet, the tx fails. While doing the same by loading the contract in the Remix IDE, it goes through successfully. This could be due to the fact that MetaMask wallet by default, multiplies the amount of token by 10^decimals(), in this case it's 18. This causes the tx to fail because it exceeds the balance of the sender.
- After finishing off the project, I realized that there's actually no way to send less than 1 LOVE because I manually overrode the `transfer` and `transferFrom` functions to consider the `amount` input as the no. of tokens. And a fractional value of less than 1 cannot be passed to any function in Solidity
- This function: `getLastWithdrawalTime()`, inside the `LoveFaucet` contract actually has a misleading name. The correct intended name for it would be `getNextWithdrawalTime()`
- The optimizer wasn't switched on during the compilation, which could have minimised both, the deployment cost and the interaction cost.

## What I learned
- What all those famous coins like Tether USD, Shiba Inu, USD Coin, Binance USD actually are
- How faucets work
- Functions and events of ERC-20 standard
