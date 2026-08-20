import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { WeaviateStore } from "@langchain/weaviate";
import weaviate, {
  dataType,
  Filters,
  generativeParameters,
  vectorizer,
} from "weaviate-client";

async function connectToVectorStore() {
  const client = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_URL,
    {
      authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || ""),
      headers: {
        "X-Goog-Studio-Api-Key": process.env.GOOGLE_API_KEY || "",
      },
    },
  );
  return client;
}

async function getVectorStoreObj() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const weaviateClient = await connectToVectorStore();

  let vectorStore = new WeaviateStore(embeddings, {
    client: weaviateClient,
    indexName: "langChainProject",
  });
  return vectorStore;
}

export { getVectorStoreObj };
