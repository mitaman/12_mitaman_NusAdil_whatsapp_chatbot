const axios = require("axios");
const fs = require("fs");
const path = require("path");
const qs = require("qs"); // form-urlencoded support

// Make sure chats folder exists
if (!fs.existsSync("chats")) {
  fs.mkdirSync("chats");
}

function saveChats(jid, messages) {
  const jsonString = JSON.stringify(messages, null, 2);
  fs.writeFileSync("chats/" + jid + ".json", jsonString);
}

function loadChats(jid) {
  return JSON.parse(fs.readFileSync("chats/" + jid + ".json", "utf8"));
}

function isSession(jid) {
  return fs.existsSync("chats/" + jid + ".json");
}

class botSession {
  constructor(jid) {
    this.jid = jid;
    if (isSession(jid)) {
      this.messages = loadChats(jid);
    } else {
      this.messages = [];
    }
  }

  async getprompt(userInput) {
    this.messages.push({ role: "user", content: userInput });

    try {
      const response = await axios.post(
        "http://IP,
        qs.stringify({ query: userInput }), // <- send as form-urlencoded
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const answer =
        response.data.answer || "[system] No answer received from API";
      this.messages.push({ role: "bot", content: answer });
      saveChats(this.jid, this.messages);

      return [answer];
    } catch (error) {
      console.error("API error:", error.message);
      const errorMsg = "[system] Failed to fetch answer from API";
      this.messages.push({ role: "bot", content: errorMsg });
      saveChats(this.jid, this.messages);

      return [errorMsg];
    }
  }
}

module.exports = { botSession };
