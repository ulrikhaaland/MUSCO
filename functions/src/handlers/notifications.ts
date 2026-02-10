import * as admin from 'firebase-admin';
import {Resend} from 'resend';
import {defineString} from 'firebase-functions/params';
import {onSchedule, ScheduledEvent} from 'firebase-functions/v2/scheduler';

// --- Configuration Parameters ---
const resendApiKey = defineString('RESEND_API_KEY');
const emailFromAddress = defineString('EMAIL_FROM_ADDRESS', {default: 'noreply@bodai.no'});
const appBaseUrl = defineString('APP_BASE_URL_FOR_NOTIFICATIONS', {default: 'https://bodai.no'});

// --- Constants ---
const PROGRAM_STATUS_DONE = 'done';

// --- Types ---
interface EligibleProgram {
  docId: string;
  type: string;
  title: string;
  language: string;
}

// --- Date helpers ---

/**
 * Returns next Monday 00:00:00 UTC as an ISO string.
 * On Sundays this is tomorrow; used to check whether a user has already
 * generated a follow-up for the upcoming week.
 * @return {string} ISO date string of next Monday
 */
function getNextMondayISO(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday),
  );
  return nextMonday.toISOString();
}

// --- Display helpers ---

/**
 * Format a program type into a human-readable name.
 * @param {string} type Program type key
 * @param {string} lang Language code
 * @return {string} Formatted program type name
 */
function formatProgramType(type: string, lang: string): string {
  const names: Record<string, Record<string, string>> = {
    exercise: {en: 'Exercise Program', nb: 'Treningsprogram'},
    recovery: {en: 'Recovery Program', nb: 'Restitusjonsprogram'},
    exercise_and_recovery: {en: 'Exercise & Recovery Program', nb: 'Trenings- og restitusjonsprogram'},
  };
  return names[type]?.[lang] || names[type]?.en || type;
}

/**
 * Build an HTML snippet listing program names (text only, no buttons).
 * @param {EligibleProgram[]} programs Programs to list
 * @param {string} lang Language code
 * @return {string} HTML string
 */
function programListHtml(programs: EligibleProgram[], lang: string): string {
  if (programs.length === 1) {
    const name = programs[0].title || formatProgramType(programs[0].type, lang);
    return `<strong style="color:#fff;">${name}</strong>`;
  }
  const items = programs
    .map((p) => {
      const name = p.title || formatProgramType(p.type, lang);
      return `<li style="margin-bottom:6px;">${name}</li>`;
    })
    .join('');
  return `<ul style="text-align:left;padding-left:20px;margin:12px 0;">${items}</ul>`;
}

/**
 * Build CTA button(s) that deep-link to the specific program(s).
 * Single program → one button. Multiple → one button per program.
 * @param {EligibleProgram[]} programs Programs to build buttons for
 * @param {string} lang Language code
 * @param {string} baseUrl App base URL
 * @param {string} email User email for login prefill
 * @param {string} buttonLabel Default button label
 * @return {string} HTML for CTA button(s)
 */
function buildCtaButtons(
  programs: EligibleProgram[],
  lang: string,
  baseUrl: string,
  email: string,
  buttonLabel: string,
): string {
  if (programs.length === 1) {
    const link = `${baseUrl}/program?id=${encodeURIComponent(programs[0].docId)}&email=${encodeURIComponent(email)}`;
    return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 28px;border-collapse:separate;width:auto;">
  <tr>
    <td align="center" bgcolor="#4f46e5" style="background-color:#4f46e5;border-radius:8px;padding:14px 28px;">
      <a href="${link}" target="_blank" style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;display:inline-block;">
        ${buttonLabel}
      </a>
    </td>
  </tr>
</table>`;
  }

  // Multiple programs: one button per program
  const buttons = programs.map((p) => {
    const name = p.title || formatProgramType(p.type, lang);
    const link = `${baseUrl}/program?id=${encodeURIComponent(p.docId)}&email=${encodeURIComponent(email)}`;
    return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 10px;border-collapse:separate;width:auto;">
  <tr>
    <td align="center" bgcolor="#4f46e5" style="background-color:#4f46e5;border-radius:8px;padding:12px 24px;">
      <a href="${link}" target="_blank" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
        ${name}
      </a>
    </td>
  </tr>
</table>`;
  }).join('\n');

  return `<div style="margin-bottom:18px;">${buttons}</div>`;
}

