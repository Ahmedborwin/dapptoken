import { ethers } from "ethers";
import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";

//components
import Navbar from "./components/navbar";
import Information from "./components/Info";
import Buy from "./components/Buy";
import Loading from "./components/Loading";
//Artifacts
import CROWDSALE_ABI from "./constants/abis/Crowdsale.json";
import TOKEN_ABI from "./constants/abis/Token.json";
import Config from "./constants/config.json";

function App() {
  const [provider, setProvider] = useState(null);

  const [accounts, setAccounts] = useState(null);
  const [account, setAccount] = useState(null);
  const [treasury, setTreasury] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [treasuryBalance, setTreasuryBalance] = useState(null);

  const [price, setPrice] = useState(null);

  const [crowdsale, setCrowdsale] = useState(null);
  const [token, setToken] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadBlockChain = async () => {
    //connect to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    //fetch chainId
    const { chainId } = await provider.getNetwork();

    //initiate contracts
    //Token contract
    const token = new ethers.Contract(
      Config[chainId].token.address,
      TOKEN_ABI,
      provider
    );
    setToken(token);
    //vendor
    const crowdsale = new ethers.Contract(
      Config[chainId].crowdsale.address,
      CROWDSALE_ABI,
      provider
    );
    setCrowdsale(crowdsale);

    //Fetch Account
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccounts(accounts);

    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    // Fetch account balance
    const accountBalance = ethers.utils.formatUnits(
      await token.balanceOf(account),
      18
    );
    setAccountBalance(accountBalance);

    // Fetch Treasury address and token balance

    const treasuryAcc = await token.getTreasuryAddress();
    setTreasury(treasuryAcc);

    const treasuryTokenBalance = ethers.utils.formatUnits(
      await token.balanceOf(treasury),
      18
    );

    setTreasuryBalance(treasuryTokenBalance);

    //fetch price
    const price = await crowdsale.getTokenPrice();
    setPrice(price);

    console.log("FINAL STEP");

    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      loadBlockChain();
    }
  }, [isLoading]);

  return (
    <Container>
      <Navbar />
      <h1>Token Vending Machine</h1>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className="text-center">
            <strong>Current Price:</strong>{" "}
            {ethers.utils.formatEther(price.toString())} ETH
          </p>
          <Buy
            provider={provider}
            token={token}
            crowdsale={crowdsale}
            price={price}
            setIsLoading={setIsLoading}
            accounts={accounts}
          />
          {account && (
            <Information
              account={account}
              accountBalance={accountBalance}
              treasury={treasury}
              treasuryBalance={treasuryBalance}
            />
          )}
        </>
      )}
    </Container>
  );
}

export default App;
