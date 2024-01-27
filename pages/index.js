import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      try {
        const accounts = await ethWallet.request({ method: "eth_accounts" });
        handleAccount(accounts[0]);
      } catch (error) {
        console.log("Error fetching accounts: ", error.message);
      }
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
      getATMContract();
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts[0]);
    } catch (error) {
      console.log("Error connecting account: ", error.message);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(balance.toNumber());
      } catch (error) {
        console.log("Error fetching balance: ", error.message);
      }
    }
  };

  const deposit = async () => {
    if (atm && depositAmount > 0) {
      try {
        const tx = await atm.deposit(depositAmount);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.log("Error depositing: ", error.message);
      }
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount > 0) {
      try {
        const tx = await atm.withdraw(withdrawAmount);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.log("Error withdrawing: ", error.message);
      }
    }
  };

  const showTransactionFees = async () => {
    try {
      // Assume a fixed transaction fee of 0.1 ETH
      alert("Transaction Fees: 0.1 ETH");
    } catch (error) {
      console.log("Error showing transaction fees: ", error.message);
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <label>Deposit Amount: </label>
          <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          <label>Withdraw Amount: </label>
          <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <div>
          <button onClick={showTransactionFees}>Transaction Fees</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
