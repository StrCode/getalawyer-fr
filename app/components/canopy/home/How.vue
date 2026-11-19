<script setup lang="ts">
import { Button } from '@/components/ui/button'
/** "How it works": three connected steps, each with a small product view and a cost tag. */
</script>

<template>
  <section id="how" class="c-sec" style="padding-top: 0">
    <div class="c-sec-head">
      <div>
        <div class="c-kicker">How it works</div>
        <h2 class="c-display">Three steps. You only pay at the last one.</h2>
      </div>
      <div class="c-side">
        <p class="c-lede">Searching and asking are free. A fee comes in only when you book a consultation, and you see it before you confirm.</p>
        <Button as-child variant="line" size="pill">
          <NuxtLink to="/find-lawyers">Start a search →</NuxtLink>
        </Button>
      </div>
    </div>
    <ol class="c-steps">
      <li class="c-step c-rise">
        <div class="c-rail"><span class="c-n">1</span><i /><span class="c-cost">Free</span></div>
        <div class="c-demo" aria-hidden="true">
          <div class="c-d-q"><CanopyGlyph name="search" :stroke="2.2" />Tenancy dispute<span>Lagos</span></div>
          <div class="c-d-res">
            <span class="c-faces"><i>AO</i><i>CN</i><i>FB</i></span>
            <span>Verified lawyers who match</span>
          </div>
        </div>
        <h3>Find your lawyer</h3>
        <p>Search by practice area and state, then compare experience, meeting options and fees.</p>
      </li>
      <li class="c-step c-rise">
        <div class="c-rail"><span class="c-n">2</span><i /><span class="c-cost">Free</span></div>
        <div class="c-demo" aria-hidden="true">
          <p class="c-bub c-out">Can I end my tenancy early without losing my deposit?</p>
          <div class="c-d-send"><span>Write a message…</span><span class="c-go"><CanopyGlyph name="arrow" :size="14" :stroke="2.8" /></span></div>
        </div>
        <h3>Ask your question</h3>
        <p>Message the lawyer directly and get a first answer before you commit to anything.</p>
      </li>
      <li class="c-step c-rise">
        <div class="c-rail"><span class="c-n">3</span><i /><span class="c-cost c-paid">Fee agreed first</span></div>
        <div class="c-demo" aria-hidden="true">
          <div class="c-d-row">
            <span class="c-ok"><CanopyGlyph name="tick" :size="14" :stroke="3.2" /></span>
            <div><b>Thu 19 Nov, 10:30 AM</b><small>Video call with your lawyer</small></div>
          </div>
          <div class="c-d-fee"><span>Consultation fee</span><b>Shown before you book</b></div>
        </div>
        <h3>Book a consultation</h3>
        <p>Pick a time and meet by video, phone or in person. The thread stays open afterwards.</p>
      </li>
    </ol>
  </section>
</template>
