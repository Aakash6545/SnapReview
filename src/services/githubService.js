const axios = require("axios");
const { generateAppJWT } = require("../utils/auth");

// Get Installation Access Token
async function getInstallationAccessToken(installationId) {
  try {
    const jwtToken = generateAppJWT();
    console.log(" Generated JWT successfully");

    const res = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return res.data.token;
  } catch (err) {
    console.error(
      " Error getting installation token:",
      err.response?.data || err.message
    );
    throw new Error("Failed to get installation token");
  }
}

// Fetch PR Files with Pagination
async function fetchPRFiles(repoOwner, repoName, prNumber, installationToken) {
  let page = 1;
  let allFiles = [];
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const filesRes = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}/files`,
        {
          headers: {
            Authorization: `token ${installationToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          params: {
            page: page,
            per_page: 100,
          },
        }
      );

      allFiles = [...allFiles, ...filesRes.data];

      // Check if we have more pages
      const linkHeader = filesRes.headers.link;
      hasMorePages = linkHeader && linkHeader.includes('rel="next"');
      page++;

      // Respect rate limiting
      if (hasMorePages) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between paginated requests
      }
    } catch (err) {
      console.error(
        " Error fetching PR files:",
        err.response?.data || err.message
      );
      throw new Error("Failed to fetch PR files");
    }
  }

  return allFiles;
}

// Post comment to PR
async function postPRComment(
  repoOwner,
  repoName,
  prNumber,
  body,
  installationToken
) {
  try {
    const commentResponse = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${prNumber}/comments`,
      { body },
      {
        headers: {
          Authorization: `token ${installationToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return commentResponse.data;
  } catch (err) {
    console.error(
      " Error posting PR comment:",
      err.response?.data || err.message
    );
    throw new Error("Failed to post PR comment");
  }
}

module.exports = {
  getInstallationAccessToken,
  fetchPRFiles,
  postPRComment,
};