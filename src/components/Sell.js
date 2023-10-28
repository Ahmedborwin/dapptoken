import { Form } from "react-bootstrap";

const Sell = ({ provider, token, crowdsale, price, setIsLoading }) => {
  // code here

  return (
    <div>
      <Form
        onSubmit={sellhandler}
        style={{ maxWidth: "800px", margin: "50px auto" }}
      >
        <Form.Group as={Row}
      </Form>
    </div>
  );
};
