const axios = require("axios");

// Filter files for review
function filterRelevantFiles(files, maxFiles = 10) {
  const codeFileExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".rb",
    ".php",
    ".go",
    ".c",
    ".cpp",
    ".cs",
    ".swift",
    ".md",
  ];

  // Filter to only include code files and limit the total
  return files
    .filter((file) =>
      codeFileExtensions.some((ext) => file.filename.endsWith(ext))
    )
    .slice(0, maxFiles);
}

// Prepare code for review
function prepareCodeForReview(files) {
  let codeToReview = "";

  files.forEach((file) => {
    if (file.patch) {
      codeToReview += `File: ${file.filename}\nPatch:\n${file.patch}\n\n`;
    }
  });

  return codeToReview;
}

// Generate review using Gemini API
async function generateReview(prTitle, codeToReview) {

  const reviewPrompt = `
    You are an expert code reviewer.

    Review the following GitHub Pull Request diff and provide **brief**, **actionable** feedback.

    PR Title: ${prTitle}

    ${codeToReview}

    Focus on:
    1. Code quality and readability
    2. Potential bugs or edge cases
    3. Performance improvements
    4. Security issues (if any)

    Guidelines:
    - Be concise 
    - You will use bullet points for every file
    - Use clear, simple sentences
    - Do NOT use markdown formatting
    - Reply with the plain text comment only (no headers, no intro, no closing remarks)
  `;

  // Send to Gemini API for review
  console.log(" Sending code to Gemini API for review...");
  const geminiResponse = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    {
      contents: [
        {
          parts: [
            {
              text: reviewPrompt,
            },
          ],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        key: process.env.GEMINI_API_KEY,
      },
    }
  );

  // Validate Gemini API response
  if (!geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error(
      " Invalid Gemini API response:",
      JSON.stringify(geminiResponse.data)
    );
    throw new Error("Invalid Gemini API response");
  }

  return geminiResponse.data.candidates[0].content.parts[0].text;
}

// Format the final PR comment with AI review
function formatReviewComment(aiReview) {
  return ` 🤖 Automated Code Review
---

${aiReview}

---
> ⚠️ **Note:** *This is an automated review. Please consider the suggestions and use your judgment.*`;
}

module.exports = {
  filterRelevantFiles,
  prepareCodeForReview,
  generateReview,
  formatReviewComment,
};
