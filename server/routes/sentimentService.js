// // backend/sentimentService.js
// import fetch from "node-fetch";

// const HF_API_TOKEN = process.env.HF_API_TOKEN; // store in .env file
// const MODEL = "distilbert-base-uncased-finetuned-sst-2-english"; // classic sentiment model

// export async function analyzeSentimentHF(text) {
//   try {
//     const response = await fetch(
//       `https://api-inference.huggingface.co/models/${MODEL}`,
//       {
//         headers: {
//           Authorization: `Bearer ${HF_API_TOKEN}`,
//           "Content-Type": "application/json"
//         },
//         method: "POST",
//         body: JSON.stringify({ inputs: text })
//       }
//     );

//     const result = await response.json();

//     // Example output: [ [ { label: 'POSITIVE', score: 0.96 } ] ]
//     const prediction = result[0]?.[0] || {};
//     const label = prediction.label?.toLowerCase() || "neutral";
//     const confidence = Math.round((prediction.score || 0.5) * 100);

//     return {
//       label,
//       confidence,
//       model: MODEL
//     };
//   } catch (error) {
//     console.error("Hugging Face sentiment error:", error);
//     return { label: "neutral", confidence: 50, model: MODEL };
//   }
// }

// // Example test
// (async () => {
//   const sample = await analyzeSentimentHF(
//     "I had a really productive day and felt great!"
//   );
//   console.log(sample);
// })();
