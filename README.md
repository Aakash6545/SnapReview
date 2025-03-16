# 🤖 SnapReview - Automated PR Reviews

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)

SnapReview is a GitHub App that automatically reviews your Pull Requests using Gemini AI. Get instant code quality feedback without waiting for human reviewers!

## ✨ Features

- 🚀 **Instant Feedback**: Automated code review comments as soon as a PR is opened or updated
- 🔍 **Code Quality Analysis**: Identifies potential bugs, readability issues, and performance improvements
- 🛡️ **Security Scanning**: Highlights possible security vulnerabilities in your code
- 💻 **Multi-language Support**: Works with JavaScript, TypeScript, Python, Java, Ruby, PHP, Go, C/C++, C#, Swift and more

## 📋 How It Works

1. Install the SnapReview GitHub App on your repository
2. Open a new Pull Request or update an existing one
3. SnapReview analyzes the code changes and posts a review comment within seconds
4. Use the feedback to improve your code before merging

![Demo Flow](https://via.placeholder.com/800x400?text=SnapReview+Demo)

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A GitHub account
- [ngrok](https://ngrok.com/) for exposing your local server

### Step 1: Clone the repository

```bash
git clone https://github.com/Aakash6545/SnapReview.git
cd snapreview
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY=your_github_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

### Step 4: Create your GitHub App

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "GitHub Apps" > "New GitHub App"
3. Fill in the following details:
   - **Name**: SnapReview (or your preferred name)
   - **Homepage URL**: http://localhost:3000 (for development)
   - **Webhook URL**: Your ngrok URL (from step 5) + `/github-webhook`
   - **Webhook Secret**: Create a random string (use this as your `GITHUB_WEBHOOK_SECRET`)
   
4. Set the following permissions:
   - **Repository permissions**:
     - **Pull requests**: Read & Write
     - **Contents**: Read-only
   - **Subscribe to events**:
     - Pull request
     - Installation

5. Create the app and note down:
   - Your GitHub App ID
   - Generate a private key and download it


### Step 5: Start ngrok

```bash
ngrok http 3000
```

Note the https URL provided by ngrok (e.g., `https://abc123.ngrok.io`). Update your GitHub App's webhook URL to this URL + `/github-webhook`.

### Step 6: Start the server

```bash
npm run dev
```

### Step 7: Install the GitHub App

1. Go to your GitHub App's settings
2. Click "Install App" and select the repositories you want to use with SnapReview


## 🔧 Configuration Options

Review the `src/services/reviewService.js` file to customize:

- The types of files to analyze (`filterRelevantFiles` function)
- The maximum number of files to review per PR
- The review prompt sent to the Gemini API

## 📖 API Reference

### GitHub Webhook Endpoint

`POST /github-webhook`

Receives webhook events from GitHub and processes them accordingly.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Gemini API](https://ai.google.dev/) for providing AI capabilities
- [GitHub API](https://docs.github.com/en/rest) for repository integration

---

Made with ❤️ by Aakash