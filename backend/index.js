const { connection } = require("./src/database/db");
const userRouter = require("./src/userRouter/userRouter");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");



const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

app.use("/user", userRouter);

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Running");
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(PORT, async () => {
  await connection;
  console.log(`Server is running on port ${PORT}`);
});
