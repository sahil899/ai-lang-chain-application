import { MessagesValue, ReducedValue, StateSchema } from "@langchain/langgraph";
import z from "zod";

const AgentState = new StateSchema({
  messages: MessagesValue,
  llmCalls: new ReducedValue(z.number().default(0), {
    reducer: (x, y) => x + y,
  }),
});

export { AgentState };
