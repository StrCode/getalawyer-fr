<script setup lang="ts">
import LegalPageShell from '@/components/legal/LegalPageShell.vue'

definePageMeta({ layout: 'landing' })

useHead({
  title: 'Terms of Service · GetaLawyer',
  meta: [{ name: 'description', content: 'The terms that govern your use of the GetaLawyer platform.' }],
})
</script>

<template>
  <LegalPageShell
    title="Terms of Service"
    effective-date="August 8, 2026"
    intro="These terms govern your use of GetaLawyer. Please read them — they explain what we are, what we are not, and what you agree to by using the platform."
  >
   <h2>1. What GetaLawyer is</h2>
    <p>
      GetaLawyer is an online directory and communication platform that helps people in Nigeria
      find and contact independent legal practitioners. We verify that lawyers listed on the
      platform hold a National Identification Number (NIN) and a Supreme Court of Nigeria
      enrolment number (SCN) at the time of onboarding.
    </p>

   <h2>2. What GetaLawyer is not</h2>
    <p>
      GetaLawyer is <strong>not a law firm</strong> and does not practise law. We do not provide
      legal advice, legal opinions, or legal representation. Nothing on the platform — including
      lawyer profiles, articles, or messages exchanged through it — constitutes legal advice from
      GetaLawyer.
    </p>
    <ul>
      <li>Using the platform does not create a lawyer–client relationship between you and GetaLawyer.</li>
      <li>Any lawyer–client relationship you form is directly between you and the lawyer you engage, on terms you agree with them.</li>
      <li>We do not supervise, direct, or take responsibility for the legal services lawyers provide.</li>
    </ul>

   <h2>3. Verification and its limits</h2>
    <p>
      Our verification checks confirm identity and bar enrolment at onboarding. They are not a
      guarantee of the quality, availability, ethics, or outcome of any lawyer's work, and they
      are not a continuing warranty — a lawyer's standing can change after we check it. You remain
      responsible for deciding whether a particular lawyer suits your matter.
    </p>

   <h2>4. Fees and payments</h2>
    <p>
      GetaLawyer charges lawyers a flat subscription to be listed. We take no commission on legal
      fees. Any fees for legal services are agreed and settled directly between you and the
      lawyer; consultation fee requests exchanged through the platform's messaging are a
      convenience for recording that agreement, not a payment we broker or guarantee.
    </p>

   <h2>5. Your account</h2>
    <ul>
      <li>You must provide accurate information and keep your credentials secure. You are responsible for activity under your account.</li>
      <li>Lawyers must keep their professional information (enrolment, licensure, practice details) accurate and current.</li>
      <li>You must be at least 18 years old to use the platform.</li>
    </ul>

   <h2>6. Acceptable use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>impersonate any person, or misrepresent professional credentials;</li>
      <li>use the platform to send unlawful, harassing, or fraudulent content;</li>
      <li>scrape, harvest, or bulk-download lawyer or client data;</li>
      <li>interfere with the operation or security of the service.</li>
    </ul>
    <p>We may suspend or remove accounts that breach these terms.</p>

   <h2>7. Content</h2>
    <p>
      Lawyers own the content they publish on their profiles and grant us a licence to display it
      on the platform. You are responsible for what you post or send. We may remove content that
      breaches these terms or the law.
    </p>

   <h2>8. Liability</h2>
    <p>
      To the fullest extent permitted by law, GetaLawyer is not liable for the acts or omissions
      of lawyers or clients, for the outcome of any legal matter, or for indirect or consequential
      loss arising from use of the platform. The platform is provided "as is" and we do not
      warrant uninterrupted or error-free operation. Nothing in these terms excludes liability
      that cannot be excluded under Nigerian law.
    </p>

   <h2>9. Privacy</h2>
    <p>
      Our <NuxtLink to="/privacy">Privacy Policy</NuxtLink> explains what personal data we
      collect and how we handle it, in line with the Nigeria Data Protection Act. See also our
      <NuxtLink to="/ndpa">NDPA statement</NuxtLink>.
    </p>

   <h2>10. Changes and termination</h2>
    <p>
      We may update these terms; material changes will be notified on the platform and the
      effective date above updated. You may close your account at any time. Sections that by
      their nature should survive (liability, content licences, disputes) survive termination.
    </p>

   <h2>11. Governing law</h2>
    <p>
      These terms are governed by the laws of the Federal Republic of Nigeria, and disputes are
      subject to the jurisdiction of the Nigerian courts.
    </p>

   <h2>12. Contact</h2>
    <p>
      Questions about these terms:
      <a href="mailto:support@getalawyer.com.ng">support@getalawyer.com.ng</a>.
    </p>
  </LegalPageShell>
</template>
