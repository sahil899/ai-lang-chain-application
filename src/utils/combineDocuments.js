// async function asyncHandler(fn:) {
//     try {
//         await fn();
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }

// module.exports = asyncHandler;

export function combineDocuments(docs) {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}
