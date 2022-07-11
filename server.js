const express = require("express");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");

const PORT = 3000;
const app = express();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ecommercedb",
  password: "",
  port: 5432,
});

// Add a new GET endpoint /customers/:customerId/orders to load all the orders along the items in the orders of a specific customer.
// Especially, the following information should be returned: order references, order dates, product names, unit prices, suppliers and quantities.
app.get("/customers/:customerId/orders", (req, res) => {
  let customerId = req.params.customerId;

  const getCustomerOrders =
    "select o.order_reference, o.order_date, p.product_name, p.unit_price, s.supplier_name " +
    "from orders o join order_items oi on o.id = oi.order_id " +
    "join products p on p.id = oi.product_id " +
    "join suppliers s on p.supplier_id = s.id " +
    "where o.customer_id = $1";

  pool
    .query(getCustomerOrders, [customerId])
    .then((result) => res.json(result.rows))
    .catch((error) => console.error("Something is wrong " + error));
});

// Add a new POST endpoint /customers/:customerId/orders to create a new order (including an order date, and an order reference)
// for a customer. Check that the customerId corresponds to an existing customer or return an error.
app.post("/customers/:customerId/orders", (req, res) => {
  let customerId = req.params.customerId;

  let orderDate = req.body.order_date;
  let orderRef = req.body.order_reference;
  console.log("Id " + customerId);

  const checkCustomer = "select * from customers where id = $1";
  const insertOrder =
    "insert into orders(order_date, order_reference, customer_id) values($1, $2, $3)";

  pool
    .query(checkCustomer, [customerId])
    .then((result) => {
      if (result.rows.length > 0) {
        pool
          .query(insertOrder, [orderDate, orderRef, customerId])
          .then(() => res.send("Order created"))
          .catch((error) =>
            console.error("Something is wrong when adding new order" + error)
          );
      } else {
        res.status(400).send("Customer id " + customerId + " does not exist");
      }
    })
    .catch((error) => console.error("Something is wrong " + error));
});

app.listen(PORT, () => console.info(`App Listeing on Port ${PORT}`));
//app.us(express.urlencoded({extended: true}));
