'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      <div className="py-3 px-4 flex items-center justify-between">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="ml-2">Back</span>
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-app-title text-center">Privacy Policy</h1>
        </div>

        {/* Empty spacer to balance the title */}
        <div className="w-10"></div>
      </div>

      <div className="h-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
            <div className="prose prose-invert max-w-none">
              <h2>Privacy Policy for MUSCO</h2>
              <p>
                <strong>Last Updated:</strong> March 2025
              </p>

              <h3>1. Introduction</h3>
              <p>
                Welcome to MUSCO (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;). We are committed to protecting your privacy and
                personal data. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our mobile
                application and related services.
              </p>
              <p>
                This policy complies with the General Data Protection Regulation
                (GDPR) and the Norwegian Personal Data Act.
              </p>

              <h3>2. Data Controller</h3>
              <p>
                MUSCO is the data controller responsible for your personal data.
                We are based in Norway and comply with applicable Norwegian and
                European Union data protection laws.
              </p>

              <h3>3. Information We Collect</h3>
              <p>We may collect the following types of information:</p>
              <h4>3.1 Personal Data</h4>
              <ul>
                <li>Contact information (email address, name)</li>
                <li>User profile information</li>
                <li>Account credentials</li>
              </ul>

              <h4>3.2 Usage Data</h4>
              <ul>
                <li>App usage statistics and interaction data</li>
                <li>Device information (device type, operating system)</li>
                <li>Exercise and fitness data you provide</li>
              </ul>

              <h3>4. How We Use Your Information</h3>
              <p>We use your information for purposes including:</p>
              <ul>
                <li>Providing and maintaining our services</li>
                <li>Personalizing your experience</li>
                <li>
                  Communicating with you about your account or our services
                </li>
                <li>Improving our application and services</li>
                <li>Complying with legal obligations</li>
              </ul>

              <h3>5. Legal Basis for Processing</h3>
              <p>We process your data based on:</p>
              <ul>
                <li>Your consent</li>
                <li>Performance of a contract with you</li>
                <li>
                  Our legitimate interests (such as improving our services)
                </li>
                <li>Compliance with legal obligations</li>
              </ul>

              <h3>6. Data Retention</h3>
              <p>
                We retain your personal data only for as long as necessary to
                fulfill the purposes outlined in this Privacy Policy, comply
                with our legal obligations, resolve disputes, and enforce our
                agreements.
              </p>

              <h3>7. Data Sharing and Disclosure</h3>
              <p>We may share your information with:</p>
              <ul>
                <li>
                  Service providers who assist us in operating our application
                </li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your consent</li>
              </ul>

              <h3>8. Data Transfers</h3>
              <p>
                As we operate in Norway, your data is primarily stored and
                processed within the European Economic Area (EEA). If we
                transfer data outside the EEA, we ensure appropriate safeguards
                are in place in compliance with GDPR.
              </p>

              <h3>9. Your Data Protection Rights</h3>
              <p>Under GDPR, you have the following rights:</p>
              <ul>
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                <li>Right to restriction of processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>

              <h3>10. Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal data against unauthorized or unlawful
                processing, accidental loss, destruction, or damage.
              </p>

              <h3>11. Children&apos;s Privacy</h3>
              <p>
                Our services are not intended for children under 16. We do not
                knowingly collect personal data from children under 16.
              </p>

              <h3>12. Changes to This Privacy Policy</h3>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the &quot;Last Updated&quot; date.
              </p>

              <h3>13. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> privacy@musco-app.com
              </p>

              <h3>14. Complaints</h3>
              <p>
                You have the right to lodge a complaint with the Norwegian Data
                Protection Authority (Datatilsynet) if you believe that our
                processing of your personal data infringes on data protection
                laws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
