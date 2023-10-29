import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { ethers } from "ethers";

const Sell = ({ provider, token, crowdsale, setIsLoading }) => {
  // code here
  const [amount, setAmount] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);

  const approveHandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);

    try {
      //get Signer
      const signer = await provider.getSigner();

      //get amount of tokens

      const tokenAmount = ethers.utils.parseEther(amount);

      const approveTransaction = await token
        .connect(signer)
        .approve(crowdsale.address, tokenAmount);
      await approveTransaction.wait();
    } catch {
      window.alert("User Rejected or transaction reverted");
    }

    setIsLoading(true);
  };

  const sellhandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);

    try {
      //get Signer
      const signer = await provider.getSigner();

      //get amount of tokens

      const tokenAmount = ethers.utils.parseEther(amount);

      const sellTransaction = await crowdsale
        .connect(signer)
        .sellTokens(tokenAmount);
      await sellTransaction.wait();
    } catch {
      window.alert("User Rejected or transaction reverted");
    }

    setIsLoading(true);
  };

  return (
    <>
      <Form
        onSubmit={approveHandler}
        style={{ maxWidth: "800px", margin: "50px auto" }}
      >
        <Form.Group as={Row}>
          <Col>
            <Form.Control
              type="number"
              placeholder="Tokens to Approve"
              onChange={(e) => setAmount(e.target.value)}
            />
          </Col>
          <Col className="text-center">
            {isWaiting ? (
              <Spinner animation="border" />
            ) : (
              <Button variant="primary" type="submit" style={{ width: "100%" }}>
                Approve Tokens
              </Button>
            )}
          </Col>
        </Form.Group>
      </Form>
      <Form
        onSubmit={sellhandler}
        style={{ maxWidth: "800px", margin: "50px auto" }}
      >
        <Form.Group as={Row}>
          <Col>
            <Form.Control
              type="number"
              placeholder="Tokens to Sell"
              onChange={(e) => setAmount(e.target.value)}
            />
          </Col>
          <Col className="text-center">
            {isWaiting ? (
              <Spinner animation="border" />
            ) : (
              <Button variant="primary" type="submit" style={{ width: "100%" }}>
                Sell Tokens
              </Button>
            )}
          </Col>
        </Form.Group>
      </Form>
    </>
  );
};

export default Sell;
