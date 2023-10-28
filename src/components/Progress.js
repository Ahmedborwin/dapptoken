import ProgressBar from "react-bootstrap/ProgressBar";
import { ethers } from "ethers";

const Progress = ({ maxTokens, tokenSold }) => {
  return (
    <div className="my-3">
      <ProgressBar
        now={(tokenSold / maxTokens) * 100}
        label={`${(tokenSold / maxTokens) * 100}%`}
      />
      <p className="text-center my-3">
        Total Tokens: {ethers.utils.formatEther(maxTokens).toString()} / Tokens
        Sold: {ethers.utils.formatEther(tokenSold).toString()}
      </p>
    </div>
  );
};

export default Progress;
