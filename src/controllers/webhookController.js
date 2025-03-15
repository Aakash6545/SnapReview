const { verifySignature } = require("../utils/auth");
const { installations } = require("../utils/storage");
const {
  getInstallationAccessToken,
  fetchPRFiles,
  postPRComment,
} = require("../services/githubService");
const {
  filterRelevantFiles,
  prepareCodeForReview,
  generateReview,
  formatReviewComment,
} = require("../services/reviewService");

// Handle GitHub webhook events
async function handleWebhook(req, res) {
  console.log("Received webhook. Verifying signature...");

  // Get the raw body and signature
  const signature = req.headers["x-hub-signature-256"];
  const rawBody = req.body;


  if (!verifySignature(signature, rawBody)) {
    console.log("Invalid signature");
    return res.status(401).send("Unauthorized");
  }

  console.log(" Signature verification successful");

  // Parse the JSON body
  let payload;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch (err) {
    console.error("Error parsing webhook payload:", err.message);
    return res.status(400).send("Invalid JSON payload");
  }

  const event = req.headers["x-github-event"];
  console.log(`Received GitHub event: ${event}`);
  console.log(`payload action: ${payload.action}`);

  // Handle Installation Event
  if (event === "installation") {
    return handleInstallationEvent(payload, res);
  }

  // Handle Pull Request Event
  if (
    event === "pull_request" &&
    (payload.action === "opened" || payload.action === "synchronize")
  ) {
    // Acknowledge receipt quickly to avoid webhook timeout
    res.status(202).send("Processing PR review");

    handlePullRequestEvent(payload);
    return;
  }

  // For other events, just acknowledge receipt
  res.send("Event received");
}

// Handle GitHub App installation events
function handleInstallationEvent(payload, res) {
  const installationId = payload.installation.id;
  const accountLogin = payload.installation.account.login;

  // Store installation in memory
  installations[installationId] = accountLogin;
  console.log(
    `App installed by ${accountLogin}, installation_id: ${installationId}`
  );
  return res.send("Installation stored");
}

// Handle Pull Request events
async function handlePullRequestEvent(payload) {
  const installationId = payload.installation.id;
  const repoOwner = payload.repository.owner.login;
  const repoName = payload.repository.name;
  const prNumber = payload.pull_request.number;
  const prTitle = payload.pull_request.title;

  try {
    console.log(`Processing PR #${prNumber} from ${repoOwner}/${repoName}`);

    // Get installation token
    const installationToken = await getInstallationAccessToken(installationId);
    console.log("Got installation token successfully");

    // Get PR files with pagination
    const filesChanged = await fetchPRFiles(
      repoOwner,
      repoName,
      prNumber,
      installationToken
    );
    console.log(`Fetched ${filesChanged.length} files from PR`);

    // Filter relevant files
    const relevantFiles = filterRelevantFiles(filesChanged);
    console.log(
      `Found ${relevantFiles.length} relevant code files to review`
    );

    // Prepare code for review
    const codeToReview = prepareCodeForReview(relevantFiles);

    // If no relevant code files found
    if (codeToReview === "") {
      console.log("No relevant code files found for review");

      // Post a notification comment on the PR
      await postPRComment(
        repoOwner,
        repoName,
        prNumber,
        "🤖 No relevant code files found for automatic review.",
        installationToken
      );

      return;
    }

    // Generate AI review
    const aiReview = await generateReview(prTitle, codeToReview);
    console.log("AI Review Generated successfully");

    // Format the review comment
    const reviewComment = formatReviewComment(aiReview);

    // Post AI review as a comment on the PR
    console.log("Posting AI review comment to PR...");
    const commentResponse = await postPRComment(
      repoOwner,
      repoName,
      prNumber,
      reviewComment,
      installationToken
    );

    console.log(
      `AI review posted on PR #${prNumber} (comment id: ${commentResponse.id})`
    );
  } catch (err) {
    console.error(
      "Error handling PR event:",
      err.response?.data || err.message
    );

    try {
      // Attempt to post error comment if we have an installation token
      if (installationId) {
        const installationToken = await getInstallationAccessToken(
          installationId
        );

        await postPRComment(
          repoOwner,
          repoName,
          prNumber,
          "🤖 I encountered an error while processing this PR.",
          installationToken
        );
      }
    } catch (commentErr) {
      console.error("Failed to post error comment:", commentErr.message);
    }
  }
}

module.exports = {
  handleWebhook,
};