// --- Email templates ---

interface EmailStrings {
  subject: string;
  preheader: string;
  tagline: string;
  heading: string;
  bodyBefore: string;
  bodyAfter: string;
  button: string;
  footer: string;
}

/**
 * Get translated email strings for the given language.
 * @param {string} lang Language code ('en' or 'nb')
 * @return {EmailStrings} Translated strings
 */
function getStrings(lang: string): EmailStrings {
  if (lang === 'nb') {
    return {
      subject: 'Ukens program er klart til å genereres',
      preheader: 'Generer neste ukes program i dag, så er det klart til mandag.',
      tagline: 'Intelligent trening, uten friksjonen',
      heading: 'Neste uke venter!',
      bodyBefore: 'Du kan nå generere neste ukes program for:',
      bodyAfter: 'Generer det i dag, så har du det klart til mandag morgen.',
      button: 'Generer neste uke',
      footer: 'Du mottar denne e-posten fordi du er en BodAI-bruker. Du kan administrere varslingsinnstillingene dine i appen.',
    };
  }
  return {
    subject: 'Your next program week is ready to generate',
    preheader: 'Generate next week\'s program today so it\'s ready for Monday.',
    tagline: 'Intelligent Training, Minus The Friction',
    heading: 'Next week awaits!',
    bodyBefore: 'You can now generate next week\'s program for:',
    bodyAfter: 'Generate it today so it\'s ready when you hit the gym Monday morning.',
    button: 'Generate Next Week',
    footer: 'You\'re receiving this because you\'re a BodAI user. You can manage your notification settings in the app.',
  };
}

/**
 * Build the full HTML email body.
 * @param {EligibleProgram[]} programs Eligible programs to include
 * @param {string} lang Language code
 * @param {string} baseUrl App base URL for CTA link
 * @param {string} email User email for login prefill
 * @return {string} Complete HTML email
 */
