const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
const port = 5000;
require('dotenv').config()
console.log(process.env.DB_USER,process.env.DB_PASS)
// const pass = "arabian171277"

// var admin = require("firebase-admin");

var serviceAccount = require("./my-bruje-al-arab-firebase-adminsdk-to42g-0434ef9265.json");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t5r3m.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});


const app = express();
app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', (req, res) => {
  res.send('Hello World!')
})


client.connect(err => {
  const bookings = client.db("burj-al-arab").collection("booking");
  app.post('/addBooking', (req, res) =>{
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
    // console.log(newBooking);
  })
   app.get('/bookings', (req, res) =>{
    //  console.log(req.query.email)
     console.log(req.headers.authorization)

    //  const uid = 'some-uid';
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
    const idToken = bearer.split(' ')[1];
    console.log({idToken});

    admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
      const tokenEmail = decodedToken.email;
      const queryEmail = req.query.email;
      console.log(tokenEmail, queryEmail);

      if(tokenEmail == queryEmail){
        bookings.find({email: queryEmail})
        .toArray((err, documents) =>{
          res.status(200).send(documents);
        
        })
      }
      else{
        res.status(401).send('un-authorize excess')
      }
     
    })
    .catch((error) => {
      res.status(401).send('un-authorize excess')
    });
  }
  else{
    res.status(401).send('un-authorize excess');
  }

   })


//   client.close();
});

app.listen(port)

