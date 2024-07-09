import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import twilio from "twilio";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const messagingServieSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/", (req, res) => {
  const { message, user: sender, type, members } = req.body;
  if (type === "message.new") {
    members
      .filter((member) => member.user_id !== sender.id)
      .forEach(({ user }) => {
        if (!user.online) {
          twilioClient.messages
            .creaet({
              body: `You have a new message from ${message.user.fullName} - ${message.text}`,
              messagingServiceSid: messagingServieSid,
              to: user.phoneNumber,
            })
            .then(() => console.log("Message Sent"))
            .catch((e) => console.log(e));
        }
      });

    return res.status(200).send("Message sent");
  }

  return res.status(200).send("Not a new message request");
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`server is runing on port ${PORT}`);
});
