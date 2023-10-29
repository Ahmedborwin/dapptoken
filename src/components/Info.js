const Information = ({
  account,
  accountBalance,
  etherBalance,
  treasury,
  treasuryBalance,
}) => {
  //code here
  return (
    <div className="my-3">
      <p>
        <strong>Account:</strong> {account}
      </p>
      <p>
        <strong>Tokens Owned:</strong> {accountBalance}
      </p>
      <p>
        <strong>Ether Owned: {etherBalance}</strong>
      </p>

      <p>
        <strong>Treasury:</strong> {treasury}
      </p>
      <p>
        <strong>Treasury Balance:</strong> {treasuryBalance}
      </p>
    </div>
  );
};

export default Information;
