const app = require("./app");

// Server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Verify environment variables are set
  const requiredEnvVars = [
    "GITHUB_APP_ID",
    "GITHUB_PRIVATE_KEY",
    "GITHUB_WEBHOOK_SECRET",
    "GEMINI_API_KEY",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      "⚠️ Missing required environment variables:",
      missingVars.join(", ")
    );
    console.warn(
      "⚠️ The application may not function correctly without these variables"
    );
  } else {
    console.log(" All required environment variables are set");
  }
});