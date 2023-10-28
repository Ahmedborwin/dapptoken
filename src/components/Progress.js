const Progress = ({ maxTokens, tokenSold }) => {
  return (
    <div className="my-3">
      <p className="text-center my-3">
        Total Tokens: {maxTokens} / Tokens Sold: {tokenSold}{" "}
      </p>
    </div>
  );
};

export default Progress;
