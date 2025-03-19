import { useState } from "react";
import { ethers } from "ethers";
import PAIR_ABI from "./abi/UniswapV2Pair.json";
import ERC20_ABI from "./abi/ERC20.json";
import { MULTICALL_ADDRESS } from "./constants";

const PairInfo = () => {
  const [pairAddress, setPairAddress] = useState("");
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);

  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

  const fetchPairData = async () => {
    setLoading(true);
    try {
      const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
      const [token0Addr, token1Addr, reserves, totalSupply] = await Promise.all([
        pairContract.token0(),
        pairContract.token1(),
        pairContract.getReserves(),
        pairContract.totalSupply()
      ]);
      
      const token0Contract = new ethers.Contract(token0Addr, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1Addr, ERC20_ABI, provider);
      
      const [token0Details, token1Details] = await Promise.all([
        Promise.all([token0Contract.name(), token0Contract.symbol(), token0Contract.decimals()]),
        Promise.all([token1Contract.name(), token1Contract.symbol(), token1Contract.decimals()]),
      ]);

      setPairData({
        token0: { address: token0Addr, name: token0Details[0], symbol: token0Details[1], decimals: token0Details[2] },
        token1: { address: token1Addr, name: token1Details[0], symbol: token1Details[1], decimals: token1Details[2] },
        reserves: {
          token0: ethers.formatUnits(reserves[0], token0Details[2]),
          token1: ethers.formatUnits(reserves[1], token1Details[2]),
        },
        totalSupply: ethers.formatUnits(totalSupply, 18),
      });
    } catch (error) {
      console.error("Error fetching pair data:", error);
      setPairData(null);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Uniswap V2 Pair Info</h1>
      <input
        type="text"
        placeholder="Enter Uniswap V2 Pair Address"
        className="w-full p-2 border rounded"
        value={pairAddress}
        onChange={(e) => setPairAddress(e.target.value)}
      />
      <button
        className="w-full mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={fetchPairData}
        disabled={loading}
      >
        {loading ? "Fetching..." : "Fetch Data"}
      </button>

      {pairData && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-bold">Pair Details</h2>
          <p><strong>Token0:</strong> {pairData.token0.name} ({pairData.token0.symbol})</p>
          <p><strong>Token1:</strong> {pairData.token1.name} ({pairData.token1.symbol})</p>
          <p><strong>Reserves:</strong> {pairData.reserves.token0} {pairData.token0.symbol} & {pairData.reserves.token1} {pairData.token1.symbol}</p>
          <p><strong>Total LP Supply:</strong> {pairData.totalSupply}</p>
        </div>
      )}
    </div>
  );
};

export default PairInfo;
