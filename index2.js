const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

const sequelize = require('./config/db.js');

const main = async () => {
  try {
    sequelize
      .sync()
      .then(() => {
        console.log('Tables created.');
      })
      .catch((err) => {
        console.log(err);
      });

    const app = express();
    const port = 3000;

    app.use(bodyParser.json());

    // Generating JWT
    app.post("/user/generateToken", (req, res) => {
      // Validate User Here
      // Then generate JWT Token

      let jwtSecretKey = process.env.JWT_SECRET_KEY;
      let data = {
        time: Date(),
        userId: 12,
      }

      const token = jwt.sign(data, jwtSecretKey);

      res.send(token);
    });

    // Verification of JWT
    app.get("/user/validateToken", (req, res) => {
      // Tokens are generally passed in header of request
      // Due to security reasons.

      let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
      let jwtSecretKey = process.env.JWT_SECRET_KEY;

      try {
        const token = req.header(tokenHeaderKey);

        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
          return res.send("Successfully Verified");
        } else {
          // Access Denied
          return res.status(401).send(error);
        }
      } catch (error) {
        // Access Denied
        return res.status(401).send(error);
      }
    });


    app.listen(port, () => console.log(`Listening on port ${port}`));

  } catch (error) {
    console.log(error.message);
  }
};

main();
