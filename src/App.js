import { ethers } from "ethers";
import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";

//components
import Navbar from "./components/navbar";
import Information from "./components/Info";
import Buy from "./components/Buy";
import Loading from "./components/Loading";
import Progress from "./components/Progress";
import Sell from "./components/Sell";

//Artifacts
import CROWDSALE_ABI from "./constants/abis/Crowdsale.json";
import TOKEN_ABI from "./constants/abis/Token.json";
import Config from "./constants/config.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [accounts, setAccounts] = useState(null);

  const [account, setAccount] = useState(null);

  const [treasury, setTreasury] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState(null);

  const [accountBalance, setAccountBalance] = useState(null);
  const [accountEthBalance, setAccountEthBalance] = useState(null);

  const [price, setPrice] = useState(null);

  const [crowdsale, setCrowdsale] = useState(null);
  const [token, setToken] = useState(null);

  const [maxSupply, setMaxSupply] = useState(0);
  const [tokensBought, setTokensBought] = useState(0);

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

    //fetch total token Supply
    const tokenSupply = await token.getTotalSupply();
    setMaxSupply(tokenSupply);

    //fetch tokensBought
    const tokensBoughtFetch = await crowdsale.getTokensSold();
    setTokensBought(tokensBoughtFetch);

    //fetch price
    const price = await crowdsale.getTokenPrice();
    setPrice(price);

    // Fetch account balance
    const accountBalance = ethers.utils.formatUnits(
      await token.balanceOf(account),
      18
    );

    setAccountBalance(accountBalance);

    //Fetch account Ether balance

    const etherBalance = await provider.getBalance(account);

    setAccountEthBalance(ethers.utils.formatEther(etherBalance.toString()));

    // Fetch Treasury address and token balance

    const treasuryAcc = await token.getTreasuryAddress();
    setTreasury(treasuryAcc);

    const treasuryTokenBalance = ethers.utils.formatUnits(
      await token.balanceOf(treasuryAcc),
      18
    );
    setTreasuryBalance(treasuryTokenBalance);

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
      <h1 className="my-4 text-center">
        <strong>Token Vending Machine</strong>
      </h1>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className="text-left">
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
          {accountBalance > 0 && (
            <Sell
              provider={provider}
              token={token}
              crowdsale={crowdsale}
              setIsLoading={setIsLoading}
            />
          )}
          <Progress
            maxTokens={maxSupply.toString()}
            tokenSold={tokensBought.toString()}
          />
        </>
      )}

      <hr />

      {account && (
        <Information
          account={account}
          accountBalance={accountBalance}
          etherBalance={accountEthBalance}
          treasury={treasury}
          treasuryBalance={treasuryBalance}
        />
      )}
    </Container>
  );
}

export default App;
