import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/data-deletion", (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Deletion Request - The Success Virus Game</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #e74c3c;
      border-bottom: 3px solid #e74c3c;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
    }
    .info-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .contact-box {
      background: #d1ecf1;
      border-left: 4px solid #17a2b8;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .steps {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .steps ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    .steps li {
      margin-bottom: 10px;
    }
    ul {
      padding-left: 25px;
    }
    li {
      margin-bottom: 10px;
    }
    a {
      color: #3498db;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗑️ Data Deletion Request</h1>
    <p><strong>The Success Virus Game</strong></p>

    <div class="info-box">
      <strong>⚠️ Important Information:</strong><br>
      Most of your data is stored locally on your device. You can delete this data immediately by uninstalling the app from your device.
    </div>

    <h2>What Data Do We Store?</h2>
    
    <h3>Local Data (Stored on Your Device)</h3>
    <p>The following data is stored locally on your device and is NOT sent to our servers:</p>
    <ul>
      <li>Game progress and manifestations</li>
      <li>Journal entries</li>
      <li>User preferences and settings</li>
      <li>Inventory and achievements</li>
      <li>Profile information</li>
      <li>Other game-related data</li>
    </ul>
    <p><strong>To delete this data:</strong> Simply uninstall The Success Virus Game app from your device. All locally stored data will be permanently deleted.</p>

    <h3>Server Data</h3>
    <p>We may store minimal data on our servers, including:</p>
    <ul>
      <li>Purchase history (processed through RevenueCat)</li>
      <li>Basic analytics and crash reports</li>
    </ul>

    <h2>How to Request Data Deletion</h2>
    
    <div class="steps">
      <h3>Option 1: Delete Data from Your Device (Immediate)</h3>
      <ol>
        <li>Go to your device's Settings</li>
        <li>Navigate to Apps or Applications</li>
        <li>Find "The Success Virus Game"</li>
        <li>Tap "Uninstall" or "Delete App"</li>
      </ol>
      <p>This will immediately remove all locally stored data.</p>
    </div>

    <div class="steps">
      <h3>Option 2: Request Server Data Deletion</h3>
      <p>To request deletion of any data stored on our servers, please contact us:</p>
    </div>

    <div class="contact-box">
      <h3>📧 Contact Information</h3>
      <p>Send your deletion request to:</p>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Email:</strong> <a href="mailto:privacy@rork.com">privacy@rork.com</a></li>
        <li><strong>Subject:</strong> Data Deletion Request - The Success Virus Game</li>
      </ul>
      
      <p style="margin-top: 20px;"><strong>Please include in your request:</strong></p>
      <ul>
        <li>Your email address (if you created an account)</li>
        <li>Your username or user ID (if applicable)</li>
        <li>Any other identifying information</li>
        <li>Confirmation that you want to delete all your data</li>
      </ul>
    </div>

    <h2>What Happens After Your Request?</h2>
    <ul>
      <li><strong>Response Time:</strong> We will respond to your request within 30 days</li>
      <li><strong>Verification:</strong> We may need to verify your identity before processing the deletion</li>
      <li><strong>Completion:</strong> Once verified, we will delete all your personal data from our servers</li>
      <li><strong>Confirmation:</strong> You will receive an email confirmation once the deletion is complete</li>
    </ul>

    <h2>Data That Cannot Be Deleted</h2>
    <p>Please note that some data may be retained for legal or legitimate business purposes, including:</p>
    <ul>
      <li>Transaction records required for tax or accounting purposes</li>
      <li>Data necessary to comply with legal obligations</li>
      <li>Aggregated or anonymized data that cannot be linked back to you</li>
    </ul>

    <h2>Third-Party Services</h2>
    <p>If you've made purchases through our app, some data may be stored by third-party services:</p>
    <ul>
      <li><strong>RevenueCat:</strong> For purchase history and subscription management. Visit <a href="https://www.revenuecat.com/privacy" target="_blank">RevenueCat's Privacy Policy</a> for more information.</li>
      <li><strong>Google Play:</strong> For app purchases and subscriptions. Manage your data through your Google account settings.</li>
    </ul>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
      <p style="color: #7f8c8d; font-size: 14px;">
        <strong>Related Links:</strong><br>
        <a href="/privacy-policy">Privacy Policy</a>
      </p>
      <p style="color: #7f8c8d; font-size: 14px; margin-top: 20px;">
        Last Updated: January 2, 2025
      </p>
    </div>
  </div>
</body>
</html>
  `);
});

app.get("/privacy-policy", (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - The Success Virus Game</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
    }
    h3 {
      color: #555;
      margin-top: 20px;
    }
    .last-updated {
      color: #7f8c8d;
      font-style: italic;
      margin-bottom: 20px;
    }
    ul {
      padding-left: 25px;
    }
    li {
      margin-bottom: 10px;
    }
    .contact {
      background: #ecf0f1;
      padding: 20px;
      border-radius: 5px;
      margin-top: 30px;
    }
    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="last-updated"><strong>Last Updated:</strong> January 2, 2025</p>

    <h2>Introduction</h2>
    <p>The Success Virus Game ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "App"). Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the App.</p>

    <h2>Information We Collect</h2>

    <h3>Information You Provide to Us</h3>
    <ul>
      <li><strong>Account Information:</strong> When you create an account or use our App, you may provide us with information such as your username, email address, and profile information.</li>
      <li><strong>User-Generated Content:</strong> Any content you create, share, or post within the App, including manifestations, journal entries, and community interactions.</li>
      <li><strong>Purchase Information:</strong> If you make in-app purchases, we collect transaction information through our payment processor (RevenueCat).</li>
    </ul>

    <h3>Automatically Collected Information</h3>
    <ul>
      <li><strong>Device Information:</strong> We may collect information about your device, including device type, operating system, unique device identifiers, and mobile network information.</li>
      <li><strong>Usage Data:</strong> We collect information about how you interact with our App, including features used, time spent, and actions taken.</li>
      <li><strong>Log Data:</strong> Our servers automatically record information when you use the App, including IP address, access times, and app crashes.</li>
    </ul>

    <h3>Information from Third-Party Services</h3>
    <ul>
      <li><strong>RevenueCat:</strong> We use RevenueCat to process in-app purchases. RevenueCat may collect payment information and purchase history. Please review RevenueCat's privacy policy for more information.</li>
      <li><strong>Google Play Games Services:</strong> If you choose to use Google Play Games Services, Google may collect information according to their privacy policy.</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
      <li>Provide, maintain, and improve our App and services</li>
      <li>Process transactions and send related information</li>
      <li>Send you technical notices, updates, and support messages</li>
      <li>Respond to your comments, questions, and requests</li>
      <li>Monitor and analyze trends, usage, and activities</li>
      <li>Personalize and improve your experience</li>
      <li>Send you promotional communications (with your consent)</li>
      <li>Detect, prevent, and address technical issues and fraudulent activity</li>
    </ul>

    <h2>Data Storage and Security</h2>

    <h3>Local Storage</h3>
    <p>We use local storage (AsyncStorage) on your device to store:</p>
    <ul>
      <li>Your game progress and manifestations</li>
      <li>User preferences and settings</li>
      <li>Inventory and achievements</li>
      <li>Other game-related data</li>
    </ul>
    <p>This data is stored locally on your device and is not transmitted to our servers unless you explicitly choose to sync your data.</p>

    <h3>Data Security</h3>
    <p>We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

    <h2>Information Sharing and Disclosure</h2>
    <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
    <ul>
      <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing (RevenueCat) and analytics.</li>
      <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
      <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your information may be transferred.</li>
      <li><strong>With Your Consent:</strong> We may share your information with your consent or at your direction.</li>
    </ul>

    <h2>Children's Privacy</h2>
    <p>Our App is designed for users of all ages, including children under 13. We are committed to protecting children's privacy:</p>
    <ul>
      <li>We do not knowingly collect personal information from children under 13 without parental consent.</li>
      <li>We do not require children to provide more personal information than is reasonably necessary to use our App.</li>
      <li>Parents or guardians can review, request deletion of, or refuse further collection of their child's information by contacting us.</li>
      <li>We comply with the Children's Online Privacy Protection Act (COPPA) and other applicable laws.</li>
    </ul>
    <p>If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>

    <h2>Your Rights and Choices</h2>
    <p>You have the right to:</p>
    <ul>
      <li><strong>Access:</strong> Request access to your personal information</li>
      <li><strong>Correction:</strong> Request correction of inaccurate information</li>
      <li><strong>Deletion:</strong> Request deletion of your personal information</li>
      <li><strong>Opt-Out:</strong> Opt-out of certain data collection and use</li>
      <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
    </ul>
    <p>To exercise these rights, please contact us using the information provided below.</p>

    <h2>Data Retention</h2>
    <p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>

    <h2>International Data Transfers</h2>
    <p>Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.</p>

    <h2>Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>

    <h2>Third-Party Links</h2>
    <p>Our App may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.</p>

    <h2>California Privacy Rights</h2>
    <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:</p>
    <ul>
      <li>The right to know what personal information we collect</li>
      <li>The right to delete personal information</li>
      <li>The right to opt-out of the sale of personal information (we do not sell personal information)</li>
      <li>The right to non-discrimination for exercising your privacy rights</li>
    </ul>

    <div class="contact">
      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at:</p>
      <ul>
        <li><strong>Email:</strong> privacy@rork.com</li>
        <li><strong>Website:</strong> <a href="https://rork.com">https://rork.com</a></li>
        <li><strong>App Name:</strong> The Success Virus Game</li>
        <li><strong>Developer:</strong> Rork</li>
      </ul>
    </div>

    <h2>Consent</h2>
    <p>By using our App, you consent to our Privacy Policy and agree to its terms.</p>

    <p style="margin-top: 30px; color: #7f8c8d; font-size: 14px;">This Privacy Policy is effective as of January 2, 2025, and will remain in effect except with respect to any changes in its provisions in the future, which will take effect immediately upon being posted.</p>
  </div>
</body>
</html>
  `);
});

export default app;
