import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";
import { readFile } from "fs/promises";

import { ChatGoogle } from "@langchain/google";
import { getVectorStoreObj } from "../utils/retriever.js";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { combineDocuments } from "../utils/combineDocuments.js";
import readline from "readline";
import { llm } from "../utils/llmModel.js";

export async function getllmWithCourseDetailsContext() {
  const vectorStoreObj = await getVectorStoreObj();
  const retriverObj = vectorStoreObj.asRetriever();
  const model = llm;

  const refineQuestionPromptTemplate =
    "Given a question, convert it to a standalone question. question: {question} standalone question:";
  const refineQuestionPrompt = PromptTemplate.fromTemplate(
    refineQuestionPromptTemplate,
  );

  const ansTemplate = `You are a helpful, friendly, and enthusiastic support assistant who answers questions about course using only the information provided in the context. Try to find the answer to the question within the given context and provide a clear, accurate, and conversational response. Do not make up information or make assumptions that are not supported by the context. If you cannot find the answer in the provided context, respond with "I'm sorry, I don't know the answer to that." and suggest contacting sahil@gmail.com for further assistance. Always keep your tone natural and friendly, as if you are chatting with a friend.
    context: {context}
    originalQuestion: {originalUserQuestion}
    answer:  `;

  const ansPrompt = PromptTemplate.fromTemplate(ansTemplate);
  const refinedQuestionChain = RunnableSequence.from([
    refineQuestionPrompt,
    llm,
    new StringOutputParser(),
  ]);

  const retriverchain = RunnableSequence.from([
    (prevResult) => prevResult.refinedQuestion,
    retriverObj,
    combineDocuments,
  ]);

  const answerChain = RunnableSequence.from([
    ansPrompt,
    llm,
    (input) => {
      // console.log("input profile", input);
      return input;
    },
    new StringOutputParser(),
  ]);

  const chainResponse = RunnableSequence.from([
    {
      refinedQuestion: refinedQuestionChain,
      original_input: new RunnablePassthrough(),
    },
    {
      context: retriverchain,
      originalUserQuestion: ({ original_input }) => original_input.question,
    },
    answerChain,
  ]);

  return chainResponse;
}
