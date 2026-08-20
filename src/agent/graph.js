import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../utils/llmModel.js";
import { courseContextTool, generalInfoTool } from "./tools.js";
import { END, START, StateGraph } from "@langchain/langgraph";
import { AgentState } from "./state.js";

const toolsByName = {
  [courseContextTool.name]: courseContextTool,
  [generalInfoTool.name]: generalInfoTool,
};

const tools = Object.values(toolsByName);

const modelWithTools = llm.bindTools(tools);

const llmCall = async (state) => {
  console.log(state.llmCalls);
  return {
    messages: [
      await modelWithTools.invoke([
        new SystemMessage(`You are a helpful course assistant

      You have two tools:
      1. course_info - use it for questions related to the uploaded course material.
      2. general_info - use it for general questions unrelated to the course.

      Decide which tool is appropriate based on the user's question.`),
        ...state.messages,
      ]),
    ],
    llmCalls: 0,
  };
};

const toolNode = async (state) => {
  console.log("calling the tool Node::::");
  const lastMessage = state.messages.at(-1);

  if (lastMessage == null || !AIMessage.isInstance(lastMessage))
    return { messages: [] };

  // console.log(ToolMessage[]);
  //   console.log("last message", lastMessage);
  const result = [];
  for (const toolCall of lastMessage.tool_calls ?? []) {
    // console.log({ toolCall });
    const tool = toolsByName[toolCall.name];
    const observation = await tool.invoke(toolCall);
    // console.log("observation:::::", observation);
    result.push(observation);
  }
  return { messages: result };
};

// conditional Edge;

const shouldContinue = (state) => {
  const lastMessage = state.messages.at(-1);
  if (!lastMessage || !AIMessage.isInstance(lastMessage)) {
    return END;
  }

  if (lastMessage?.tool_calls?.length) {
    return "toolNode";
  }

  return END;
};

const agentBuddy = new StateGraph(AgentState)
  .addNode("llmCall", llmCall)
  .addNode("toolNode", toolNode)
  .addEdge(START, "llmCall")
  .addConditionalEdges("llmCall", shouldContinue, ["toolNode", END])
  .addEdge("toolNode", "llmCall")
  .compile();

export { agentBuddy };

// async function callAgent() {
//   try {
//     console.log("checking the code");
//     const result = await agentBuddy.invoke({
//       messages: [new HumanMessage("Provide the course duration and details")],
//     });
//     console.log(result);
//   } catch (e) {
//     console.log("error*****", e);
//   }
// }

// await callAgent();
