const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())
const {interface, bytecode} = require('../compile')

let accounts;
let lottery;

beforeEach(async() => {
    accounts = await web3.eth.getAccounts()

    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
        data: bytecode,
    })
    .send({
        gas: '1000000',
        from: accounts[0]
    })
})

describe('Lottery Contract', () => {
    it('Contract deployed', () => {
        assert.ok(lottery.options.address)
    })

    it('Enter one account into lottery', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.strictEqual(accounts[0], players[0])
        assert.strictEqual(1, players.length)
    })

    it('Enter multiple accounts into lottery', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        })
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.strictEqual(accounts[0], players[0])
        assert.strictEqual(accounts[1], players[1])
        assert.strictEqual(2, players.length)
    })

    it('minimum account of ether', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether')
            })
            assert(false)
        }catch(err) {
            assert(err)
        }
    })

    it('Pick winner',async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[0]
            })
            assert(false)
        }catch(err){
            assert(err)
        }
    })

    it('sends money and resets state', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        })
        const initialBalance = await web3.eth.getBalance(accounts[0])
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        })
        const finalBalance = await web3.eth.getBalance(accounts[0])
        const difference = finalBalance - initialBalance
        assert(difference > web3.utils.toWei('1.8', 'ether'))

    })
})