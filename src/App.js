import React, { useEffect, useState } from 'react'
import web3 from './web3'
import lottery from './lottery'

const App = () => {

  const [manager, setManager] = useState('')
  const [count, setCount] = useState(0)
  const [balance, setBalance] = useState('')
  const [value, setValue] = useState(0)
  const [msg, setMsg] = useState({msg: ''})

  useEffect(() => {
    async function fetchdata() {
      const manager = await lottery.methods.manager().call()
      setManager(manager)
      setCount(await lottery.methods.totalPlayers().call())
      setBalance(await web3.eth.getBalance(lottery.options.address))
    }
    fetchdata()
  }, [manager, count, balance])

  const onSubmit = async (e) => {
    e.preventDefault()
    const accounts = await web3.eth.getAccounts()
    setMsg({msg: 'wating on transaction success'})
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(value, 'ether')
    })
    setMsg({msg: 'You have now been entered'})
    window.location.reload()
  }

  const onClick = async ()  => {
    const accounts = await web3.eth.getAccounts()
    setMsg({msg: 'wating on transaction success'})
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    })
    setMsg({msg: 'A winner has been picked'})
    window.location.reload()
  }

  return (
    <div>
    <h2>Lottery</h2>
    <p>This contract is managed by {manager}</p>
    <p>Total Number of players: {count}</p>
    <p>Total balance: {web3.utils.fromWei(balance, 'ether')} ETH</p>
    <hr />
    <form onSubmit={onSubmit}>
      <h4>Want to try your luck</h4>
      <div>
        <label htmlFor="">Amount fo ETH to enter</label>
        <input 
          type="text" 
          value={value}
          onChange={(e) => {setValue(e.target.value)}}
        />
      </div>
      <button>Enter</button>
    </form>
    <hr />
      <h4>Reday to pick a winner?</h4>
      <button onClick={onClick}>Pick a winner</button>
    <hr />
    <h1>{msg.msg}</h1>
    </div>
  )
}

export default App; 