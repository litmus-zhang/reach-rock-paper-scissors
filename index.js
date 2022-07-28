import React from 'react'
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import { renderDOM, renderView } from './views/render'
import  './index.css'

import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
const reach = loadStdlib(process.env);

const handToInt = { 'ROCK': 0, 'PAPER': 1, 'SCISSORS': 2 };
const intToOutcome = ['Bob Wins', 'Draw', 'Alice Wins'];
const { standardUnit } = reach;
const defaults = { defaultFundAmt: '10', defaultWager: '3', standardUnit };

class App extends React.Component
{ 
    constructor(props)
    {
        super(props)
    this.state = {view: 'ConnectAccount', ...defaults}
    }
    
    async componentDidMount()
    {
        const acc = await reach.getDefaultAccount();
        const balAtomic = await reach.balanceOf(acc);
        const bal = reach.formatCurrency(balAtomic, 4);
        this.setState({ acc, bal });
        if(await reach.canFundFromFaucet())
        {
            this.setState({view: 'FundAccount'})
        } else
        {
            this.setState({view: 'DeployOrAttacher'})
        }
    }
    render(){ return renderView(this, AppViews) }
}

const isAlice = await ask.ask(`Are you Alice?`, ask.yesno)
const who = isAlice ? 'Alice' : 'Bob';

console.log(`Starting Rock-Paper-Scissors as ${who}...`);

let acc = null
const createAcc = await ask.ask(
    `Would you like to create a new account? (Only possible on devnet)`,
    ask.yesno
)
if (createAcc) {
  acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
} else
{
    const secret = await ask.ask(
        `What is your secret key? (leave blank for random)`,
        (x => x)
    )
    acc = await stdlib.newAccountFromSecret(secret);
}

let ctc = null;
if (isAlice) {
  ctc = acc.contract(backend);
  ctc.getInfo().then((info) => {
    console.log(`The contract is deployed as = ${JSON.stringify(info)}`); });
} else {
  const info = await ask.ask(
    `Please paste the contract information:`,
    JSON.parse
  );
  ctc = acc.contract(backend, info);
}

const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = {
    ...stdlib.hasRandom,
}

interact.informTimeout = () =>
{
    console.log(`there was a timeout`);
    process.exit(1);
}
 
if (isAlice)
{
    const amt = await ask.ask(
        `How much do you want to wager?`,
        stdlib.parseCurrency
    )
    interact.wager = amt;
    interact.deadline =  {ETH: 100, ALGO: 100, CFX: 100}[stdlib.connector];
} else
{
    interact.acceptWager = async (amt) =>
    {
        const accepted = await ask.ask(
            `Do you accept the wager of ${fmt(amt)}?`,
            ask.yesno
        )
        if (!accepted) {
            console.log(`You rejected the wager`);
            process.exit(1);
        }
    }
}
const HAND = ['ROCK', 'PAPER', 'SCISSORS'];
const HANDS = {
    'ROCK': 0, 'R': 0, 'r': 0,
    'PAPER': 1, 'P': 1, 'p': 1,
    'SCISSORS': 2, 'S': 2, 's': 2,
}

interact.getHand = async () =>
{
    const hand = await ask.ask(` What hand will you play`, (x) =>
    { 
        const hand = HANDS[x];
        if (hand === undefined) {
            throw new Error(`Invalid hand ${x}`);
        }
        return hand;
    });
    console.log(`You played ${HAND[hand]}`);
    return hand;
}

const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
interact.seeOutcome = async (outcome) =>
{
    console.log(`The outcome is ${OUTCOME[outcome]}`);
}

const part = isAlice ? ctc.p.Alice : ctc.p.Bob;
await part(interact);

const after = await getBalance();
console.log(`Your balance is ${after}`);

ask.done();