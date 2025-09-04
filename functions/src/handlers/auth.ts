import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {Resend} from 'resend';
import {defineString} from 'firebase-functions/params';
import * as crypto from 'crypto';

// --- Define Configuration Parameters (v2 style) ---
const resendApiKey = defineString('RESEND_API_KEY');
const dynamicLinkDomain = defineString('DYNAMIC_LINK_DOMAIN');
const emailFromAddress = defineString('EMAIL_FROM_ADDRESS', {
  default: 'noreply@bodai.no',
});
const allowedOrigins = defineString('ALLOWED_ORIGINS', {
  default:
    'http://localhost:3000,https://bodai.no,https://www.bodai.no,https://musco-one.vercel.app,https://musco-cakqufmza-zone2lab.vercel.app',
});

// Define the expected data structure within the CallableRequest
interface RequestData {
  email: string;
  origin: string;
  language?: string; // Add optional language property
  isPwa?: boolean; // Add flag to indicate if user is on PWA
  program?: unknown; // Add optional program data for saving
  redirectUrl?: string; // Add optional custom redirect URL for special flows like account deletion
  isAdmin?: boolean; // Admin console login copy/redirect
}

/**
 * Generates a Firebase sign-in link and sends it via a custom email template using Resend.
 *
 * @param request - CallableRequest containing the user's { email: string, origin: string, language?: string, isPwa?: boolean }.
 * @param _context - CallableContext containing auth information (optional).
 * @returns Promise<void>
 */
