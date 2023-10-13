const express = require("express")
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


function verify(req,res,next){
  const authHeader = req.headers.authorization
  if(!authHeader){
    return res.status(401).send({message:'unauthorized access'})
  }
  const token = authHeader.split(' ')[1]
   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
    if(err){
      return res.status(401).send({message:'unauthorized access'})
    }
    req.decoded =decoded
    next()
   })
}

async function run() {
  try {
   
    const charityCollection = client.db('VolunteerNetwork').collection("charities")
    const eventCollection = client.db('VolunteerNetwork').collection("events")



    app.post('/jwt', (req,res) => {
      const user = req.body
      console.log(user)
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res.send({token})
    })

    app.get('/charity', async(req,res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
        const query ={}
        const cursor = charityCollection.find(query)
        const charities = await cursor.skip(page*size).limit(size).toArray()
        const count = await charityCollection.estimatedDocumentCount()
        res.send({charities,count})
    })


    app.get('/charity/:id', async(req,res) => {
      const id = req.params.id
      console.log(id)
      const query = {_id : new ObjectId(id)}
      const charity = await charityCollection.findOne(query)
      res.send(charity)
    })

    app.post('/charity', async(req, res)=>{
      const charity = req.body
      const result = await charityCollection.insertOne(charity)
      res.send(result)

    })

    
    app.put('/charity/:id', async(req,res) => {
      const charity = req.body
      const id = req.params.id
      
      const filter = { _id : new ObjectId(id)}
      const options = { upsert: true };
      const updatedDoc ={ 
        $set: {
          img:charity.img,
          name:charity.name,
          color:charity.color
        }
      }

      const result = await charityCollection.updateOne(filter,updatedDoc,options)
      res.send(result)
      
    })
    

    app.get('/events', verify, async(req,res)=>{

      const decoded = req.decoded
      if(decoded.email !== req.query.email){
        return res.status(401).send({message:'unauthorized access'})
      }

      let query = {}
      if(req.query.email){
        query={
          email:req.query.email
        }
      }
      const cursor = eventCollection.find(query)
      const events = await cursor.toArray()
      res.send(events)
    })

    app.post('/events', async(req,res)=> {
      const event = req.body
      const result = eventCollection.insertOne(event)
      res.send(result)
    })

    app.delete('/events/:id', async(req,res)=>{
      const id = req.params.id
      console.log(id)
      const query = {_id : new ObjectId(id)}
      const result = await eventCollection.deleteOne(query)
      res.send(result)
    })


  } 
  
  finally {
    
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Volunteer Network Server')
})

app.listen(port, ()=> {
    console.log(`Volunteer Network server running on port ${port}`)
})