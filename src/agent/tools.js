import { tool } from "@langchain/core/tools";
import * as z from "zod";
import { getllmWithCourseDetailsContext } from ".././rag/course-info-chain.js";
import { llm } from "../utils/llmModel.js";

const courseContextTool = tool(
  async ({ query }, config) => {
    const writer = config.writer;
    if (writer) {
      writer("Fetching you the details related to the course");
    }
    const chainResponse = await getllmWithCourseDetailsContext();
    console.log("query", query);
    const response = await chainResponse.invoke({
      question: query,
    });
    return response;
  },
  {
    name: "course_info_tool",
    description:
      "Use this tool to answer questions related to the course, course duration, modules, syllabus, prerequisites, and other information available in the course document.",
    schema: z.object({
      query: z.string().describe("The user's question about the course"),
    }),
  },
);

const generalInfoTool = tool(
  async ({ query }, config) => {
    const writer = config.writer;
    if (writer) {
      writer("Providing the info please wait");
    }
    const response = await llm.invoke(prompt);
    return response;
  },
  {
    name: "general_info_tool",
    description:
      "Answer general questions that are not related to the course or course document.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The user's general question that is not specifically related to the course",
        ),
    }),
  },
);

export { courseContextTool, generalInfoTool };
