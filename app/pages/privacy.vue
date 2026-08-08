<script setup lang="ts">
import LegalPageShell from '@/components/legal/LegalPageShell.vue'

definePageMeta({ layout: 'landing' })

useHead({
  title: 'Privacy Policy · GetaLawyer',
  meta: [{ name: 'description', content: 'What personal data GetaLawyer collects, why, and your rights under the Nigeria Data Protection Act.' }],
})
</script>

<template>
  <LegalPageShell
    title="Privacy Policy"
    effective-date="August 8, 2026"
    intro="This policy explains what personal data we collect, why we collect it, who we share it with, and the rights you have under the Nigeria Data Protection Act (NDPA) 2023."
  >
   <h2>1. Who we are</h2>
    <p>
      GetaLawyer operates this platform and is the data controller for the personal data
      described here. Contact for privacy matters:
      <a href="mailto:support@getalawyer.com.ng">support@getalawyer.com.ng</a>.
    </p>

   <h2>2. What we collect</h2>
   <h3>Everyone</h3>
    <ul>
      <li><strong>Account data</strong> — name, email address and/or phone number, password (stored hashed), account type (client or lawyer).</li>
      <li><strong>Usage data</strong> — pages visited, searches run, and technical logs (IP address, device and browser information) needed to run and secure the service.</li>
    </ul>
   <h3>Lawyers</h3>
    <ul>
      <li><strong>Verification data</strong> — National Identification Number (NIN) and Supreme Court enrolment number (SCN), checked against official records through a licensed identity-verification provider; supporting documents you upload.</li>
      <li><strong>Profile data</strong> — the professional information you choose to publish: photo, headline, experience, education, practice areas, consultation options, availability, and articles.</li>
    </ul>
   <h3>Clients</h3>
    <ul>
      <li><strong>Enquiry and matter data</strong> — the practice areas you search, the lawyers you contact, and the content of messages and files you exchange with them.</li>
    </ul>

   <h2>3. Why we process it (lawful bases)</h2>
    <ul>
      <li><strong>To provide the service</strong> (contract): accounts, search, profiles, messaging, bookings, notifications.</li>
      <li><strong>Verification</strong> (legal obligation and legitimate interest): confirming lawyers' identity and enrolment protects users of a legal marketplace.</li>
      <li><strong>Security and abuse prevention</strong> (legitimate interest): logs, rate limiting, fraud detection.</li>
      <li><strong>Communications you request</strong> (consent): e.g. the newsletter, which you can leave at any time.</li>
    </ul>
    <p>We do not sell personal data, and we do not use it for third-party advertising.</p>

   <h2>4. Messages between clients and lawyers</h2>
    <p>
      Messages and attachments are stored so both parties can access their conversation history.
      They are private to the conversation's participants; our staff access them only where
      necessary for security, abuse investigation, or legal compliance. Remember that the lawyer
      you write to receives what you send — their handling of it is governed by their own
      professional obligations.
    </p>

   <h2>5. Who we share data with</h2>
    <ul>
      <li><strong>Lawyers you contact</strong> receive your name and the content of your enquiry.</li>
      <li><strong>Service providers</strong> acting on our instructions: cloud hosting and database providers, file storage, identity verification, and payment processing for lawyer subscriptions. They process data only to provide their service to us.</li>
      <li><strong>Authorities</strong> where the law requires it.</li>
    </ul>
    <p>Where a provider processes data outside Nigeria, we require protections consistent with the NDPA's rules on cross-border transfer.</p>

   <h2>6. Retention</h2>
    <p>
      We keep account and profile data while your account is active. Conversation history is kept
      so both participants retain their records. Verification records are kept as long as the
      lawyer is listed, plus any period required by law. When data is no longer needed, we delete
      or anonymise it.
    </p>

   <h2>7. Your rights under the NDPA</h2>
    <p>You can ask us to:</p>
    <ul>
      <li>confirm whether we process your data, and give you access to it;</li>
      <li>correct inaccurate or incomplete data;</li>
      <li>delete data we no longer have grounds to keep;</li>
      <li>restrict or object to certain processing;</li>
      <li>provide your data in a portable format;</li>
      <li>withdraw consent where processing is based on consent.</li>
    </ul>
    <p>
      Write to <a href="mailto:support@getalawyer.com.ng">support@getalawyer.com.ng</a> — we
      respond within the timelines the NDPA sets. You also have the right to complain to the
      Nigeria Data Protection Commission.
    </p>

   <h2>8. Security</h2>
    <p>
      We protect data with encryption in transit, hashed credentials, scoped access controls,
      and audit logging. No system is perfectly secure; if a breach puts your rights at risk we
      will notify the Commission and affected users as the NDPA requires.
    </p>

   <h2>9. Children</h2>
    <p>The platform is for adults. We do not knowingly collect data from anyone under 18.</p>

   <h2>10. Changes</h2>
    <p>
      We will post any changes here and update the effective date; material changes will be
      notified on the platform.
    </p>
  </LegalPageShell>
</template>
