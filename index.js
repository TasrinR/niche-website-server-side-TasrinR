const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2zkrb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
  try {
    await client.connect();
    console.log('Mongo connected');
    const database = client.db('ProductShop');
    const productsCollection = database.collection('products');
    const usersCollection = database.collection('users');
    const ordersCollection = database.collection('orders');
    const reviewsCollection = database.collection('reviews');
    // GET API
    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    app.get('/products', async (req, res) => res.json(await productsCollection.find({}).toArray()));
    app.get('/users', async (req, res) => res.json(await usersCollection.find({}).toArray()));
    app.get('/reviews', async (req, res) => res.json(await reviewsCollection.find({}).toArray()));

    app.get('/products/:id', async (req, res) => {
      const { id } = req.params;
      const product = await productsCollection.findOne({ _id: ObjectId(id) })
      console.log(product);
      res.send(product);
    });

    app.get('/users/:email', async (req, res) =>{
      const email = req.params.email
      const user = await usersCollection.findOne({email})
      if(user?.role === 'admin'){
        res.json({admin:true})
      }else {
        res.json({admin:false})
      }
      })

    

    // POST API
    app.post('/orders', async (req, res) => {
      const newOrder = req.body;
      const result = await ordersCollection.insertOne(newOrder);
      console.log('got new order', req.body);
      console.log('added order', result);
      res.json(req.body)
    });
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      console.log('got new product', req.body);
      console.log('added product', result);
      res.json(req.body)
    });

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      console.log('got new user', req.body);
      console.log('added user', result);
      res.json(req.body);
    });
    app.post('/reviews', async (req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      console.log('got new review', req.body);
      console.log('added review', result);
      res.json(req.body);
    });
    
    //UPDATE API
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.updateOne(query, {$set: {orderStatus: 'shipped'}});

      console.log(result);

      res.json(result);
    });
    // DELETE API
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);

      console.log('deleting order with id ', result);

      res.json(result);
    })
  }
  finally {
    // await client.close()
  }

}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('getting the product api!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})