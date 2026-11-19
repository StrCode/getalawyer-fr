<script setup lang="ts">
/** For lawyers: the pitch on the forest panel, the membership card on a photo. */
</script>

<template>
  <section id="join" class="c-join c-rise">
    <div class="c-txt">
      <div class="c-kicker">For lawyers</div>
      <h2 class="c-display">Grow your practice. <em>Keep every naira you earn.</em></h2>
      <p class="c-lede">Clients find you in the directory and message you directly. One membership, paid for the term you choose, and no commission on your fees.</p>
      <ul class="c-perks">
        <li><CanopyGlyph name="tick" :stroke="3" />Verified mark on your profile once your checks pass</li>
        <li><CanopyGlyph name="tick" :stroke="3" />Turn auto-renew off whenever you like</li>
        <li><CanopyGlyph name="tick" :stroke="3" />Switch plan at your next renewal</li>
      </ul>
    </div>
    <div class="c-pic">
      <NuxtImg src="/images/canopy/desk.jpg" width="1000" height="1100" sizes="640px" alt="A lawyer working at a desk with papers and a laptop" loading="lazy" />
      <CanopyPlanCard />
    </div>
  </section>
</template>
