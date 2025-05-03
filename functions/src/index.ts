import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Resend} from "resend";
import {defineString} from "firebase-functions/params";
import * as crypto from "crypto";

// Initialize Firebase Admin SDK (only once)
// Ensure you have service account credentials configured
// See: https://firebase.google.com/docs/admin/setup
admin.initializeApp();

// --- Define Configuration Parameters (v2 style) ---
// NOTE: These now expect environment variables in UPPERCASE_SNAKE_CASE
// Set these in the Google Cloud Console for the function or during deployment.
const resendApiKey = defineString("RESEND_API_KEY");
// Remove APP_BASE_URL, as origin will be passed from client
// const appBaseUrl = defineString("APP_BASE_URL", { default: "http://localhost:3000" });
const dynamicLinkDomain = defineString("DYNAMIC_LINK_DOMAIN");
const emailFromAddress = defineString("EMAIL_FROM_ADDRESS", {default: "noreply@bodai.no"});
// Add ALLOWED_ORIGINS parameter - set this env var to a comma-separated list
const allowedOrigins = defineString("ALLOWED_ORIGINS", {
  default: "http://localhost:3000,https://bodai.no,https://www.bodai.no,https://musco-one.vercel.app,https://musco-cakqufmza-zone2lab.vercel.app"});

// Define the expected data structure within the CallableRequest
interface RequestData {
  email: string;
  origin: string;
  language?: string; // Add optional language property
}

/**
 * Generates a Firebase sign-in link and sends it via a custom email template using Resend.
 *
 * @param request - CallableRequest containing the user's { email: string, origin: string, language?: string }.
 * @param _context - CallableContext containing auth information (optional).
 * @returns Promise<void>
 */
