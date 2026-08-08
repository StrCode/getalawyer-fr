<script setup lang="ts">
import LegalPageShell from '@/components/legal/LegalPageShell.vue'

definePageMeta({ layout: 'landing' })

useHead({
  title: 'NDPA Compliance · GetaLawyer',
  meta: [{ name: 'description', content: 'How GetaLawyer applies the Nigeria Data Protection Act 2023 in practice.' }],
})
</script>

<template>
  <LegalPageShell
    title="NDPA compliance"
    effective-date="August 8, 2026"
    intro="How we apply the Nigeria Data Protection Act 2023 (NDPA) in practice. This statement supplements our Privacy Policy."
  >
   <h2>Our commitment</h2>
    <p>
      GetaLawyer handles personal data in accordance with the NDPA and the principles it sets
      out. Because we operate a marketplace for legal services, we treat data protection as a
      core product requirement, not a checkbox.
    </p>

   <h2>The principles, applied</h2>
    <ul>
      <li><strong>Lawfulness, fairness, transparency</strong> — every processing purpose and its lawful basis is listed in our <NuxtLink to="/privacy">Privacy Policy</NuxtLink>; we don't process data for undisclosed purposes.</li>
      <li><strong>Purpose limitation</strong> — verification data (NIN, SCN) is used to verify lawyers, and for nothing else.</li>
      <li><strong>Data minimisation</strong> — we collect what the service needs. Clients can search and browse without providing more than an account.</li>
      <li><strong>Accuracy</strong> — lawyers can correct their professional data at any time in the profile editor; clients can correct account data in settings.</li>
      <li><strong>Storage limitation</strong> — retention periods are defined per data category in the Privacy Policy.</li>
      <li><strong>Integrity and confidentiality</strong> — encryption in transit, hashed credentials, participant-scoped access to conversations, and access controls on verification records.</li>
      <li><strong>Accountability</strong> — processing activities and vendor relationships are documented, and data-protection review is part of how we ship features.</li>
    </ul>

   <h2>Data subject requests</h2>
    <p>
      Requests to access, correct, delete, restrict, or port personal data go to
      <a href="mailto:support@getalawyer.com.ng">support@getalawyer.com.ng</a> with the subject
      line "Data request". We verify the requester's identity before acting and respond within
      the NDPA's timelines.
    </p>

   <h2>Breach response</h2>
    <p>
      We maintain a breach-response procedure: contain, assess impact on data subjects, notify
      the Nigeria Data Protection Commission where required, and inform affected users when a
      breach is likely to put their rights at risk.
    </p>

   <h2>Cross-border transfers</h2>
    <p>
      Some of our infrastructure providers process data outside Nigeria. Where that happens, we
      rely on the transfer mechanisms the NDPA permits and require contractual protections from
      the provider.
    </p>

   <h2>Questions</h2>
    <p>
      For anything this page doesn't answer, contact
      <a href="mailto:support@getalawyer.com.ng">support@getalawyer.com.ng</a>.
    </p>
  </LegalPageShell>
</template>
