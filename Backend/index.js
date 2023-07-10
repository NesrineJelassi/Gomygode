const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()
const Stripe = require('stripe')

const app = express()
app.use(cors())
app.use(express.json({limit : "10mb"}))

const PORT = 5600

//Mongodb connection
mongoose.set('strictQuery',false);
mongoose.connect(process.env.MONGODB_URL)
.then(()=>console.log("Connect to Database"))
.catch((err)=>console.log(err))

//Schema
const userSchema = mongoose.Schema({
    lastName: String,
    firstName: String,
    email: {
        type : String,
        unique : true,
    },
    password: String,
    confirmPassword: String,
    image : String,
}) 

//
const userModel = mongoose.model("user", userSchema)
//Api
app.get("/",(req,res)=>{
    res.send("server is running")
})
// Api sign up
app.post("/signup",(req, res) => {
  console.log(req.body);
  const { email } = req.body;

  userModel
    .findOne({ email })
    .then((result) => {
      console.log(result);
      if (result) {
        return res.send({ message: "L'identifiant de messagerie est déjà enregistré", alert: false });
      } else {
        const data = new userModel(req.body);
        return data.save();
      }
    })
    .then(() => {
      return res.send({ message: "Inscription réussie", alert: true });
    })
    .catch((err) => {
      return res.status(500).send({ message: "Une erreur s'est produite" });
    });
});

// Api login
app.post("/login", (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  userModel
    .findOne({ email })
    .then((result) => {
      if (result && result._id) { // Check if result is defined and has _id property
        const dataSend = {
          _id: result._id,
          lastName: result.lastName,
          firstName: result.firstName,
          email: result.email,
          image: result.image,
        };
        console.log(dataSend)
        res.send({ message: "La connexion est réussie", alert: true, data: dataSend });
      } 
      else {
        res.send({ message: "Email n'est pas disponible, veuillez vous s'inscrire", alert: false });
      }
    })
    .catch((err) => {
      return res.status(500).send({ message: "Une erreur s'est produite" });
    });
});

//Product section
const schemaProduct = mongoose.Schema({
 name : String,
  category : String,
  image : String,
  price : String,
  description : String,
});
const productModel = mongoose.model("product",schemaProduct)

//Save product in data
//Api
app.post("/uploadProduct",async(req,res)=>{
  console.log(req.body)
  const data = await productModel(req.body)
  const dataSave = await data.save()
  res.send({message: "Chargement réussi"})
})

//
app.get("/product",async(req,res)=>{
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
})
 
/*****payment getWay */

const stripe  = new Stripe("sk_test_51NSOFIFH2g63ceDbJbozQpXkPdhMmk2zffpyr2l5b1AkPC8Zte9Ntc7I4DeTaIQHOZmq9cfAQEVop7pHJmbxTJXz00JVvhiDUc")

app.post("/create-checkout-session",async(req,res)=>{

     try{
      const params = {
          submit_type : 'pay',
          mode : "payment",
          payment_method_types : ['card'],
          billing_address_collection : "auto",
          shipping_options : [{shipping_rate : "shr_1N0qDnSAq8kJSdzMvlVkJdua"}],

          line_items : req.body.map((item)=>{
            return{
              price_data : {
                currency : "inr",
                product_data : {
                  name : item.name,
                  // images : [item.image]
                },
                unit_amount : item.price * 100,
              },
              adjustable_quantity : {
                enabled : true,
                minimum : 1,
              },
              quantity : item.qty
            }
          }),

          success_url : "http://localhost:5600/success",
          cancel_url : "http://localhost:5600/cancel",

      };

      
      const session = await stripe.checkout.sessions.create(params)
      // console.log(session)
      res.status(200).json(session.id)
     }
     catch (err){
        res.status(err.statusCode || 500).json(err.message)
     }

});


//Server is running
app.listen(PORT,()=>console.log("Server is running at port : " + PORT))          