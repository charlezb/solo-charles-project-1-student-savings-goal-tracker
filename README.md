# Student Savings Goal Tracker

A Soroban-powered web application that allows students to create savings goals and track their progress on-chain using the Stellar blockchain.

## Problem

Many students struggle to stay consistent with saving money for important expenses such as tuition, laptops, school supplies, and emergency funds. Traditional note-taking apps and spreadsheets can track progress, but they do not provide a transparent and verifiable record of savings milestones.

Student Savings Goal Tracker provides a simple way for students to create a savings goal and record their progress on-chain using Stellar Soroban smart contracts.

## How It Works

1. Connect a Stellar wallet using Freighter.
2. Create a savings goal by entering:

   * Goal Name
   * Target Amount
3. The goal is stored on-chain through a Soroban smart contract.
4. Users can contribute progress toward the goal.
5. The application updates and displays:

   * Goal Name
   * Current Saved Amount
   * Target Amount
   * Progress Percentage
6. All goal state updates are recorded through the deployed smart contract.

## How It Uses Stellar

This project uses Stellar Soroban smart contracts to store and manage savings goal data on-chain.

Features include:

* Soroban smart contract deployment on Stellar Testnet
* On-chain storage of savings goal information
* Contract state updates through Soroban transactions
* Freighter wallet integration for transaction signing
* Stellar SDK integration for blockchain interaction

The smart contract currently functions as a savings progress tracker rather than a custodial savings vault. No XLM or token deposits are held by the contract.

## Track

Track 5 – Social Impact

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Soroban Smart Contracts
* Rust
* Stellar SDK
* Freighter Wallet
* Stellar Testnet

## Setup & Run

### Clone the Repository

```bash
git clone https://github.com/charlezb/solo-charles-project-1-student-savings-goal-tracker.git
cd student-savings-goal-tracker
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create:

```bash
web/.env.local
```

Add:

```env
NEXT_PUBLIC_CONTRACT_ID=YOUR_CONTRACT_ID
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Requirements

* Node.js v24+
* Rust
* Stellar CLI
* Freighter Wallet

## Network Details

* Network: Stellar Testnet
* Contract ID: CBVWBSXB5MPZRJOYEHIAWTF5WTSIGH7JIY7DPZMQSHVEIH7E5L3GHLM3
* Wallet: Freighter

## Current Features

* Wallet Connection
* Goal Creation
* On-Chain Goal Storage
* Contribution Tracking
* Progress Visualization
* Soroban Smart Contract Integration

## Future Improvements

* Goal Description
* Goal Categories
* Deadlines and Milestones
* Contribution History
* Multi-user Support
* Real XLM/USDC Savings Vault Functionality

## Team

* Charles Betonio - charlezb

## Acknowledgements

Built during the StellarX Philippines Soroban Workshop using the official workshop starter template and extended with custom smart contract and frontend functionality.

