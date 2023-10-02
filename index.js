const express = require("express")
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.undxrsy.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    const charityCollection = client.db('VolunteerNetwork').collection("charities")

    app.get('/charity', async(req,res) => {
        const query ={}
        const cursor = charityCollection.find(query)
        const charities = await cursor.toArray()
        res.send(charities)
    })


  } 
  
  finally {
    
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Volunteer Netwirk Server')
})

app.listen(port, ()=> {
    console.log(`Volunteer Network server running on port ${port}`)
})