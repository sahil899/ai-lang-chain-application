import "dotenv/config";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";

import { readFile } from "fs/promises";

import { ChatGoogle } from "@langchain/google";
import { getVectorStoreObj } from "./utils/retriever.js";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { combineDocuments } from "./utils/combineDocuments.js";
import readline from "readline";
import { HumanMessage } from "@langchain/core/messages";
import { agentBuddy } from "./agent/graph.js";

let chainResponse;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// async function initialize() {
//   try {
//     const vectorStoreObj = await getVectorStoreObj();
//     const retriverObj = vectorStoreObj.asRetriever();
//     // const result = await vectorStoreObj.similaritySearch(
//     //   "what are the different modules in this course",
//     // );

//     const llm = new ChatGoogle({
//       model: "gemini-3.1-flash-lite",
//     });

//     // console.log(llm.profile);

//     const refineQuestionPromptTemplate =
//       "Given a question, convert it to a standalone question. question: {question} standalone question:";
//     const refineQuestionPrompt = PromptTemplate.fromTemplate(
//       refineQuestionPromptTemplate,
//     );

//     // console.log(refineQuestionPrompt);

//     const ansTemplate = `You are a helpful, friendly, and enthusiastic support assistant who answers questions about course using only the information provided in the context. Try to find the answer to the question within the given context and provide a clear, accurate, and conversational response. Do not make up information or make assumptions that are not supported by the context. If you cannot find the answer in the provided context, respond with "I'm sorry, I don't know the answer to that." and suggest contacting sahil@gmail.com for further assistance. Always keep your tone natural and friendly, as if you are chatting with a friend.
//     context: {context}
//     originalQuestion: {originalUserQuestion}
//     answer:  `;

//     const ansPrompt = PromptTemplate.fromTemplate(ansTemplate);

//     const refinedQuestionChain = RunnableSequence.from([
//       refineQuestionPrompt,
//       llm,
//       new StringOutputParser(),
//     ]);

//     // const dbContext = RunnableSequence.from([refinedQuestion, retriverObj]);
//     // console.log(
//     //   await refinedQuestion.invoke({
//     //     question: "what is the duration of different modules in the course",
//     //   }),
//     // );

//     const retriverchain = RunnableSequence.from([
//       (prevResult) => prevResult.refinedQuestion,
//       retriverObj,
//       combineDocuments,
//     ]);

//     const answerChain = RunnableSequence.from([
//       ansPrompt,
//       llm,
//       (input) => {
//         // console.log("input profile", input);
//         return input;
//       },
//       new StringOutputParser(),
//     ]);

//     chainResponse = RunnableSequence.from([
//       {
//         refinedQuestion: refinedQuestionChain,
//         original_input: new RunnablePassthrough(),
//       },
//       {
//         context: retriverchain,
//         originalUserQuestion: ({ original_input }) => original_input.question,
//       },
//       answerChain,
//     ]);

//     // console.log(
//     //   await chain.invoke({
//     //     question: "how much time will it take to complete all the modules",
//     //   }),
//     // );

//     // const refineQuestion = RunnableSequence.from([refineQuestionPrompt, llm]);
//     // console.log(refineQuestion);

//     // const response = await refineQuestion.invoke({
//     //   question:
//     //     "what is the duration of the the different modules in the course",
//     // });

//     // console.log(
//     //   await llm.invoke(
//     //     await refineQuestionPrompt.invoke({
//     //       question: "what is the total duration of the course",
//     //     }),
//     //   ),
//     // );

//     // console.log(response);
//     // need to run initially for uploading of the sample ddocuments

//     // const output = await uploadSpecificDocument();
//     // console.log(output);
//     // await vectorStore.addDocuments(output);
//   } catch (e) {
//     console.log("error", e);
//   }
// }

async function uploadSpecificDocument() {
  const file = await readFile("./text-info.txt", "utf-8");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ["\n\n", "\n", " ", ""],
  });
  const output = await splitter.createDocuments([file]);
  console.log("output", output);
  return output;
}

// function categoriesChatHistory(conservationArr) {
//   return conservationArr
//     .map((chat, i) => {
//       if (i % 2 == 0) {
//         return `Human:${chat}`;
//       } else {
//         return `AI: ${chat}`;
//       }
//     })
//     .join("\n");
// }

// async function chatFunction(question) {
//   const response = await chainResponse.invoke({ question });
//   return response;
// }

// async function startChat() {
//   await initialize();
//   console.log("knowlege chatbot is ready");
//   // console.log(rl);
//   rl.question("You: ", async function ask(question) {
//     if (question.toLowerCase() === "exit") {
//       rl.close();
//       return;
//     }

//     try {
//       const response = await chatFunction(question);

//       console.log("AI:", response);

//       rl.question("You: ", ask);
//     } catch (error) {
//       console.error("Error:", error);
//       rl.question("You: ", ask);
//     }
//   });
// }

// await startChat();

// await initialize();

async function callAgent() {
  try {
    console.log("checking the code");
    const result = await agentBuddy.invoke({
      messages: [
        new HumanMessage(
          "Provide the course total duration and how many days will it take to complete to course",
        ),
      ],
    });
    const lastMessage = result.messages[result.messages];
    for (const message of result.messages) {
      console.log(`[${message.type}]: ${message.text}`);
    }
  } catch (e) {
    console.log("error*****", e);
  }
}

console.log("Google API key exists:", !!process.env.GOOGLE_API_KEY);
await callAgent();
