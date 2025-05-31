import * as admin from 'firebase-admin';
import {Resend} from 'resend';
import {defineString} from 'firebase-functions/params';
import {onSchedule, ScheduledEvent} from 'firebase-functions/v2/scheduler';

// --- Define Configuration Parameters (v2 style) ---
const resendApiKey = defineString('RESEND_API_KEY');
const emailFromAddress = defineString('EMAIL_FROM_ADDRESS', {default: 'noreply@bodai.no'});
const appBaseUrlForNotifications = defineString('APP_BASE_URL_FOR_NOTIFICATIONS', {default: 'https://bodai.no'});

/**
 * Sends a weekly program reminder email to all registered users.
 * Runs every Monday at 00:01 Europe/Oslo time.
 */
export const sendWeeklyProgramReminder = onSchedule(
  {schedule: '0 * * * *', timeZone: 'Europe/Oslo'}, // Every hour
  async (_event: ScheduledEvent) => {
    const currentResendApiKey = resendApiKey.value();
    const currentEmailFromAddress = emailFromAddress.value();
    const currentAppBaseUrl = appBaseUrlForNotifications.value();

    if (!currentResendApiKey) {
      console.error('FATAL ERROR: Resend API key parameter is not set for weekly reminder.');
      throw new Error('Resend API key not configured for weekly reminder.');
    }
    if (!currentAppBaseUrl) {
      console.error('FATAL ERROR: App base URL for notifications is not set.');
      throw new Error('App base URL for notifications not configured.');
    }

    const resend = new Resend(currentResendApiKey);
    const auth = admin.auth();

    const linkToProgram = `${currentAppBaseUrl}/program`;

    // Email content based on user's request (English)
    // Norwegian translations provided for future use or adaptation
    const emailSubjectEn = 'Ready for your new program?';
    const emailTitleEn = 'Your New bodAI Program';
    const taglineEn = 'Intelligent Training, Minus The Friction';
    const headingEn = 'Your new program is almost ready!';
    const bodyTextEn = 'Your personalized training program for the week is being prepared. Click the button below to view it once it\'s live.';
    const buttonTextEn = 'View Program';
    const footerTextEn = 'You\'re receiving this because you\'re a bodAI user. You can manage your notification settings in the app.';
    const preheaderTextEn = 'Your weekly bodAI program is nearly here!';

    /*
    // Norwegian translations
    const emailSubjectNb = 'Klar for ditt nye program?';
    const emailTitleNb = 'Ditt nye bodAI-program';
    const taglineNb = 'Intelligent trening, uten friksjonen';
    const headingNb = 'Ditt nye program er snart klart!';
    const bodyTextNb = `Ditt personlige treningsprogram for uken forberedes. Klikk på knappen nedenfor for å se det så snart det er tilgjengelig.`;
    const buttonTextNb = 'Se Programmet';
    const footerTextNb = "Du mottar denne e-posten fordi du er en bodAI-bruker. Administrer varslingsinnstillingene dine i appen.";
    const preheaderTextNb = 'Ditt ukentlige bodAI-program er snart her!';
    */

    // Using English as per user's prompt.
    // To use Norwegian: const language = 'nb'; and uncomment/use nb variables.
    // For per-user language, this logic would need to be inside the user loop,
    // fetching user language preference from Firestore.
    const language = 'en'; // Defaulting to English for this implementation

    const emailSubject = emailSubjectEn;
    const emailTitle = emailTitleEn;
    const tagline = taglineEn;
    const heading = headingEn;
    const bodyText = bodyTextEn;
    const buttonText = buttonTextEn;
    const footerText = footerTextEn;
    const preheaderText = preheaderTextEn;


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
    <span style="display:none;font-size:0;max-height:0;opacity:0;overflow:hidden;">${preheaderText}&nbsp;&nbsp;&nbsp;</span>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#0d0e14" style="background-color:#0d0e14;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#16171e" style="max-width:520px;width:100%;background-color:#16171e;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.6);border-collapse:collapse;">
            <tr>
              <td style="padding:32px 24px;text-align:center;">
                <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#fff;">
                  bod<span style="color:#4f46e5;">AI</span>
                </h1>
                <p style="margin:0 0 28px;font-size:14px;color:#9a9fad;text-transform:uppercase;letter-spacing:.5px;">
                  ${tagline}
                </p>
                <h2 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#fff;">
                  ${heading}
                </h2>
                <p style="margin:0 0 28px;font-size:16px;color:#cbd5e1;line-height:1.6;">
                  ${bodyText}
                </p>
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 28px;border-collapse:separate;width:auto;">
                  <tr>
                    <td align="center" bgcolor="#4f46e5" style="background-color:#4f46e5;border-radius:8px;padding:14px 28px;">
                      <a href="${linkToProgram}" target="_blank" style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;display:inline-block;">
                        ${buttonText}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:11px;color:#8a8d9c;line-height:1.5;">
                  ${footerText}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    let pageToken: string | undefined = undefined;
    let usersProcessed = 0;
    let emailsSent = 0;
    let emailsFailed = 0;

    try {
      console.log('Starting to send weekly program reminders to all users.');
      do {
        const listUsersResult = await auth.listUsers(1000, pageToken);
        pageToken = listUsersResult.pageToken;

        for (const user of listUsersResult.users) {
          if (user.email) {
            // Convert email to lowercase for case-insensitive comparison
            const lowerCaseEmail = user.email.toLowerCase();
            if (lowerCaseEmail.includes('ulrik')) {
              try {
                // Future enhancement: Fetch user-specific language preference here
                // and select emailSubject, bodyText, etc., accordingly.
                await resend.emails.send({
                  from: currentEmailFromAddress,
                  to: user.email,
                  subject: emailSubject, // Uses the globally selected language texts
                  html: emailHtml, // Same HTML for all users in this batch
                });
                console.log(`Weekly program reminder sent to ${user.email}`);
                emailsSent++;
              } catch (emailError) {
                console.error(`Failed to send weekly reminder to ${user.email}:`, emailError);
                emailsFailed++;
              }
            } else {
              // Optional: Log users that are skipped
              // console.log(`Skipping email to ${user.email} as it does not contain 'ulrik'.`);
            }
          }
          usersProcessed++;
        }
      } while (pageToken);

      console.log(`Weekly program reminder process finished. Users processed: ${usersProcessed}. Emails sent: ${emailsSent}. Emails failed: ${emailsFailed}.`);
    } catch (error) {
      console.error('General error listing users or during batch send for weekly program reminders:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to send weekly reminders: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred during the weekly reminder sending process.');
      }
    }
  });
