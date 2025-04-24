import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Resend} from "resend";
import {defineString} from "firebase-functions/params";

// Initialize Firebase Admin SDK (only once)
// Ensure you have service account credentials configured
// See: https://firebase.google.com/docs/admin/setup
admin.initializeApp();

// --- Define Configuration Parameters (v2 style) ---
// NOTE: These now expect environment variables in UPPERCASE_SNAKE_CASE
// Set these in the Google Cloud Console for the function or during deployment.
// const resendApiKey = defineString("re_h4S7TWqJ_63xzUJ1UsPLjGDLkKwg1CaR2");
const resendApiKey = defineString("RESEND_API_KEY");
const appBaseUrl = defineString("APP_BASE_URL", {default: "http://localhost:3000"});
const dynamicLinkDomain = defineString("DYNAMIC_LINK_DOMAIN");
const emailFromAddress = defineString("EMAIL_FROM_ADDRESS", {default: "noreply@example.com"});

// Define the expected data structure within the CallableRequest
interface RequestData {
  email: string;
}

/**
 * Generates a Firebase sign-in link and sends it via a custom email template using Resend.
 *
 * @param request - CallableRequest containing the user's { email: string }.
 * @param _context - CallableContext containing auth information (optional).
 * @returns Promise<void>
 */
export const sendLoginEmail = functions.https.onCall(
  async (request: functions.https.CallableRequest<RequestData>, _context) => {
    const currentResendApiKey = resendApiKey.value();
    const currentAppBaseUrl = appBaseUrl.value();
    const currentDynamicLinkDomain = dynamicLinkDomain.value();
    const currentEmailFromAddress = emailFromAddress.value();

    if (!currentResendApiKey) {
      console.error("FATAL ERROR: Resend API key parameter is not set.");
      throw new functions.https.HttpsError(
        "internal",
        "Email service configuration error. Please contact support.",
      );
    }

    const email = request.data.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'email' argument.",
      );
    }

    const auth = admin.auth();
    const resend = new Resend(currentResendApiKey);

    const actionCodeSettings: admin.auth.ActionCodeSettings = {
      url: `${currentAppBaseUrl}/finishSignIn`,
      handleCodeInApp: true,
      ...(currentDynamicLinkDomain && {dynamicLinkDomain: currentDynamicLinkDomain}),
    };

    try {
      console.log(
        `Generating sign-in link for ${email} with URL: ${actionCodeSettings.url}`,
      );
      const link = await auth.generateSignInWithEmailLink(
        email,
        actionCodeSettings,
      );
      console.log(`Sign-in link generated successfully for ${email}`);

      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sign In to YourApp</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 25px; margin: 20px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 3px; font-weight: bold; }
          a { color: #007bff; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome Back!</h2>
          <p>Click the button below to securely sign in to your YourApp account:</p>
          <a href="${link}" class="button">Sign In Securely</a>
          <p>If you didn't request this email, you can safely ignore it.</p>
          <p>This link will expire in 1 hour.</p>
          <hr>
          <p><small>If the button doesn't work, copy and paste this URL into your browser:<br>${link}</small></p>
        </div>
      </body>
      </html>
    `;

      console.log(`Attempting to send email via Resend to ${email}`);
      await resend.emails.send({
        from: currentEmailFromAddress,
        to: email,
        subject: "Your Sign-In Link for YourApp",
        html: emailHtml,
      });

      console.log(`Custom sign-in email sent successfully to ${email}`);
      return {success: true};
    } catch (error: unknown) {
      console.error(`Error sending sign-in email to ${email}:`, error);

      let errorMessage = "An unexpected error occurred.";
      let errorCode: functions.https.FunctionsErrorCode = "internal";
      let specificMessage = "An unexpected error occurred while sending the sign-in email.";

      if (error instanceof functions.https.HttpsError) {
        errorCode = error.code;
        specificMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
        specificMessage = error.message;
        if ("code" in error && error.code === "auth/invalid-email") {
          errorCode = "invalid-argument";
          specificMessage = "Invalid email address provided.";
        } else if ("name" in error && error.name === "ResendError") {
          errorCode = "internal";
          specificMessage = "Could not send the sign-in email due to a provider issue.";
        }
      }

      throw new functions.https.HttpsError(
        errorCode,
        specificMessage,
        errorMessage,
      );
    }
  },
);
