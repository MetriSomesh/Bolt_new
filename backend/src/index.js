// const express = require("express");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const nodeBasePrompt = require("./defaults/node");
// const basePrompt = require("./defaults/react");
// const { BASE_PROMPT, getSystemPrompt } = require("./prompts");
// const dotenv = require("dotenv");
// dotenv.config();
// const GEMINI_API_KEY = "AIzaSyAVplto1pycwEEe0_7aG_tW3vL0oqjePB0";
// if (!GEMINI_API_KEY) {
//   throw new Error("Missing GEMINI_API_KEY in environment");
// }
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// const app = express();
// app.use(express.json());

// app.post("/template", async (req, res) => {
//   const prompt = await req.body.prompt;
//   if (!prompt) {
//     return res.status(400).json({ message: "Prompt is required" });
//   }

//   const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash",
//     generationConfig: {
//       maxOutputTokens: 300,
//       candidateCount: 1,
//     },
//     systemInstruction: {
//       parts: [
//         {
//           text: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
//         },
//       ],
//       role: "system",
//     },
//   });

//   const result = await model.generateContent(prompt);
//   const responseText = result.response.text().trim().toLowerCase();
//   console.log("RESPONST TEXT IS : ", responseText);

//   if (responseText === "react") {
//     return res.json({
//       prompt: [
//         BASE_PROMPT,
//         `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
//       ],
//       uiPrompts: [basePrompt],
//     });
//   }

//   if (responseText === "node") {
//     return res.json({
//       prompt: [
//         `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
//       ],
//       uiPrompts: [nodeBasePrompt],
//     });
//   }

//   return res.status(403).json({ message: "Unable to determine project type" });
// });

// app.post("/chat", async (req, res) => {
//   const messages = req.body.messages;

//   if (!messages) {
//     return res.status(400).json({ message: "Messages are  required" });
//   }

//   const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash",
//     generationConfig: {
//       maxOutputTokens: 300,
//       candidateCount: 1,
//     },
//     systemInstruction: {
//       parts: [
//         {
//           text: getSystemPrompt(),
//         },
//       ],
//       role: "system",
//     },
//   });

//   const response = await model.generateContent({
//     messasges: messages,
//   });
//   console.log(response);
//   res.json({});
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodeBasePrompt = require("./defaults/node");
const basePrompt = require("./defaults/react");
const { BASE_PROMPT, getSystemPrompt } = require("./prompts");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

function sanitizeResponseText(responseText) {
  // Remove all occurrences of triple backticks
  let sanitizedText = responseText.replace(/```/g, "");

  // Escape ${} by adding \ before $
  sanitizedText = sanitizedText.replace(/\${/g, "\\${");

  return sanitizedText;
}

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());
app.post("/template", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        maxOutputTokens: 8000,
        candidateCount: 1,
      },
      systemInstruction: {
        parts: [
          {
            text: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
          },
        ],
        role: "system",
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().toLowerCase();
    console.log("RESPONSE TEXT IS: ", responseText);

    if (responseText === "react") {
      return res.json({
        prompt: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [basePrompt],
      });
    }

    if (responseText === "node") {
      return res.json({
        prompt: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
    }

    return res
      .status(403)
      .json({ message: "Unable to determine project type" });
  } catch (error) {
    console.error("Error in /template route:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: "Valid messages array is required",
      });
    }

    // Transform ALL messages to Gemini API format, preserving the entire context
    const formattedHistory = messages.map((message) => ({
      role: message.role || "user",
      parts: [{ text: message.content }],
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 20000,
        temperature: 1.0, // Add some creativity
      },
      systemInstruction: {
        parts: [
          {
            text: getSystemPrompt(),
          },
        ],
        role: "model",
      },
    });

    // Key change: Send ALL messages at once, not just splitting history
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 20000,
      },
    });

    // Send the last message with full context
    const lastMessage =
      formattedHistory[formattedHistory.length - 1].parts[0].text;
    const response = await chat.sendMessage(lastMessage);

    // Extract and send response
    const responseText = await response.response.text();
    const sanatizedText = sanitizeResponseText(responseText);
    // console.log(responseText);
    res.json({
      message: sanatizedText,
      success: true,
    });
  } catch (error) {
    console.error("Chat Route Error:", error);

    res.status(500).json({
      message: "Error processing chat request",
      error: error.message,
    });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
