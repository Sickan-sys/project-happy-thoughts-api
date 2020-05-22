import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

const thoughts = mongoose.model('thoughts', { 
  message: {
        type: String,
        required: true,
        minlenght: [2, "At least 2 characters"],
    },
  hearts: {
       type: Number,
       default: 0
   },
   createdAt:{
        type: Date,
        default: Date.now
    }
  });
  // Start defining your routes here;

  app.get("/", async (req, res) => {
    const resPerPage = 20; // results per page
    const { page } = req.query || 1; // Page
    Thought.find((err, thoughts) => {
      if (err) {
        console.log(err);
        res.status(404).json({ error: "Not found" });
      } else {
        res.json(thoughts);
      }
    })
      .skip(resPerPage * page - resPerPage)
      .sort({ createdAt: "desc" })
      .limit(resPerPage);
  });
  
  app.post("/", async (req, res) => {
    try {
      const thought = new Thought({ message: req.body.message });
      await thought.save();
      res.json(thought);
    } catch (err) {
      res
        .status(400)
        .json({ errors: err.errors, message: "Unable to add new thought" });
    }
  });
  
  app.post("/:thoughtId/like", async (req, res) => {
    const { thoughtId } = req.params;
  
    try {
      const like = await Thought.findById(thoughtId);
      like.hearts += 1;
      like.save();
      res.status(201).json(like);
    } catch (err) {
      res.status(400).json({
        message: "unable to add like, no thought available",
        errors: err.errors
      });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
