import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { ethers } from "ethers";

const Buy = ({ provider, token, crowdsale, price, setIsLoading, accounts }) => {
  //state variables
  const [amount, setAmount] = useState("0");
  const [isWaiting, setIsWaiting] = useState(false);

  //intereact with vendor contract here
  //need a function to call the buytokens
  const buyHandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);

    try {
      const signer = await provider.getSigner(2);

      // const signer = await provider.getSigner();

      // We need to calculate the required ETH in order to buy the tokens...
      const value = ethers.utils.parseUnits(amount.toString(), "ether");

      const transaction = await crowdsale
        .connect(signer)
        .buyTokens({ value: value });

      await transaction.wait();
    } catch {
      window.alert("User rejected or transaction reverted");
    }

    setIsLoading(true);
  };

  return (
    <Form
      onSubmit={buyHandler}
      style={{ maxWidth: "800px", margin: "50px auto" }}
    >
      <Form.Group as={Row}>
        <Col>
          <Form.Control
            type="number"
            placeholder="Enter amount"
            onChange={(e) => setAmount(e.target.value)}
          />
        </Col>
        <Col className="text-center">
          {isWaiting ? (
            <Spinner animation="border" />
          ) : (
            <Button variant="primary" type="submit" style={{ width: "100%" }}>
              Buy Tokens
            </Button>
          )}
        </Col>
      </Form.Group>
    </Form>
  );
};

export default Buy;
