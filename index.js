import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();
const port = process.env.PORT || 4000;
dotenv.config();

//middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // await client.connect();

    const db = client.db("writeflowDB");
    const usersCollection = db.collection("users");
    const blogsCollection = db.collection("blogs");
    const commentsCollection = db.collection("comments");

    //Users related APIs
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //blogs related APIs
    app.post("/blogs", async (req, res) => {
      const newBlog = req.body;
      const result = await blogsCollection.insertOne(newBlog);
      res.send(result);
    });

    app.get("/blogs", async (req, res) => {
      const { email } = req.query;

      const query = {};

      if (email) {
        query.authorEmail = email;
      }

      const cursor = blogsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/blogs/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
      res.send(result);
    });

    app.get("/latest-blogs", async (req, res) => {
      const query = blogsCollection.find().limit(8).sort({ _id: -1 });
      const result = await query.toArray();
      res.send(result);
    });

    app.delete("/blogs/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.deleteOne(query);
      res.send(result);
    });

    // Comments related APIs
    app.post("/comments", async (req, res) => {
      try {
        const newComment = req.body;
        const result = await commentsCollection.insertOne(newComment);
        res.status(201).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    // Get comments
    app.get("/comments/:blogId", async (req, res) => {
      try {
        const { blogId } = req.params;
        const result = await commentsCollection
          .find({ blogId })
          .sort({ _id: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