function buildEmailHtml(
  programs: EligibleProgram[],
  lang: string,
  baseUrl: string,
  email: string,
): string {
  const s = getStrings(lang);
  const listHtml = programListHtml(programs, lang);
  const ctaHtml = buildCtaButtons(programs, lang, baseUrl, email, s.button);

  return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${s.subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
  </head>
  <body bgcolor="#0d0e14" style="margin:0;padding:0;background-color:#0d0e14 !important;color:#e4e7ec;font-family:'Inter',Helvetica,Arial,sans-serif;line-height:1.7;mso-line-height-rule:exactly;">
    <span style="display:none;font-size:0;max-height:0;opacity:0;overflow:hidden;">${s.preheader}&nbsp;&nbsp;&nbsp;</span>
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
                  ${s.tagline}
                </p>
                <h2 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#fff;">
                  ${s.heading}
                </h2>
                <p style="margin:0 0 8px;font-size:16px;color:#cbd5e1;line-height:1.6;">
                  ${s.bodyBefore}
                </p>
                ${listHtml}
                <p style="margin:0 0 28px;font-size:16px;color:#cbd5e1;line-height:1.6;">
                  ${s.bodyAfter}
                </p>
                ${ctaHtml}
                <p style="margin:0;font-size:11px;color:#8a8d9c;line-height:1.5;">
                  ${s.footer}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// =============================================================================
// Test emails — receive daily reminders (Mon–Sat) for development purposes
// =============================================================================
const TEST_EMAILS = new Set([
  'ulrikhaland@gmail.com',
  'ulrikhaaland2@gmail.com',
]);

// =============================================================================
// Scheduled Functions
// =============================================================================

/**
 * Sends a reminder email every Sunday at 10:00 Europe/Oslo to users who have
 * active programs eligible for a follow-up week.
 *
 * Logic:
 *  1. Collection-group query for all programs with status "done".
 *  2. Group by user, deduplicate by program type.
 *  3. For each user, check `weeklyProgramGenerations` to skip types where
 *     the user already generated a follow-up for the upcoming week.
 *  4. Send ONE email per user listing all eligible programs.
 */
export const sendWeeklyProgramReminder = onSchedule(
  {
    schedule: '0 10 * * 0', // Every Sunday at 10:00
    timeZone: 'Europe/Oslo',
    timeoutSeconds: 540,
    memory: '256MiB',
  },
  async (_event: ScheduledEvent) => {
    const currentResendApiKey = resendApiKey.value();
    const currentEmailFromAddress = emailFromAddress.value();
    const currentAppBaseUrl = appBaseUrl.value();

    if (!currentResendApiKey) {
      console.error('[sunday-reminder] Resend API key not configured');
      throw new Error('Resend API key not configured for Sunday reminder.');
    }

    const resend = new Resend(currentResendApiKey);
    const db = admin.firestore();
    const auth = admin.auth();

    // The generation-week key that represents "next week" on a Sunday.
    // If a user already has this value stored, they've already generated.
    const nextMondayISO = getNextMondayISO();

    // ------------------------------------------------------------------
    // 1. Fetch all programs with status "done"
    // ------------------------------------------------------------------
    const snapshot = await db
      .collectionGroup('programs')
      .where('status', '==', PROGRAM_STATUS_DONE)
      .get();

    // ------------------------------------------------------------------
    // 2. Group by user, filter to top-level program docs only
    // ------------------------------------------------------------------
    const userProgramMap = new Map<string, EligibleProgram[]>();

    for (const doc of snapshot.docs) {
      // Path: users/{userId}/programs/{programId}  →  4 segments
      // Legacy week subcollection: users/.../programs/.../programs/...  →  6 segments
      const segments = doc.ref.path.split('/');
      if (segments.length !== 4) continue;

      const userId = segments[1];
      const programDocId = segments[3];
      const data = doc.data();
      if (!data.type) continue;

      if (!userProgramMap.has(userId)) {
        userProgramMap.set(userId, []);
      }
      userProgramMap.get(userId)!.push({
        docId: programDocId,
        type: data.type as string,
        title: (data.title as string) || '',
        language: (data.language as string) || 'en',
      });
    }

    console.log(
      `[sunday-reminder] Found ${userProgramMap.size} users with done programs`,
    );

    // ------------------------------------------------------------------
    // 3. For each user, check limits and send a single email
    // ------------------------------------------------------------------
    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    for (const [userId, programs] of userProgramMap) {
      try {
        // Skip users whose Firestore profile was deleted (orphan programs)
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
          emailsSkipped++;
          continue;
        }

        const userData = userDoc.data() || {};

        // Respect email notification preference (defaults to true for existing users)
        if (userData.emailNotifications === false) {
          emailsSkipped++;
          continue;
        }

        // Read weekly generation limits
        const generations: Record<string, string> =
          userData.weeklyProgramGenerations || {};

        // Deduplicate by type and keep only types that haven't been generated
        // for the upcoming week yet.
        const seenTypes = new Set<string>();
        const eligible = programs.filter((p) => {
          if (seenTypes.has(p.type)) return false;
          seenTypes.add(p.type);
          return generations[p.type] !== nextMondayISO;
        });

        if (eligible.length === 0) {
          emailsSkipped++;
          continue;
        }

        // Fetch email from Firebase Auth — skip silently if account was deleted
        let email: string | undefined;
        try {
          const userRecord = await auth.getUser(userId);
          email = userRecord.email;
        } catch (authErr: unknown) {
          const code = (authErr as {code?: string}).code;
          if (code === 'auth/user-not-found') {
            emailsSkipped++;
            continue;
          }
          throw authErr; // Re-throw unexpected Auth errors
        }

        if (!email) {
          emailsSkipped++;
          continue;
        }

        // Pick language from the first eligible program
        const lang = eligible[0].language;
        const strings = getStrings(lang);

        await resend.emails.send({
          from: currentEmailFromAddress,
          to: email,
          subject: strings.subject,
          html: buildEmailHtml(eligible, lang, currentAppBaseUrl, email),
        });

        emailsSent++;
      } catch (err) {
        console.error(`[sunday-reminder] Failed for user ${userId}:`, err);
        emailsFailed++;
      }
    }

    console.log(
      `[sunday-reminder] Done. sent=${emailsSent} skipped=${emailsSkipped} failed=${emailsFailed}`,
    );
  },
);

/**
 * Daily test reminder (Mon–Sat at 10:00 Europe/Oslo).
 * Only sends to TEST_EMAILS so we can verify the email flow without
 * waiting for Sunday. Remove this function once testing is complete.
 */
export const sendDailyTestReminder = onSchedule(
  {
    schedule: '0 10 * * 1-6', // Mon–Sat at 10:00
    timeZone: 'Europe/Oslo',
    timeoutSeconds: 120,
    memory: '256MiB',
  },
  async (_event: ScheduledEvent) => {
    const currentResendApiKey = resendApiKey.value();
    const currentEmailFromAddress = emailFromAddress.value();
    const currentAppBaseUrl = appBaseUrl.value();

    if (!currentResendApiKey) {
      console.error('[daily-test] Resend API key not configured');
      throw new Error('Resend API key not configured.');
    }

    const resend = new Resend(currentResendApiKey);
    const db = admin.firestore();
    const auth = admin.auth();

    // Look up test users by email
    const testUsers: {uid: string; email: string}[] = [];
    for (const testEmail of TEST_EMAILS) {
      try {
        const userRecord = await auth.getUserByEmail(testEmail);
        testUsers.push({uid: userRecord.uid, email: userRecord.email!});
      } catch {
        // User doesn't exist — skip silently
      }
    }

    if (testUsers.length === 0) {
      console.log('[daily-test] No test users found, skipping.');
      return;
    }

    let sent = 0;
    let skipped = 0;

    for (const {uid, email} of testUsers) {
      try {
        // Check Firestore profile exists and notifications enabled
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
          skipped++;
          continue;
        }

        const userData = userDoc.data() || {};
        if (userData.emailNotifications === false) {
          skipped++;
          continue;
        }

        // Fetch user's done programs
        const programsSnap = await db
          .collection('users').doc(uid).collection('programs')
          .where('status', '==', PROGRAM_STATUS_DONE)
          .get();

        if (programsSnap.empty) {
          skipped++;
          continue;
        }

        // Deduplicate by type
        const seenTypes = new Set<string>();
        const eligible: EligibleProgram[] = [];
        for (const doc of programsSnap.docs) {
          const data = doc.data();
          if (!data.type || seenTypes.has(data.type)) continue;
          seenTypes.add(data.type);
          eligible.push({
            docId: doc.id,
            type: data.type,
            title: data.title || '',
            language: data.language || 'en',
          });
        }

        if (eligible.length === 0) {
          skipped++;
          continue;
        }

        const lang = eligible[0].language;
        const strings = getStrings(lang);

        await resend.emails.send({
          from: currentEmailFromAddress,
          to: email,
          subject: `[TEST] ${strings.subject}`,
          html: buildEmailHtml(eligible, lang, currentAppBaseUrl, email),
        });

        sent++;
      } catch (err) {
        console.error(`[daily-test] Failed for ${email}:`, err);
      }
    }

    console.log(`[daily-test] Done. sent=${sent} skipped=${skipped}`);
  },
);