export const sendLoginEmail = functions.https.onCall(
  async (request: functions.https.CallableRequest<RequestData>, _context) => {
    const currentResendApiKey = resendApiKey.value();
    const currentDynamicLinkDomain = dynamicLinkDomain.value();
    const currentEmailFromAddress = emailFromAddress.value();
    const currentAllowedOrigins = allowedOrigins.value().split(','); // Split into array

    if (!currentResendApiKey) {
      console.error('FATAL ERROR: Resend API key parameter is not set.');
      throw new functions.https.HttpsError(
        'internal',
        'Email service configuration error. Please contact support.',
      );
    }

    const email = request.data.email;
    const origin = request.data.origin;
    const language = request.data.language || 'en'; // Get language, default to 'en'
    const isPwa = request.data.isPwa || false; // Check if user is on PWA
    const program = request.data.program; // Get program data if provided
    const isAdmin = Boolean(request.data.isAdmin);
    const redirectUrl = request.data.redirectUrl || (isAdmin ? `${origin}/admin/gyms` : undefined); // Admin default

    // --- Validate Origin ---
    if (
      !origin ||
      !currentAllowedOrigins.map((o) => o.trim()).includes(origin)
    ) {
      console.error(
        `Disallowed origin attempted: ${origin}. Allowed: ${currentAllowedOrigins.join(', ')}`,
      );
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid request origin.',
      );
    }

    // Basic email validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with a valid \'email\' argument.',
      );
    }

    const auth = admin.auth();
    const resend = new Resend(currentResendApiKey);

    // If admin flow and email already exists but user is not admin -> reject early
    if (isAdmin) {
      try {
        const existing = await auth.getUserByEmail(email);
        if (existing?.uid) {
          const userDoc = await admin.firestore().collection('users').doc(existing.uid).get();
          const data = userDoc.exists ? (userDoc.data() as Record<string, unknown>) : null;
          const roles = Array.isArray((data as { roles?: unknown })?.roles) ? (((data as { roles?: string[] }).roles) as string[]) : [];
          const isGymAdmin = Boolean((data as { isGymAdmin?: unknown })?.isGymAdmin) || roles.includes('gym_admin');
          if (!isGymAdmin) {
            throw new functions.https.HttpsError(
              'permission-denied',
              'This email belongs to a non-admin user. Contact support to enable admin access.',
            );
          }
        }
      } catch (e) {
        // If user not found, allow code issuance (new admin onboarding)
        const err = e as { code?: string } | functions.https.HttpsError;
        if ((err as { code?: string }).code !== 'auth/user-not-found' && !(err instanceof functions.https.HttpsError)) {
          throw e;
        }
        if (err instanceof functions.https.HttpsError) throw err;
      }
    }

    const actionCodeSettings: admin.auth.ActionCodeSettings = {
      url: redirectUrl || `${origin}/`, // Use custom redirectUrl if provided, otherwise default to origin root
      handleCodeInApp: true,
      ...(currentDynamicLinkDomain && {
        dynamicLinkDomain: currentDynamicLinkDomain,
      }),
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

      // Store the code in Firestore with expiration (1 hour for login, 30 minutes for account deletion)
      const expirationTime = Date.now() + (redirectUrl && redirectUrl.includes('deleteAccount=true') ? 1800000 : 3600000); // 30 minutes for deletion, 1 hour for login
      const authCodeData: {
        code: string;
        link: string;
        expirationTime: number;
        used: boolean;
        program?: unknown;
      } = {
        code,
        link,
        expirationTime,
        used: false,
      };

      // Only include program data if it was provided
      if (program) {
        authCodeData.program = program;
      }

      await admin.firestore().collection('authCodes').doc(email).set(authCodeData);

      let emailSubject = '';
      let emailTitle = ''; // Title used in <title> tag
      let tagline = '';
      let heading = '';
      let expireText = '';
      let footerText = '';
      let preheaderText = '';
      let codeLabel = '';
      let codeInstructions = '';

      // Check if this is an account deletion email
      const isAccountDeletion = redirectUrl && redirectUrl.includes('deleteAccount=true');

      if (isAccountDeletion) {
        // Custom content for account deletion emails
        if (language === 'nb') {
          emailSubject = 'Bekreft sletting av BodAI-konto';
          emailTitle = 'Bekreft sletting av BodAI-konto';
          tagline = 'Kontosletting krever bekreftelse';
          heading = 'Bekreft kontosletting';
          expireText = 'Koden utløper om 30 minutter.';
          footerText = 'Du mottar denne e-posten fordi sletting av BodAI-kontoen din ble forespurt.<br />Ba du ikke om dette? Slett denne meldingen og kontoen din forblir aktiv.';
          preheaderText = 'bekreft sletting av kontoen din – utløper om 30 min.';
          codeLabel = 'Bekreftelseskode for sletting';
          codeInstructions = 'For å slette kontoen din permanent, skriv inn denne koden på personvernsiden. Denne handlingen kan ikke angres.';
        } else {
          // Default to English
          emailSubject = 'Confirm BodAI Account Deletion';
          emailTitle = 'Confirm BodAI Account Deletion';
          tagline = 'Account Deletion Requires Confirmation';
          heading = 'Confirm Account Deletion';
          expireText = 'Code expires in 30 minutes.';
          footerText = 'You\'re receiving this email because deletion of your BodAI account was requested.<br />Didn\'t request this? Delete this message and your account will remain active.';
          preheaderText = 'confirm deletion of your account – expires in 30 min.';
          codeLabel = 'Account Deletion Confirmation Code';
          codeInstructions = 'To permanently delete your account, enter this code on the privacy page. This action cannot be undone.';
        }
      } else if (isAdmin) {
        // Admin login email content
        if (language === 'nb') {
          emailSubject = 'Din BodAI Admin-kode';
          emailTitle = 'BodAI Admin-innlogging';
          tagline = 'Sikker tilgang til administrasjon';
          heading = 'Administrator-kode';
          expireText = 'Koden utløper om 1 time.';
          footerText = 'Du mottar denne e-posten fordi en BodAI admin-innlogging ble forespurt.';
          preheaderText = 'din 6-sifrede adminkode – utløper om 1 t.';
          codeLabel = 'Skriv inn denne koden på admin-siden';
          codeInstructions = 'Gå til admin-siden og skriv inn denne koden for å logge inn. Ikke del denne koden med andre.';
        } else {
          emailSubject = 'Your BodAI Admin Code';
          emailTitle = 'BodAI Admin Sign‑In';
          tagline = 'Secure access to administration';
          heading = 'Administrator Code';
          expireText = 'Code expires in 1 hour.';
          footerText = 'You’re receiving this email because a BodAI admin sign‑in was requested.';
          preheaderText = 'your 6‑digit admin code – expires in 1h.';
          codeLabel = 'Enter this code on the admin page';
          codeInstructions = 'Go to the admin page and enter this code to sign in. Do not share this code with anyone.';
        }
      } else {
        // Original login email content
        if (language === 'nb') {
          emailSubject = isPwa ? 'Din innloggingskode til BodAI' : 'Logg inn på BodAI';
          emailTitle = isPwa ? 'Din innloggingskode til BodAI' : 'Logg inn på BodAI';
          tagline = 'Intelligent trening, uten friksjonen';
          heading = isPwa ? 'Din innloggingskode' : 'Magisk lenke-innlogging';
          expireText = 'Koden utløper om 1 time.';
          footerText = 'Du mottar denne e-posten fordi en BodAI-innlogging ble forespurt.<br />Ba du ikke om den? Slett denne meldingen og fortsett med dagen din.';
          preheaderText = isPwa ? 'din 6-sifret innloggingskode – utløper om 1 t.' : 'trykk for å logge inn – lenken utløper om 1 t.';
          codeLabel = 'Skriv inn denne koden i appen';
          codeInstructions = 'Gå tilbake til appen og skriv inn denne koden for å logge inn. Ikke del denne koden med andre.';
        } else {
          // Default to English
          emailSubject = isPwa ? 'Your BodAI Login Code' : 'Sign In To BodAI';
          emailTitle = isPwa ? 'Your BodAI Login Code' : 'Sign In To BodAI';
          tagline = 'Intelligent Training, Minus The Friction';
          heading = isPwa ? 'Your Authentication Code' : 'Magic Link Sign‑In';
          expireText = isPwa ? 'Code expires in 1 hour.' : 'Link expires in 1 hour.';
          footerText = 'You\'re receiving this email because a BodAI sign‑in was requested.<br />Didn\'t request it? Delete this message and carry on.';
          preheaderText = isPwa ? 'your 6-digit login code – expires in 1h.' : 'tap to sign in instantly – link expires in 1h.';
          codeLabel = 'Enter this code in the app';
          codeInstructions = 'Return to the app and enter this code to sign in. Do not share this code with anyone.';
        }
      }

      // Unified email template – always send code instructions, no magic link button
      const emailHtml = `
<!DOCTYPE html>
<html lang="${language}" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${emailTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
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
                
                <!-- Instructions for PWA users -->
                <p style="margin:0 0 24px;font-size:16px;color:#cbd5e1;">
                  ${codeInstructions}
                </p>

                <!-- Auth code box - prominent for PWA -->
                <div style="margin:24px 0;padding:24px;background-color:#1e1f2a;border-radius:10px;border:2px solid ${isAccountDeletion ? '#dc2626' : '#4f46e5'};">
                  <p style="margin:0 0 12px;font-size:16px;color:#9a9fad;font-weight:500;">
                    ${codeLabel}
                  </p>
                  <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:${isAccountDeletion ? '#fca5a5' : '#fff'};">
                    ${code}
                  </p>
                  <p style="margin:12px 0 0;font-size:14px;color:#9a9fad;">
                    ${expireText}
                  </p>
                </div>

                ${isAccountDeletion ? `
                <!-- Warning message for account deletion -->
                <div style="margin:24px 0;padding:16px;background-color:#7f1d1d;border-radius:8px;border:1px solid #dc2626;">
                  <p style="margin:0;font-size:14px;color:#fca5a5;font-weight:600;text-align:center;">
                    ⚠️ WARNING: This action cannot be undone
                  </p>
                  <p style="margin:8px 0 0;font-size:12px;color:#fecaca;text-align:center;">
                    All your data will be permanently deleted
                  </p>
                </div>
                ` : ''}

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

      console.log(
        `Attempting to send email via Resend to ${email} in language: ${language}, isPwa: ${isPwa}`,
      );
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

      let errorMessage = 'An unexpected error occurred.';
      let errorCode: functions.https.FunctionsErrorCode = 'internal';
      let specificMessage =
        'An unexpected error occurred while sending the sign-in email.';

      if (error instanceof functions.https.HttpsError) {
        errorCode = error.code;
        specificMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
        specificMessage = error.message;
        if ('code' in error && error.code === 'auth/invalid-email') {
          errorCode = 'invalid-argument';
          specificMessage = 'Invalid email address provided.';
        } else if ('name' in error && error.name === 'ResendError') {
          errorCode = 'internal';
          specificMessage =
            'Could not send the sign-in email due to a provider issue.';
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
  async (
    request: functions.https.CallableRequest<{email: string; code: string}>,
    _context,
  ) => {
    const {email, code} = request.data;

    // Validate inputs
    if (!email || !code) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Both email and code must be provided',
      );
    }

    try {
      // Get the stored code information
      const codeDoc = await admin
        .firestore()
        .collection('authCodes')
        .doc(email)
        .get();

      if (!codeDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'No authentication code found for this email',
        );
      }

      const codeData = codeDoc.data();

      // Check if code is already used
      if (codeData?.used) {
        throw new functions.https.HttpsError(
          'already-exists',
          'This code has already been used',
        );
      }

      // Check if code is expired
      if (codeData?.expirationTime < Date.now()) {
        throw new functions.https.HttpsError(
          'deadline-exceeded',
          'This code has expired',
        );
      }

      // Verify the code
      if (codeData?.code !== code) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid authentication code',
        );
      }

      // Mark the code as used
      await admin.firestore().collection('authCodes').doc(email).update({
        used: true,
      });

      // Return the sign-in link and program data if available
      const returnData: {link: string; program?: unknown} = {link: codeData.link};
      if (codeData?.program) {
        returnData.program = codeData.program;
      }

      return returnData;
    } catch (error) {
      console.error('Error validating auth code:', error);

      // Re-throw HttpsError if it's already that type
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      // Otherwise wrap in a generic error
      throw new functions.https.HttpsError(
        'internal',
        'Failed to validate authentication code',
      );
    }
  },
);
