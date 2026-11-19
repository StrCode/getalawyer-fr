<script setup lang="ts">
/** "Why getalawyer": five tiles in two rows; one photo tile with an example slot picker. */
const slots = ['9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM']
const picked = ref(1)
const states = ['Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Oyo', 'Enugu', 'Kaduna', 'Delta']
</script>

<template>
  <section id="why" class="c-sec">
    <div class="c-sec-head">
      <div>
        <div class="c-kicker">Why getalawyer</div>
        <h2 class="c-display">Built so you can check before you trust.</h2>
      </div>
      <p class="c-lede" style="flex: 0 1 24rem">Who is listed, what it costs to ask, and what the platform takes. Each one is stated plainly.</p>
    </div>
    <div class="c-bento">
      <div class="c-tile c-t-photo c-rise">
        <NuxtImg src="/images/canopy/meet.jpg" width="1200" height="800" sizes="480px" alt="A lawyer in a blazer smiling across a table during a consultation" loading="lazy" />
        <div class="c-cap"><div class="c-kicker">Consultations</div><h3>Video, phone or in person.</h3></div>
        <div class="c-book">
          <div class="c-book-head"><b>Thu 19 Nov</b><span>Pick a time</span></div>
          <div class="c-slots" role="group" aria-label="Example time slots">
            <button v-for="(slot, index) in slots" :key="slot" type="button" :aria-pressed="picked === index" @click="picked = index">{{ slot }}</button>
          </div>
        </div>
      </div>
      <div class="c-tile c-five c-t-forest c-rise">
        <div class="c-kicker">Verification</div>
        <h3>Checked against official records before listing.</h3>
        <ul class="c-checks c-push">
          <li><span class="c-ok"><CanopyGlyph name="tick" :size="14" :stroke="3.2" /></span>National Identification Number<small>Checked</small></li>
          <li><span class="c-ok"><CanopyGlyph name="tick" :size="14" :stroke="3.2" /></span>Supreme Court enrolment number<small>Checked</small></li>
        </ul>
      </div>
      <div class="c-tile c-three c-t-sand c-rise">
        <div class="c-kicker">Messaging</div>
        <h3>Ask first, free.</h3>
        <div class="c-chat c-push">
          <p class="c-bub c-in">My landlord won’t return my deposit. Where do I stand?</p>
          <p class="c-bub c-out">Send me the agreement and I’ll tell you your options.</p>
        </div>
      </div>
      <div class="c-tile c-three c-t-white c-rise">
        <div class="c-kicker">Fees</div>
        <div class="c-zero c-push">0%</div>
        <h3>commission on your fee.</h3>
        <div class="c-split" aria-hidden="true" />
        <div class="c-split-key"><span>Your lawyer keeps 100%</span><span>getalawyer 0%</span></div>
      </div>
      <div class="c-tile c-five c-t-stone c-rise">
        <div class="c-kicker">Coverage</div>
        <h3>Lawyers in all 36 states and the FCT.</h3>
        <p>Filter the directory by the state you are in.</p>
        <div class="c-states c-push">
          <span v-for="state in states" :key="state">{{ state }}</span>
          <span class="c-more">+ 29 more</span>
        </div>
      </div>
    </div>
  </section>
</template>
