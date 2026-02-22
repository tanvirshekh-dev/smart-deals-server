const express = require("express");
const cors = require("cors");
// environment secure user and pass
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

  const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qqlveqa.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("smart server is running");
});

// database connect user
async function run() {
  try {
    await client.connect();

    const db = client.db("smart_db");
    const productsCollection = db.collection("products");
    const bidsCollection = db.collection("bids");
    const usersCollection = db.collection("users");

    // users API's
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({massage: 'user already exist.'});
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }

      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // Products API's
    app.get("/products", async (req, res) => {
      // const projectField = { title:1, price_min: 1, price_max: 1, image: 1 }
      // const cursor = productsCollection.find().sort({price_min: -1}).skip(5).limit(3).project(projectField);

      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // sob product paite chaile
    app.get('/latest-products', async (req, res) => {
      const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: (id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };
      const option = {};
      const result = await productsCollection.updateOne(query, update, option);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });


    // bids related Apis
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/products/bids/:productId', async (req, res) => {
      const productId = req.params.productId;
      const query = { product: productId }
      const cursor = bidsCollection.find(query).sort({bid_price: -1})
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = {};
      const result = await bidsCollection.findOne(query, option);
      res.send(result);
    });

    app.get('/bids', async (req, res) => {
      const query = {};
      if (query.email) {
        query.buyer_email = email
      }


      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post("/bids", async (req, res) => {
      const newBids = req.body;
      const result = await bidsCollection.insertOne(newBids);
      res.send(result);
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    //  await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`smart server is running on port: ${port}`);
});
