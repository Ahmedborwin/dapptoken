import logo from "./logo.svg";
import "./App.css";
const { Network, Alchemy } = require("alchemy-sdk");

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: "iZGrpzx_x8aCCPLR-5h2s11pfqFdfz4K", // Replace with your Alchemy API Key.
  network: Network.ETH_SEPOLIA, // Replace with your network.
};

const alchemy = new Alchemy(settings);

const blockNumber = alchemy.core.getBlockNumber().then(console.log);

//read my smart contract
//read taxtoken
//read vendor

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <header className="App-header bg-blue-500 text-white text-2xl p-4">
        Header Content
      </header>
      <div className="container mx-auto p-4">
        <div className="text-4xl font-bold mb-4">Token Vendor</div>
        <div className="text-lg">
          Current Block Number: <span className="font-mono">{blockNumber}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