export const sendLoginEmail = functions.https.onCall(
  async (request: functions.https.CallableRequest<RequestData>, _context) => {
    const currentResendApiKey = resendApiKey.value();
    // Remove appBaseUrl usage here
    // const currentAppBaseUrl = appBaseUrl.value();
    const currentDynamicLinkDomain = dynamicLinkDomain.value();
    const currentEmailFromAddress = emailFromAddress.value();
    const currentAllowedOrigins = allowedOrigins.value().split(","); // Split into array

    if (!currentResendApiKey) {
      console.error("FATAL ERROR: Resend API key parameter is not set.");
      throw new functions.https.HttpsError(
        "internal",
        "Email service configuration error. Please contact support.",
      );
    }

    const email = request.data.email;
    const origin = request.data.origin;
    const language = request.data.language || "en"; // Get language, default to 'en'

    // --- Validate Origin ---
    if (!origin || !currentAllowedOrigins.map((o) => o.trim()).includes(origin)) {
      console.error(`Disallowed origin attempted: ${origin}. Allowed: ${currentAllowedOrigins.join(", ")}`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid request origin.",
      );
    }

    // Basic email validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'email' argument.",
      );
    }

    const auth = admin.auth();
    const resend = new Resend(currentResendApiKey);

    const actionCodeSettings: admin.auth.ActionCodeSettings = {
      url: `${origin}/`, // Use validated origin root from client
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

      // Generate a 6-digit code for PWA users
      const code = crypto.randomInt(100000, 999999).toString();
      
      // Store the code in Firestore with expiration (1 hour)
      const expirationTime = Date.now() + 3600000; // 1 hour from now
      await admin.firestore().collection('authCodes').doc(email).set({
        code,
        link,
        expirationTime,
        used: false
      });

      let emailSubject = "";
      let emailTitle = ""; // Title used in <title> tag
      let tagline = "";
      let heading = "";
      // let valueProp = "";
      let buttonText = "";
      let expireText = "";
      let troubleText = "";
      let footerText = "";
      let preheaderText = "";
      let codeLabel = "";

      if (language === "nb") {
        emailSubject = "Logg inn på bodAI";
        emailTitle = "Logg inn på bodAI";
        tagline = "Intelligent trening, uten friksjonen";
        heading = "Magisk lenke-innlogging";
        // valueProp = "bodAI blander banebrytende KI med en interaktiv muskelskjelettmodell for å lage personlige trenings- og rehabiliteringsprogrammer. Klikk nedenfor for å hoppe tilbake – passordfritt.";
        buttonText = "Åpne bodAI";
        expireText = "Lenken utløper om 1 time.";
        troubleText = "Hvis knappen ikke virker, kopier og lim inn denne URL-en:";
        footerText = "Du mottar denne e-posten fordi en bodAI-innlogging ble forespurt.<br />Ba du ikke om den? Slett denne meldingen og fortsett med dagen din.";
        preheaderText = "trykk for å logge inn – lenken utløper om 1 t.";
        codeLabel = "PWA-brukere: Skriv inn denne koden i appen";
      } else { // Default to English
        emailSubject = "Sign In To bodAI";
        emailTitle = "Sign In To bodAI";
        tagline = "Intelligent Training, Minus The Friction";
        heading = "Magic Link Sign‑In";
        // valueProp = "bodAI blends cutting‑edge AI with an interactive musculoskeletal model to craft truly personal training & rehab programs. click below to jump back in—password‑free.";
        buttonText = "Open bodAI";
        expireText = "Link expires in 1 hour.";
        troubleText = "If the button doesn't work, copy and paste this URL:";
        footerText = "You're receiving this email because a bodAI sign‑in was requested.<br />Didn't request it? Delete this message and carry on.";
        preheaderText = "tap to sign in instantly – link expires in 1h.";
        codeLabel = "PWA users: Enter this code in the app";
      }

      // Inject variables into the existing HTML structure
      const emailHtml = `
<!DOCTYPE html>
<html lang="${language}" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${emailTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <!-- no fixed widths: scales clean on mobile -->
  </head>
  <body bgcolor="#0d0e14" style="margin:0;padding:0;background-color:#0d0e14 !important;color:#e4e7ec;font-family:'Inter',Helvetica,Arial,sans-serif;line-height:1.7;mso-line-height-rule:exactly;">
    <!-- inbox preview text (hidden) -->
    <span style="display:none;font-size:0;max-height:0;opacity:0;overflow:hidden;">${preheaderText}&nbsp;&nbsp;&nbsp;</span>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#0d0e14" style="background-color:#0d0e14;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:16px;">
          <!-- responsive card -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#16171e" style="max-width:520px;width:100%;background-color:#16171e;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.6);border-collapse:collapse;">
            <tr>
              <td style="padding:32px 24px;text-align:center;">
                <!-- logo -->
                <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#fff;">
                  bod<span style="color:#4f46e5;">AI</span>
                </h1>
                <!-- tagline -->
                <p style="margin:0 0 28px;font-size:14px;color:#9a9fad;text-transform:uppercase;letter-spacing:.5px;">
                  ${tagline}
                </p>
                <!-- heading -->
                <h2 style="margin:0 0 28px;font-size:22px;font-weight:600;color:#fff;">
                  ${heading}
                </h2>

                <!-- call-to-action -->
                <a href="${link}" target="_blank" rel="noopener noreferrer" style="display:block;width:100%;max-width:280px;margin:0 auto 24px;padding:16px 24px;font-size:16px;font-weight:600;text-decoration:none;text-align:center;color:#fff;background-color:#4f46e5;border-radius:10px;">
                  ${buttonText}
                </a>

                <!-- Auth code for PWA users -->
                <div style="margin:24px 0;padding:16px;background-color:#1e1f2a;border-radius:10px;border:1px solid #2e2f3a;">
                  <p style="margin:0 0 8px;font-size:14px;color:#9a9fad;">
                    ${codeLabel}
                  </p>
                  <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:3px;color:#fff;">
                    ${code}
                  </p>
                </div>

                <!-- link expiry + fallback -->
                <p style="margin:0 0 24px;font-size:13px;color:#cbd5e1;word-break:break-all;">
                  ${expireText}<br />
                  ${troubleText}<br />
                  <a href="${link}" style="color:#4f46e5;text-decoration:none;">${link}</a>
                </p>

                <!-- footer -->
                <p style="margin:0;font-size:11px;color:#8a8d9c;">
                  ${footerText}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

      console.log(`Attempting to send email via Resend to ${email} in language: ${language}`);
      await resend.emails.send({
        from: currentEmailFromAddress,
        to: email,
        subject: emailSubject, // Use dynamic subject
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

/**
 * Validates a numeric authentication code and returns the corresponding sign-in link.
 * 
 * @param request - CallableRequest containing { email: string, code: string }
 * @param _context - CallableContext containing auth information (optional)
 * @returns Promise with the sign-in link if successful
 */
export const validateAuthCode = functions.https.onCall(
  async (request: functions.https.CallableRequest<{ email: string; code: string }>, _context) => {
    const { email, code } = request.data;

    // Validate inputs
    if (!email || !code) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Both email and code must be provided",
      );
    }

    try {
      // Get the stored code information
      const codeDoc = await admin.firestore().collection('authCodes').doc(email).get();
      
      if (!codeDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "No authentication code found for this email",
        );
      }

      const codeData = codeDoc.data();
      
      // Check if code is already used
      if (codeData?.used) {
        throw new functions.https.HttpsError(
          "already-exists",
          "This code has already been used",
        );
      }
      
      // Check if code is expired
      if (codeData?.expirationTime < Date.now()) {
        throw new functions.https.HttpsError(
          "deadline-exceeded",
          "This code has expired",
        );
      }
      
      // Verify the code
      if (codeData?.code !== code) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid authentication code",
        );
      }
      
      // Mark the code as used
      await admin.firestore().collection('authCodes').doc(email).update({
        used: true
      });
      
      // Return the sign-in link
      return { link: codeData.link };
    } catch (error) {
      console.error("Error validating auth code:", error);
      
      // Re-throw HttpsError if it's already that type
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      // Otherwise wrap in a generic error
      throw new functions.https.HttpsError(
        "internal",
        "Failed to validate authentication code",
      );
    }
  }
);
