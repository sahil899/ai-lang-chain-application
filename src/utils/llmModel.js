import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle({
  model: "gemini-3.1-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
});

export { llm };
