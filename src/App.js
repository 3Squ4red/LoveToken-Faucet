import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import faucetContract from "./ethereum/faucet";

// eslint-disable-next-line no-extend-native
String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
};

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [faucet, setFaucet] = useState();
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        // Get provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = faucetContract(signer);

        // Setting the states
        setSigner(signer);
        setFaucet(contract);

        /* MetaMask is installed */
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (err) {
        alert(err.message);
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      alert("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        // Get provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);

        if (accounts.length > 0) {
          const signer = provider.getSigner();
          const contract = faucetContract(signer);

          // Setting the states
          setSigner(signer);
          setFaucet(contract);
          setWalletAddress(accounts[0]);
        } else {
          alert("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      alert("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      alert("Please install MetaMask");
    }
  };

  const getLoveHandler = async () => {
    setWithdrawSuccess("");
    setWithdrawError("");
    try {
      const nextWithdrawTime = await faucet
        .connect(signer)
        .getLastWithdrawalTime();
      const now = Math.floor(Date.now() / 1000);

      if (nextWithdrawTime > now) {
        const diff = `${nextWithdrawTime - now}`.toHHMMSS();
        setWithdrawError(
          `Oops! You're trying too soon. Get some LOVE again in ${diff} (hh:mm:ss)`
        );
        return;
      }

      const tx = await faucet.connect(signer).getTokens({ gasLimit: 100000 });
      setWithdrawSuccess("Sending you LOVE! Stay put!");
      setTxHash(tx.hash);
      await tx.wait();

      setWithdrawSuccess("Woohoo! You really got lots of LOVE today! 🥰");
    } catch (error) {
      console.error(error.message);
      setWithdrawSuccess("");
      setWithdrawError(error.message);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">
              LoveToken (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://goerli.etherscan.io/token/0x0203b585f090C7Fd0694003f098cbe0A1F5dbFab"
              >
                LOVE
              </a>
              )
            </h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">FACUET</h1>
            <p>Quick and lovely, get 20 LOVE each day.</p>
            <div className="mt-5">
              {withdrawError && (
                <div className="withdraw-error">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="withdraw-success">{withdrawSuccess}</div>
              )}{" "}
            </div>
            <div className="box address-box">
              <div className="columns">
                <div className="column is-four-fifths">
                  <input
                    className="input is-medium"
                    type="text"
                    defaultValue={walletAddress}
                    placeholder="Enter your wallet address (0x...)"
                  />
                </div>
                <div className="column">
                  <button
                    onClick={getLoveHandler}
                    className="button is-link is-medium"
                    disabled={walletAddress ? false : true}
                  >
                    GET TOKENS
                  </button>
                </div>
              </div>
              <article className="panel is-grey-darker">
                <div className="panel-block">
                  <p>Tx hash</p>
                </div>
                <p className="panel-heading">
                  {txHash ? (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://goerli.etherscan.io/tx/${txHash}`}
                    >
                      {txHash}
                    </a>
                  ) : (
                    "---"
                  )}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
