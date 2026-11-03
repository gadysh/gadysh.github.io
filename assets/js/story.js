/**
 * Story player — a picture story that plays by itself (before → magic transition → after).
 * A poster in the page ([data-story-open]) opens the story full screen in a <dialog>;
 * on phones it behaves like "stories": tap to advance, swipe sideways, swipe down to close.
 * Content lives in a <script type="application/json" class="story-data"> inside
 * each [data-story] element, so one engine serves every scenario and language.
 */
(function () {
  if (typeof window !== 'undefined' && window.PowStory && window.PowStory._loaded) {
    return;
  }

  const STAR = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"/></svg>';
  const ICON_PAUSE = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';
  const ICON_PLAY = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const ICON_SOUND_ON = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
  const ICON_SOUND_OFF = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
  const SPARK_COLORS = ['#fde68a', '#facc15', '#ffffff', '#5eead4', '#99f6e4', '#fff7d6'];

  const hasLocation = typeof location !== 'undefined';
  const forceMotion = hasLocation && /[?&]motion=1\b/.test(location.search);
  const reducedMQ = forceMotion
    ? { matches: false }
    : (typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false });
  const PORTRAIT_MEDIA = '(max-width: 860px), (orientation: portrait) and (max-width: 1024px)';
  // Chat stories switch to the recomposed 9:16 scene only on a portrait screen (subset of PORTRAIT_MEDIA,
  // same string as the @media rule in story.css), so a landscape phone keeps the whole landscape scene.
  const CHAT_PORTRAIT_MEDIA = '(orientation: portrait) and (max-width: 1024px)';
  const ICON_TICKS = '<svg width="16" height="11" viewBox="0 0 16 11" aria-hidden="true"><path d="M11.07.65 4.9 8.3 2.33 5.9l-.98 1.05 3.7 3.45L12.2 1.55zM15.07.65 8.9 8.3l-.9-.84-.95 1.07 1.98 1.85L16.2 1.55z" fill="currentColor"/></svg>';
  const ICON_DOWN = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const rAF = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb) => setTimeout(cb, 16);
  const cAF = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : (id) => clearTimeout(id);

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  // ---- Pure helpers for validation, timing and clock ----
  function clampTail(storyTailMs) {
    if (storyTailMs == null || typeof storyTailMs !== 'number') return 600;
    return Math.min(2000, Math.max(300, Math.round(storyTailMs)));
  }

  function validateFrame(frame, storyTailMs) {
    let hasAudio = false;
    let hasCaptions = false;
    let validatedAudio = null;
    let validatedCaptions = null;

    if (frame && frame.audio && typeof frame.audio === 'object') {
      const a = frame.audio;
      const srcValid = typeof a.src === 'string' && a.src.trim().length > 0 && /\.m4a(\?.*)?$/i.test(a.src);
      const durValid = typeof a.duration_ms === 'number' && Number.isInteger(a.duration_ms) && a.duration_ms > 0;
      if (srcValid && durValid) {
        hasAudio = true;
        validatedAudio = {
          src: a.src,
          duration_ms: a.duration_ms,
          voice: a.voice
        };
      } else {
        console.warn('[PowStory] Invalid audio in frame:', frame.title || frame, { srcValid, durValid });
      }
    }

    if (hasAudio && Array.isArray(frame.captions) && frame.captions.length > 0) {
      let cuesValid = true;
      const maxEnd = validatedAudio.duration_ms + 250;
      for (let i = 0; i < frame.captions.length; i++) {
        const cue = frame.captions[i];
        if (!cue || typeof cue !== 'object') { cuesValid = false; break; }
        if (typeof cue.start_ms !== 'number' || typeof cue.end_ms !== 'number') { cuesValid = false; break; }
        if (cue.start_ms < 0 || cue.start_ms >= cue.end_ms || cue.end_ms > maxEnd) { cuesValid = false; break; }
        if (i > 0 && cue.start_ms < frame.captions[i - 1].end_ms) { cuesValid = false; break; }
        if (typeof cue.text !== 'string' || cue.text.trim().length === 0) { cuesValid = false; break; }
        if (/<[^>]+>/.test(cue.text)) { cuesValid = false; break; }
      }
      if (cuesValid) {
        hasCaptions = true;
        validatedCaptions = frame.captions.map((c) => ({
          start_ms: c.start_ms,
          end_ms: c.end_ms,
          text: c.text
        }));
      } else {
        console.warn('[PowStory] Invalid captions in frame:', frame.title || frame);
      }
    } else if (!hasAudio && frame && frame.captions) {
      console.warn('[PowStory] Captions ignored because frame has no valid audio');
    }

    return {
      hasAudio,
      hasCaptions,
      audio: validatedAudio,
      captions: validatedCaptions
    };
  }

  function effectiveDuration(frame, storyTailMs, defaultInterval, actualMediaDurationMs) {
    const tail_ms = clampTail(storyTailMs);
    const v = (frame && frame._validated) || validateFrame(frame, storyTailMs);
    let narration_ms = 0;
    if (v.hasAudio) {
      narration_ms = v.audio.duration_ms;
      if (typeof actualMediaDurationMs === 'number' && actualMediaDurationMs > narration_ms) {
        narration_ms = Math.round(actualMediaDurationMs);
      }
    }
    const configured_ms = (frame && typeof frame.duration === 'number' && frame.duration > 0)
      ? frame.duration
      : (defaultInterval || 5000);
    const frame_ms = Math.max(5000, configured_ms, narration_ms > 0 ? narration_ms + tail_ms : 0);
    return { narration_ms, frame_ms, tail_ms };
  }

  function cueAt(captions, pos_ms) {
    if (!captions || !captions.length) return null;
    if (pos_ms < captions[0].start_ms) return null;
    for (let i = 0; i < captions.length; i++) {
      const nextStart = i + 1 < captions.length ? captions[i + 1].start_ms : Infinity;
      if (pos_ms >= captions[i].start_ms && pos_ms < nextStart) {
        return captions[i];
      }
    }
    return captions[captions.length - 1];
  }

  // ---- Chat stories (kind: chat): one fixed scene, native chat bubbles over the drawn phone body ----
  // A phase (frame) opens with its short narration, then its messages play out with reading time.
  // Message times (at_ms) count from the phase "lead": narration + gap when narrated, else a short pause,
  // so a silent viewer never waits through an empty narration slot.
  function chatLead(frame, narrated, narration_ms, chatCfg) {
    const cfg = chatCfg || {};
    const silent = typeof cfg.lead_ms === 'number' ? cfg.lead_ms : 700;
    const gap = typeof cfg.gap_ms === 'number' ? cfg.gap_ms : 500;
    return narrated && narration_ms > 0 ? Math.round(narration_ms) + gap : silent;
  }

  function chatFrameMs(frame, lead_ms, narration_ms, narrated, tail_ms) {
    const msgs = (frame && frame.messages) || [];
    const lastAt = msgs.reduce((m, x) => Math.max(m, x.at_ms || 0), 0);
    const chat_ms = typeof frame.chat_ms === 'number' ? Math.max(frame.chat_ms, lastAt) : lastAt + 3000;
    return Math.max(lead_ms + chat_ms, narrated && narration_ms > 0 ? narration_ms + tail_ms : 0);
  }

  // Which messages are on screen at `pos_ms` of phase `idx`: earlier phases complete, later phases hidden.
  // An agent message may show a typing bubble for typing_ms before it. The scene is the one named by the
  // latest visible message carrying `scene` (else the first scene).
  function chatStateAt(frames, idx, pos_ms, lead_ms) {
    const messages = [];
    let scene = null;
    let phaseScene = null;
    frames.forEach((f, p) => (f.messages || []).forEach((m, k) => {
      let state = 'hidden';
      if (p < idx) state = 'shown';
      else if (p === idx) {
        const at = lead_ms + (m.at_ms || 0);
        if (pos_ms >= at) state = 'shown';
        else if (m.typing_ms > 0 && pos_ms >= at - m.typing_ms) state = 'typing';
      }
      if (state === 'shown' && m.scene) {
        scene = m.scene;
        if (p === idx) phaseScene = m.scene;
      }
      messages.push({ phase: p, index: k, state });
    }));
    return { messages, scene, phaseScene };
  }

  // Phone-body boxes are percentages of each scene image; they become CSS variables on the player,
  // and story.css positions the chat inside a scene box with the image's exact aspect ratio.
  function chatGeometryVars(geometry) {
    const vars = {};
    [['landscape', 'l'], ['portrait', 'p']].forEach(([key, s]) => {
      const g = geometry && geometry[key];
      if (!g || !g.body) return;
      if (typeof g.aspect === 'number' && g.aspect > 0) vars[`--chat-ar-${s}`] = String(g.aspect);
      ['x', 'y', 'w', 'h'].forEach((k) => {
        if (typeof g.body[k] === 'number') vars[`--chat-${k}-${s}`] = g.body[k] + '%';
      });
    });
    if (!vars['--chat-ar-p'] && vars['--chat-ar-l']) {
      ['ar', 'x', 'y', 'w', 'h'].forEach((k) => { vars[`--chat-${k}-p`] = vars[`--chat-${k}-l`]; });
    }
    return vars;
  }

  function createClock(options = {}) {
    const getNow = options.now || (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
    let pos_ms = 0;
    let frame_ms = options.frame_ms || 5000;
    let narration_ms = options.narration_ms || 0;
    let clockSource = 'wall';
    let wallBase = 0;
    let wallStart = null;
    let running = false;
    let audio = options.audio || null;

    function getPos() {
      if (clockSource === 'media' && audio && !audio.paused) {
        const cur = (audio.currentTime || 0) * 1000;
        pos_ms = Math.min(narration_ms, cur);
        return pos_ms;
      }
      if (running && wallStart != null) {
        pos_ms = wallBase + (getNow() - wallStart);
        return pos_ms;
      }
      return pos_ms;
    }

    function setFrame(newFrameMs, newNarrationMs, useMedia) {
      frame_ms = newFrameMs;
      narration_ms = newNarrationMs;
      pos_ms = 0;
      wallBase = 0;
      wallStart = null;
      clockSource = useMedia ? 'media' : 'wall';
    }

    function updateFrameDuration(newFrameMs, newNarrationMs) {
      frame_ms = newFrameMs;
      narration_ms = newNarrationMs;
    }

    function start() {
      running = true;
      if (clockSource === 'media') {
        wallStart = null;
        if (audio) {
          audio.currentTime = pos_ms / 1000;
          const p = audio.play();
          if (p && p.catch) p.catch(() => {});
        }
      } else {
        wallStart = getNow();
      }
    }

    function pause() {
      getPos();
      wallBase = pos_ms;
      wallStart = null;
      running = false;
      if (audio) audio.pause();
    }

    function seek(newPos) {
      pos_ms = Math.max(0, Math.min(frame_ms, newPos));
      wallBase = pos_ms;
      if (clockSource === 'wall' && running) {
        wallStart = getNow();
      }
      if (clockSource === 'media' && audio) {
        audio.currentTime = pos_ms / 1000;
      }
    }

    function switchSource(newSource) {
      getPos();
      clockSource = newSource;
      wallBase = pos_ms;
      if (newSource === 'media') {
        wallStart = null;
        if (running && audio) {
          audio.currentTime = pos_ms / 1000;
          const p = audio.play();
          if (p && p.catch) p.catch(() => {});
        }
      } else {
        if (audio) audio.pause();
        if (running) {
          wallStart = getNow();
        }
      }
    }

    function onAudioEnded() {
      getPos();
      clockSource = 'wall';
      wallBase = narration_ms;
      pos_ms = narration_ms;
      wallStart = running ? getNow() : null;
    }

    function onAudioError() {
      getPos();
      clockSource = 'wall';
      wallBase = pos_ms;
      wallStart = running ? getNow() : null;
    }

    return {
      getPos,
      setFrame,
      updateFrameDuration,
      start,
      pause,
      seek,
      switchSource,
      onAudioEnded,
      onAudioError,
      getSource: () => clockSource,
      isRunning: () => running,
      setAudio: (a) => { audio = a; }
    };
  }

  // ---- Main init per story container ----
  function init(root) {
    if (root.story) return;

    const scriptEl = root.querySelector('script.story-data');
    if (!scriptEl) return;
    const data = JSON.parse(scriptEl.textContent);
    const { frames, chapters, labels } = data;
    const interval = data.interval || 5000;
    // Optional chapter break (story-level, opt-in): a short pause with the chapter label, and an optional picture,
    // when the story enters the after chapter. Stories without it behave as before.
    const chapterBreak = data.chapter_break && typeof data.chapter_break === 'object' ? data.chapter_break : null;
    const chapterBreakMs = (chapterBreak && Number.isFinite(chapterBreak.ms)) ? Math.min(5000, Math.max(1500, chapterBreak.ms)) : 0;
    const total = frames.length;
    const player = root.classList.contains('story--player');
    const rtl = (typeof getComputedStyle === 'function' && getComputedStyle(root).direction === 'rtl') || root.dir === 'rtl';
    const isReduced = () => reducedMQ.matches;
    const chapterOf = (id) => chapters.find((c) => c.id === id) || chapters[0] || { id: '', label: '', mood: 'before' };
    const afterId = chapters[chapters.length - 1].id;
    const intoAfter = (from, to) => to > from && frames[to].chapter === afterId && frames[from].chapter !== afterId;
    // kind: chat = every frame is a chat phase over one fixed scene (no slides, no tiles).
    // kind: mixed (opt-in) = normal picture frames, plus frames with `phase: chat` that show the chat scene
    // (contained, unzoomed, native messages) instead of a picture and caption. The chat is cumulative across
    // the chat phases; normal frames never carry messages.
    const hasChatCfg = Boolean(data.chat && Array.isArray(data.chat.scenes) && data.chat.scenes.length);
    const mixed = data.kind === 'mixed' && hasChatCfg;
    const chat = (data.kind === 'chat' || mixed) && hasChatCfg ? data.chat : null;
    const chatOnly = Boolean(chat && !mixed);
    const isChat = (n) => Boolean(chat && (chatOnly || (frames[n] && frames[n].phase === 'chat')));
    const sceneOf = (id) => (chat && chat.scenes.find((s) => s.id === id)) || (chat && chat.scenes[0]) || null;
    if (chatOnly) root.classList.add('story--chat');
    if (mixed) root.classList.add('story--mixed');

    const storyTailMs = clampTail(data.audio_tail_ms);
    const validatedFrames = frames.map((f) => {
      const v = validateFrame(f, storyTailMs);
      f._validated = v;
      return v;
    });

    const hasAnyAudio = validatedFrames.some((v) => v.hasAudio);
    const hasSoundLabels = Boolean(labels && labels.sound_on && labels.sound_off);
    const soundEnabled = Boolean(player && hasAnyAudio && hasSoundLabels);

    if (hasAnyAudio && !hasSoundLabels) {
      console.warn('[PowStory] Audio present in frames but labels.sound_on or labels.sound_off is missing; sound UI disabled.');
    }

    let idx = 0;
    let playing = false;
    let sound = false;
    let inView = false;
    let busy = false;
    let ended = false;
    let scrollTarget = null;
    let stallTimer = null;
    let stallBase = 0;
    let audioToken = 0;
    let rafId = null;

    const failedAudio = {};
    const actualDurations = {};

    let audioEl = null;
    // Media events belong to whichever frame owns the element's current src, not to idx.
    function frameOfAudioSrc() {
      const src = audioEl && audioEl.getAttribute('src');
      if (!src) return -1;
      if (validatedFrames[idx] && validatedFrames[idx].hasAudio && validatedFrames[idx].audio.src === src) return idx;
      return validatedFrames.findIndex((v) => v.hasAudio && v.audio.src === src);
    }
    function getAudio() {
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.preload = 'none';
        audioEl.setAttribute('aria-hidden', 'true');
        audioEl.addEventListener('ended', handleAudioEnded);
        audioEl.addEventListener('error', handleAudioError);
        audioEl.addEventListener('timeupdate', handleAudioTimeUpdate);
        audioEl.addEventListener('waiting', () => { if (frameOfAudioSrc() === idx) setSoundStatus(); });
        audioEl.addEventListener('playing', () => { if (frameOfAudioSrc() === idx) setSoundStatus(); });
        audioEl.addEventListener('loadedmetadata', () => {
          const owner = frameOfAudioSrc();
          if (owner >= 0 && audioEl.duration && Number.isFinite(audioEl.duration)) {
            const actualMs = Math.round(audioEl.duration * 1000);
            actualDurations[owner] = actualMs;
            if (owner === idx) {
              // A longer real file moves a chat phase's first message, if it has not appeared yet.
              if (isChat(idx) && leadFor === idx && clock.getPos() < leadMs) lockLead(idx, frameAudioUsable(idx));
              const eff = frameEff(idx);
              clock.updateFrameDuration(eff.frame_ms, eff.narration_ms);
            }
          }
        });
        stage.append(audioEl);
      }
      return audioEl;
    }

    const clock = createClock({
      now: () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
    });

    // ---- stage: horizontal track of slides ----
    const stage = el('div', 'story-stage');
    const track = el('div', 'story-track');
    // A mixed story's chat phase has no picture of its own: its slide carries the phase scene, whole (contain),
    // so a swipe into or out of the phase shows the scene; the chat itself lives in the overlay above the track.
    const frameImage = (f) => {
      if (!(mixed && f.phase === 'chat')) return f.image;
      const s = sceneOf(f.scene);
      return s ? s.image : f.image;
    };
    const imgs = chatOnly ? [] : frames.map((f, i) => {
      const slide = el('div', 'story-slide');
      const img = el('img', 'story-img');
      const chatPhase = isChat(i);
      const s = chatPhase ? sceneOf(f.scene) : null;
      const image = chatPhase ? s.image : f.image;
      const imagePortrait = chatPhase ? s.image_portrait : f.image_portrait;
      img.alt = chatPhase ? '' : (f.alt || '');
      img.dataset.mood = chapterOf(f.chapter).mood;
      img.decoding = 'async';
      img.draggable = false;
      if (player && i > 0) img.loading = 'lazy';
      img.src = image;
      if (chatPhase) {
        slide.classList.add('is-chat-phase');
        img.dataset.phase = 'chat';
        img.setAttribute('aria-hidden', 'true');
      }
      if (f.focus) img.style.setProperty('--focus', f.focus);
      const portraitFocus = f.focus_portrait || (imagePortrait ? 'center' : null);
      if (portraitFocus) img.style.setProperty('--focus-portrait', portraitFocus);
      if (imagePortrait) {
        const pic = el('picture');
        const src = el('source');
        src.media = chatPhase ? CHAT_PORTRAIT_MEDIA : PORTRAIT_MEDIA;
        src.srcset = imagePortrait;
        pic.append(src, img);
        slide.append(pic);
      } else {
        slide.append(img);
      }
      track.append(slide);
      return img;
    });
    // ---- chat scene: one fixed picture (no Ken Burns, no slides) with the chat mapped onto its phone ----
    const sceneImgs = [];
    const chatNodes = [];
    let chatBody = null;
    let chatLatest = null;
    let chatStick = true;
    let leadMs = null;
    let leadFor = -1;
    const chatScene = chat ? buildChatScene() : null;

    function scenePicture(s, cls, alt, eager) {
      const img = el('img', cls);
      img.alt = alt;
      img.decoding = 'async';
      img.draggable = false;
      if (player && !eager) img.loading = 'lazy';
      img.src = s.image;
      if (!s.image_portrait) return { node: img, img };
      const pic = el('picture');
      const src = el('source');
      src.media = CHAT_PORTRAIT_MEDIA;
      src.srcset = s.image_portrait;
      pic.append(src, img);
      return { node: pic, img };
    }

    function buildChatScene() {
      const vars = chatGeometryVars(chat.geometry);
      Object.keys(vars).forEach((k) => root.style.setProperty(k, vars[k]));
      const wrap = el('div', 'story-scene-wrap');
      // Blurred copy of the first scene fills any letterbox band (the scene is never cropped).
      const back = scenePicture(chat.scenes[0], 'story-scene-backdrop', '', false);
      back.img.setAttribute('aria-hidden', 'true');
      const scene = el('div', 'story-scene');
      chat.scenes.forEach((s, i) => {
        const p = scenePicture(s, 'story-scene-img', s.alt || '', i === 0);
        p.img.dataset.scene = s.id;
        if (i === 0) p.img.classList.add('is-base');
        sceneImgs.push(p.img);
        scene.append(p.node);
      });

      const box = el('div', 'story-chat');
      box.dir = 'rtl';
      chatBody = el('div', 'story-chat-body');
      chatBody.setAttribute('role', 'log');
      chatBody.setAttribute('tabindex', '0');
      if (labels.chat) chatBody.setAttribute('aria-label', labels.chat);
      const who = chat.participants || {};
      let prevFrom = null;
      frames.forEach((f, p) => (f.messages || []).forEach((m, k) => {
        const node = { phase: p, index: k, bubble: null, typing: null };
        if (m.typing_ms > 0) {
          const t = el('div', `story-chat-typing is-${m.from}`, '<span></span><span></span><span></span>');
          const sr = el('span', 'story-sr');
          sr.textContent = labels.typing || '';
          t.append(sr);
          t.hidden = true;
          chatBody.append(t);
          node.typing = t;
        }
        const b = el('div', `story-chat-msg is-${m.from}`);
        if (m.from !== prevFrom) b.classList.add('is-first');
        prevFrom = m.from;
        if (who[m.from] && who[m.from].name) {
          const name = el('span', 'story-sr');
          name.textContent = who[m.from].name + ': ';
          b.append(name);
        }
        const text = el('span', 'story-chat-text');
        text.textContent = m.text;
        b.append(text);
        if (m.from === 'customer') b.append(el('span', 'story-chat-ticks', ICON_TICKS));
        b.hidden = true;
        chatBody.append(b);
        node.bubble = b;
        chatNodes.push(node);
      }));
      chatBody.addEventListener('scroll', () => {
        const gap = (chatBody.scrollHeight || 0) - (chatBody.scrollTop || 0) - (chatBody.clientHeight || 0);
        chatStick = gap < 24;
        if (chatStick && chatLatest) chatLatest.hidden = true;
      }, { passive: true });
      chatLatest = el('button', 'story-chat-latest', ICON_DOWN);
      chatLatest.type = 'button';
      if (labels.chat_latest) chatLatest.setAttribute('aria-label', labels.chat_latest);
      chatLatest.hidden = true;
      chatLatest.addEventListener('click', (e) => {
        e.stopPropagation();
        chatStick = true;
        chatToEnd();
      });
      box.append(chatBody, chatLatest);
      scene.append(box);
      wrap.append(back.node, scene);
      return wrap;
    }

    function chatToEnd() {
      if (!chatBody) return;
      chatBody.scrollTop = chatBody.scrollHeight || 0;
      if (chatLatest) chatLatest.hidden = true;
    }

    // Phase lead is fixed when a phase (re)starts, so toggling sound later never reshuffles messages,
    // except before the first message, where turning narration on/off moves the start accordingly.
    function narrationMsFor(n) {
      const v = validatedFrames[n];
      if (!v || !v.hasAudio) return 0;
      return Math.max(v.audio.duration_ms, actualDurations[n] || 0);
    }
    function frameAudioUsable(n) {
      const v = validatedFrames[n];
      return Boolean(sound && v && v.hasAudio && !failedAudio[n]);
    }
    function lockLead(n, narrated) {
      leadFor = n;
      leadMs = chatLead(frames[n], narrated, narrationMsFor(n), chat);
    }

    function applyChat(pos) {
      if (!chat) return;
      // Mixed story: the chat overlay is shown only during a chat phase; a picture frame hides it, while the
      // messages keep their cumulative state (earlier phases shown, later ones hidden) for going back.
      const chatPhase = isChat(idx);
      if (mixed) {
        root.classList.toggle('is-chat-phase', chatPhase);
        chatScene.setAttribute('aria-hidden', chatPhase ? 'false' : 'true');
      }
      if (leadFor !== idx) lockLead(idx, frameAudioUsable(idx));
      const st = chatStateAt(frames, idx, chatPhase ? pos : 0, leadMs);
      let changed = false;
      let added = false;
      st.messages.forEach((m, i) => {
        const node = chatNodes[i];
        const show = m.state === 'shown';
        if (node.bubble.hidden === show) {
          node.bubble.hidden = !show;
          changed = true;
          if (show) added = true;
        }
        if (node.typing) {
          const typing = m.state === 'typing';
          if (node.typing.hidden === typing) {
            node.typing.hidden = !typing;
            changed = true;
            if (typing) added = true;
          }
        }
      });
      // A message's `scene` in the current phase wins; else the phase's own `scene` (mixed stories);
      // else the latest scene change so far; else the first scene.
      const sceneId = st.phaseScene || frames[idx].scene || st.scene || chat.scenes[0].id;
      sceneImgs.forEach((img) => {
        const on = img.dataset.scene === sceneId;
        img.classList.toggle('is-on', on);
        img.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      root.dataset.scene = sceneId;
      if (changed) {
        if (chatStick) chatToEnd();
        else if (added && chatLatest) chatLatest.hidden = false;
      }
    }

    // Duration of frame n; for a chat phase, its lead plus the messages' reading time.
    function frameEff(n) {
      const eff = effectiveDuration(frames[n], storyTailMs, interval, actualDurations[n]);
      if (!isChat(n)) return eff;
      const narrated = frameAudioUsable(n);
      const lead = n === leadFor && leadMs != null ? leadMs : chatLead(frames[n], narrated, narrationMsFor(n), chat);
      const frame_ms = chatFrameMs(frames[n], lead, eff.narration_ms, narrated, eff.tail_ms);
      return { narration_ms: eff.narration_ms, frame_ms, tail_ms: eff.tail_ms, lead_ms: lead };
    }

    const preload = () => imgs.concat(sceneImgs).forEach((img) => { img.loading = 'eager'; });
    const flash = el('div', 'story-flash');
    const canvas = el('canvas', 'story-fx');
    canvas.setAttribute('aria-hidden', 'true');
    // Chapter break: a picture and the chapter label for a few seconds, with the timeline held (no frame time runs).
    const chapterCard = el('div', 'story-chapter-card');
    chapterCard.setAttribute('aria-hidden', 'true');
    const chapterArt = el('img', 'story-chapter-art');
    chapterArt.alt = '';
    const chapterLabel = el('p', 'story-chapter-label');
    chapterCard.append(chapterArt, chapterLabel);
    let breakTimer = null;
    function startBreak(n) {
      const portrait = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
      const src = chapterBreak && (portrait && chapterBreak.image_portrait || chapterBreak.image) || '';
      chapterArt.hidden = !src;
      if (src) chapterArt.src = src;
      chapterCard.classList.toggle('has-art', Boolean(src));
      chapterLabel.textContent = (chapterBreak && chapterBreak.label) || chapterOf(frames[n].chapter).label;
      chapterCard.classList.add('is-on');
      busy = true;
      clearTimeout(breakTimer);
      breakTimer = setTimeout(() => {
        breakTimer = null;
        chapterCard.classList.remove('is-on');
        busy = false;
        schedule();
      }, chapterBreakMs);
    }
    if (mixed) stage.append(track, chatScene, flash, chapterCard, canvas);
    else stage.append(chatOnly ? chatScene : track, flash, chapterCard, canvas);

    // ---- progress bars (player) ----
    const bars = [];
    if (player) {
      const barsNav = el('div', 'story-bars');
      frames.forEach((f, i) => {
        const b = el('button', 'story-bar', '<span class="story-bar-fill"></span>');
        b.type = 'button';
        b.setAttribute('aria-label', `${i + 1} ${labels.of} ${total}: ${f.title}`);
        if (i > 0 && frames[i - 1].chapter !== f.chapter) b.classList.add('is-chapter-start');
        b.addEventListener('click', (e) => { e.stopPropagation(); go(i); });
        bars[i] = b;
        barsNav.append(b);
      });
      stage.append(barsNav);
    }

    // ---- tiles ----
    const tilesNav = el('nav', 'story-tiles');
    tilesNav.setAttribute('aria-label', labels.progress);
    const tiles = [];
    // A chat story has one fixed scene, so picture tiles would all look alike: bars only.
    if (!chatOnly) chapters.forEach((ch) => {
      const group = el('div', 'story-tile-group');
      group.dataset.mood = ch.mood;
      group.append(el('span', 'story-tile-label', (ch.mood === 'after' ? STAR : '') + ch.label));
      const list = frames.map((f, i) => ({ f, i })).filter((x) => x.f.chapter === ch.id);
      list.forEach(({ f, i }, k) => {
        const t = el('button', 'story-tile', `<span class="story-tile-num">${i + 1}</span><span class="story-tile-fill"></span>`);
        t.type = 'button';
        t.style.backgroundImage = `url("${frameImage(f)}")`;
        if (f.focus) t.style.backgroundPosition = f.focus;
        t.setAttribute('aria-label', `${ch.label}, ${k + 1} ${labels.of} ${list.length}: ${f.title}`);
        t.addEventListener('click', () => go(i));
        tiles[i] = t;
        group.append(t);
      });
      tilesNav.append(group);
    });

    // ---- caption ----
    const caption = el('div', 'story-caption');
    caption.setAttribute('aria-live', 'polite');
    // Chat stories: the messages are the only visible text; the phase narration stays for screen readers.
    if (chatOnly) caption.classList.add('story-sr');
    const inner = el('div', 'story-caption-inner');
    caption.append(inner);

    // ---- controls ----
    const controls = el('div', 'story-controls');
    const btnPlay = el('button', 'story-play');
    btnPlay.type = 'button';
    const count = el('span', 'story-count');

    let btnSound = null;
    if (soundEnabled) {
      btnSound = el('button', 'story-sound');
      btnSound.type = 'button';
      btnSound.setAttribute('aria-pressed', 'false');
      btnSound.setAttribute('aria-label', labels.sound_on);
      btnSound.title = labels.sound_on;
      btnSound.innerHTML = ICON_SOUND_OFF + `<span class="story-sound-label">${labels.sound_on}</span>`;
      btnSound.addEventListener('click', (e) => {
        e.stopPropagation();
        // An explicit choice inside the player wins over the poster default for the rest of the page life.
        root.dataset.soundChoice = sound ? 'off' : 'on';
        setSound(!sound);
      });
      controls.append(btnPlay, btnSound, count);
    } else {
      controls.append(btnPlay, count);
    }

    // ---- end card ----
    const end = el('div', 'story-end');
    if (player && data.end) {
      end.innerHTML =
        `<div class="story-end-inner"><h3>${data.end.title}</h3><p>${data.end.text}</p>` +
        `<div class="story-end-actions"><a class="story-end-cta" href="${root.dataset.ctaUrl || '#'}" data-track-location="scenario-story-end">${data.end.cta}</a>` +
        `<button type="button" class="story-end-replay">${labels.replay}</button></div></div>`;
      const replayBtn = end.querySelector('.story-end-replay');
      if (replayBtn) replayBtn.addEventListener('click', (e) => { e.stopPropagation(); restart(); });
      const ctaBtn = end.querySelector('.story-end-cta');
      if (ctaBtn) ctaBtn.addEventListener('click', (e) => e.stopPropagation());
    }

    if (player) {
      stage.append(caption, controls, end);
      if (chatOnly) root.append(stage);
      else root.append(stage, tilesNav);
    } else {
      root.append(caption, tilesNav, stage, controls);
    }

    // ---- Mode helper ----
    function isNarratedMode(n) {
      if (!sound) return false;
      if (isChat(n)) return frameAudioUsable(n);
      const v = validatedFrames[n];
      return Boolean(v && v.hasAudio && !failedAudio[n] && v.hasCaptions);
    }

    // ---- Audio stall & failure handling ----
    function clearStallTimer() {
      audioToken++;
      if (stallTimer) {
        clearTimeout(stallTimer);
        stallTimer = null;
      }
    }

    function failAudioForFrame(i) {
      failedAudio[i] = true;
      clearStallTimer();
      if (i === idx) {
        const curPos = clock.getPos();
        clock.switchSource('wall');
        if (audioEl) audioEl.pause();
        updateCaptionForCurrentPos(curPos);
      }
      setSoundStatus();
    }

    // Visible sound state, so a silent player never looks as if it were narrating:
    // off -> crossed speaker + "turn narration on" text; on -> speaker; loading -> pulse
    // (sound on, waiting for the first real progress); failed -> crossed speaker + optional label.
    function soundStatus() {
      if (!sound) return 'off';
      const v = validatedFrames[idx];
      if (!v || !v.hasAudio) return 'on';
      if (failedAudio[idx]) return 'failed';
      if (stallTimer && canPlay() && clock.getSource() === 'media') return 'loading';
      return 'on';
    }

    function setSoundStatus() {
      if (!btnSound) return;
      const st = soundStatus();
      ['off', 'on', 'loading', 'failed'].forEach((k) => btnSound.classList.toggle('is-' + k, k === st));
      root.dataset.sound = st;
      const action = sound ? labels.sound_off : labels.sound_on;
      const text = st === 'off' ? labels.sound_on : (st === 'failed' && labels.sound_failed ? labels.sound_failed : '');
      btnSound.setAttribute('aria-pressed', sound ? 'true' : 'false');
      btnSound.setAttribute('aria-label', st === 'failed' && text ? `${text}. ${action}` : action);
      btnSound.title = action;
      btnSound.innerHTML = (st === 'off' || st === 'failed' ? ICON_SOUND_OFF : ICON_SOUND_ON) +
        (text ? `<span class="story-sound-label">${text}</span>` : '');
    }

    function handleAudioEnded() {
      if (frameOfAudioSrc() !== idx) return;
      clearStallTimer();
      clock.onAudioEnded();
    }

    function handleAudioError(e) {
      const owner = frameOfAudioSrc();
      console.warn('[PowStory] Audio error on frame', owner, e);
      if (owner >= 0) failAudioForFrame(owner);
    }

    // Only real forward progress clears the watchdog: a seek to a nonzero
    // resume position also fires timeupdate without any playback.
    function handleAudioTimeUpdate() {
      if (stallTimer && audioEl && audioEl.currentTime > stallBase) {
        clearTimeout(stallTimer);
        stallTimer = null;
        setSoundStatus();
      }
    }

    function playAudioForCurrentFrame(pos_ms) {
      const v = validatedFrames[idx];
      if (!v.hasAudio || failedAudio[idx]) return;
      const audio = getAudio();
      clock.setAudio(audio);
      clearStallTimer();

      const targetSrc = v.audio.src;
      if (audio.getAttribute('src') !== targetSrc) {
        audio.pause();
        audio.src = targetSrc;
        audio.currentTime = (pos_ms || 0) / 1000;
      } else {
        audio.currentTime = (pos_ms || 0) / 1000;
      }

      const startAudioPos = audio.currentTime;
      const frameAtStart = idx;
      const token = audioToken;
      stallBase = startAudioPos;
      stallTimer = setTimeout(() => {
        if (token !== audioToken || frameAtStart !== idx) return;
        if (audio.currentTime <= startAudioPos) {
          console.warn('[PowStory] Audio playback stalled for 4000ms on frame', frameAtStart);
          failAudioForFrame(frameAtStart);
        }
      }, 4000);

      const playPromise = audio.play();
      setSoundStatus();
      if (playPromise !== undefined && playPromise.catch) {
        playPromise.catch((err) => {
          // A play() superseded by pause/navigation/source change rejects with
          // AbortError; that is not a media failure of any frame.
          if (token !== audioToken || frameAtStart !== idx || (err && err.name === 'AbortError')) return;
          clearStallTimer();
          if (err && err.name === 'NotAllowedError') {
            console.warn('[PowStory] Audio play rejected by autoplay policy, turning sound off');
            setSound(false);
          } else {
            console.warn('[PowStory] Audio play failed:', err);
            failAudioForFrame(frameAtStart);
          }
        });
      }
    }

    // ---- Captions & UI rendering ----
    function renderCaption(n) {
      const f = frames[n];
      const ch = chapterOf(f.chapter);
      // A mixed story hides the caption visually during a chat phase (the messages are the only visible text)
      // and keeps the phase narration for screen readers; picture frames show it as usual.
      if (mixed) caption.classList.toggle('story-sr', isChat(n));
      if (isChat(n)) {
        inner.innerHTML = `<p class="story-text">${f.text}</p>`;
        return;
      }
      const narrated = isNarratedMode(n);
      const tagHtml = `<span class="story-tag">${ch.mood === 'after' ? STAR : ''}${ch.label}${f.time ? ' · ' + f.time : ''}</span>` +
        (f.human ? `<span class="story-human">${labels.human}</span>` : '') +
        `<h3 class="story-title">${f.title}</h3>`;

      if (narrated) {
        const cue = cueAt(f.captions, clock.getPos());
        const phrase = cue ? cue.text : '';
        inner.innerHTML = tagHtml +
          `<p class="story-text story-sr">${f.text}</p>` +
          `<p class="story-phrase" aria-hidden="true">${phrase}</p>`;
      } else {
        inner.innerHTML = tagHtml + `<p class="story-text">${f.text}</p>`;
      }
      inner.classList.remove('is-entering');
      void inner.offsetWidth;
      inner.classList.add('is-entering');
    }

    function updateCaptionForCurrentPos(pos) {
      if (isChat(idx)) {
        applyChat(pos);
        return;
      }
      const narrated = isNarratedMode(idx);
      const phraseEl = inner.querySelector('.story-phrase');
      const textEl = inner.querySelector('.story-text');

      if (narrated) {
        if (!phraseEl) {
          if (textEl) textEl.classList.add('story-sr');
          const p = el('p', 'story-phrase');
          p.setAttribute('aria-hidden', 'true');
          const cue = cueAt(frames[idx].captions, pos);
          p.textContent = cue ? cue.text : '';
          inner.append(p);
        } else {
          const cue = cueAt(frames[idx].captions, pos);
          const newText = cue ? cue.text : '';
          if (phraseEl.textContent !== newText) {
            phraseEl.textContent = newText;
          }
        }
      } else {
        if (phraseEl) phraseEl.remove();
        if (textEl) textEl.classList.remove('story-sr');
      }
    }

    function setProgressFill(container, ratio, frame_ms) {
      if (!container) return;
      const progress = Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 0;
      if (frame_ms != null) container.style.setProperty('--dur', frame_ms + 'ms');
      container.style.setProperty('--p', progress);
      const fill = container.querySelector('.story-tile-fill, .story-bar-fill') ||
        container.querySelector('.story-tile-fill') ||
        container.querySelector('.story-bar-fill');
      if (fill) {
        fill.style.setProperty('--p', progress);
        fill.style.inlineSize = (progress * 100).toFixed(2) + '%';
      }
    }

    function updateProgressBars(pos_ms, frame_ms) {
      const ratio = pos_ms / frame_ms;
      setProgressFill(tiles[idx], ratio, frame_ms);
      setProgressFill(bars[idx], ratio, frame_ms);
    }

    function render(n) {
      const f = frames[n];
      const ch = chapterOf(f.chapter);
      imgs.forEach((img, i) => {
        img.classList.toggle('is-active', i === n);
        img.setAttribute('aria-hidden', i === n ? 'false' : 'true');
        img.classList.remove('is-kenburns');
      });
      // No Ken Burns on a chat scene: the chat is pinned to the drawn phone and must not drift.
      if (!isChat(n) && !isReduced()) {
        void imgs[n].offsetWidth;
        imgs[n].classList.add('is-kenburns');
      }
      tiles.forEach((t, i) => {
        t.classList.toggle('is-active', i === n);
        t.classList.toggle('is-seen', i < n);
        t.setAttribute('aria-current', i === n ? 'step' : 'false');
        setProgressFill(t, i < n ? 1 : 0);
      });
      bars.forEach((b, i) => {
        b.classList.toggle('is-seen', i < n);
        b.classList.toggle('is-active', i === n);
        setProgressFill(b, i < n ? 1 : 0);
      });
      caption.dataset.mood = ch.mood;
      count.textContent = `${n + 1} / ${total}`;
      renderCaption(n);
      applyChat(clock.getPos());
    }

    function scrollToIndex(n, instant) {
      if (chatOnly) return;
      const left = (rtl ? -1 : 1) * n * track.clientWidth;
      if (Math.abs(track.scrollLeft - left) < 2) return;
      scrollTarget = n;
      track.scrollTo({ left, behavior: instant || isReduced() ? 'auto' : 'smooth' });
    }

    function wake(n) {
      // The first after-frame "wakes" from washed-out colour; for a chat phase that is the visible scene.
      const img = mixed && isChat(n) ? chatScene.querySelector('.story-scene') : imgs[n];
      if (!img) return;
      img.style.transition = 'none';
      img.style.filter = 'saturate(0.25) brightness(1.25)';
      void img.offsetWidth;
      img.style.transition = '';
      requestAnimationFrame(() => { img.style.filter = ''; });
    }

    function setEnded(on) {
      ended = on;
      end.classList.toggle('is-on', on);
      root.classList.toggle('is-ended', on);
      if (on) {
        stop();
        clock.pause();
        if (audioEl) audioEl.pause();
        bars.forEach((b) => {
          b.classList.add('is-seen');
          setProgressFill(b, 1);
        });
      }
    }

    function go(n) {
      n = (n + total) % total;
      if (busy) return;
      if (ended) setEnded(false);
      if (audioEl) audioEl.pause();
      clearStallTimer();

      if (n === idx) {
        schedule();
        return;
      }
      const from = idx;
      idx = n;
      stop();
      resetClockForFrame();

      if (intoAfter(from, n) && !isReduced()) {
        busy = true;
        runMagic(
          () => { scrollToIndex(n, true); wake(n); render(n); if (chapterBreakMs) startBreak(n); },
          () => { if (!breakTimer) { busy = false; schedule(); } }
        );
        return;
      }
      if (Math.abs(n - from) > 1 && !isReduced()) {
        stage.classList.add('is-fading');
        setTimeout(() => {
          scrollToIndex(n, true);
          render(n);
          stage.classList.remove('is-fading');
        }, 220);
      } else {
        scrollToIndex(n);
        render(n);
      }
      if (intoAfter(from, n) && chapterBreakMs) startBreak(n);
      else schedule();
    }

    const next =() => (idx === total - 1 ? (player ? setEnded(true) : go(0)) : go(idx + 1));
    const prev = () => { if (ended) setEnded(false); go(Math.max(0, idx - 1)); };

    // Paused clock at position 0 configured for the current frame, so captions and
    // progress never read the previous frame's position (e.g. during the magic transition).
    function resetClockForFrame() {
      clock.pause();
      if (isChat(idx)) lockLead(idx, frameAudioUsable(idx));
      const eff = frameEff(idx);
      clock.setFrame(eff.frame_ms, eff.narration_ms, false);
    }

    function restart() {
      setEnded(false);
      stop();
      if (audioEl) audioEl.pause();
      idx = 0;
      chatStick = true;
      resetClockForFrame();
      // restart() is only reached from a visible player (poster open / replay button);
      // the IntersectionObserver confirms asynchronously, but audio must start inside the gesture.
      if (player) inView = true;
      scrollToIndex(0, true);
      render(0);
      playing = true;
      root.classList.add('is-playing');
      btnPlay.innerHTML = ICON_PAUSE + `<span>${labels.pause}</span>`;
      btnPlay.setAttribute('aria-pressed', 'false');
      schedule();
    }

    // Touch / swipe settlement
    let settle = null;
    ['pointerdown', 'touchstart', 'wheel'].forEach((type) =>
      track.addEventListener(type, () => { scrollTarget = null; }, { passive: true }));
    track.addEventListener('scroll', () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        const n = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
        if (scrollTarget != null) {
          if (n === scrollTarget) scrollTarget = null;
          return;
        }
        if (n === idx || busy) return;
        const from = idx;
        idx = n;
        if (ended) setEnded(false);
        stop();
        if (audioEl) audioEl.pause();
        resetClockForFrame();
        render(n);
        if (intoAfter(from, n) && !isReduced()) {
          busy = true;
          runMagic(
            () => { wake(n); if (chapterBreakMs) startBreak(n); },
            () => { if (!breakTimer) { busy = false; schedule(); } }
          );
        } else if (intoAfter(from, n) && chapterBreakMs) {
          startBreak(n);
        } else {
          schedule();
        }
      }, 120);
    }, { passive: true });

    // Autoplay gating
    const canPlay = () => playing && inView && !(typeof document !== 'undefined' && document.hidden) && !busy && !ended;

    function stop() {
      if (rafId) {
        cAF(rafId);
        rafId = null;
      }
      clearStallTimer();
      tiles.forEach((t) => t.classList.remove('is-filling'));
      bars.forEach((b) => b.classList.remove('is-filling'));
    }

    function runTick() {
      if (rafId) cAF(rafId);
      function tick() {
        if (!canPlay()) {
          rafId = null;
          return;
        }
        const eff = frameEff(idx);
        const pos = clock.getPos();
        updateCaptionForCurrentPos(pos);
        updateProgressBars(pos, eff.frame_ms);

        if (pos >= eff.frame_ms) {
          rafId = null;
          next();
          return;
        }
        rafId = rAF(tick);
      }
      rafId = rAF(tick);
    }

    function schedule() {
      stop();
      const v = validatedFrames[idx];
      const audioUsable = Boolean(sound && v.hasAudio && !failedAudio[idx]);
      if (isChat(idx)) lockLead(idx, audioUsable);
      const eff = frameEff(idx);
      const frame_ms = eff.frame_ms;
      const narration_ms = eff.narration_ms;

      [tiles[idx], bars[idx]].forEach((t) => {
        if (!t) return;
        t.style.setProperty('--dur', frame_ms + 'ms');
        t.classList.add('is-filling');
      });

      clock.setFrame(frame_ms, narration_ms, audioUsable);
      applyChat(0);

      if (!canPlay()) {
        clock.pause();
        updateProgressBars(clock.getPos(), frame_ms);
        return;
      }

      clock.start();
      if (audioUsable) {
        playAudioForCurrentFrame(0);
      } else if (audioEl) {
        audioEl.pause();
      }

      runTick();
      setSoundStatus();
    }

    function sync() {
      if (canPlay()) {
        if (!clock.isRunning()) {
          clock.start();
          const eff = frameEff(idx);
          const v = validatedFrames[idx];
          if (sound && v.hasAudio && !failedAudio[idx] && clock.getPos() < eff.narration_ms) {
            playAudioForCurrentFrame(clock.getPos());
          }
          runTick();
        }
      } else {
        clock.pause();
        clearStallTimer();
        if (audioEl) audioEl.pause();
        const eff = frameEff(idx);
        updateProgressBars(clock.getPos(), eff.frame_ms);
      }
    }

    function setPlaying(p) {
      playing = Boolean(p);
      root.classList.toggle('is-playing', playing);
      btnPlay.innerHTML = (playing ? ICON_PAUSE : ICON_PLAY) + `<span>${playing ? labels.pause : labels.play}</span>`;
      btnPlay.setAttribute('aria-pressed', playing ? 'false' : 'true');

      if (canPlay()) {
        clock.start();
        const eff = frameEff(idx);
        const v = validatedFrames[idx];
        if (sound && v.hasAudio && !failedAudio[idx] && clock.getPos() < eff.narration_ms) {
          playAudioForCurrentFrame(clock.getPos());
        }
        runTick();
      } else {
        clock.pause();
        clearStallTimer();
        if (audioEl) audioEl.pause();
        const eff = frameEff(idx);
        updateProgressBars(clock.getPos(), eff.frame_ms);
      }
    }

    function setSound(on) {
      if (!soundEnabled) return;
      sound = Boolean(on);
      const v = validatedFrames[idx];
      const frameFailed = Boolean(failedAudio[idx]);
      const hasAudio = v && v.hasAudio && !frameFailed;
      const currentPos = clock.getPos();
      // Before a chat phase's first message, narration on/off moves that message accordingly.
      if (isChat(idx) && leadFor === idx && currentPos < leadMs) lockLead(idx, Boolean(sound && hasAudio));
      const eff = frameEff(idx);
      clock.updateFrameDuration(eff.frame_ms, eff.narration_ms);

      if (sound && hasAudio) {
        const audio = getAudio();
        clock.setAudio(audio);
        if (currentPos < eff.narration_ms) {
          clock.switchSource('media');
          if (canPlay()) {
            playAudioForCurrentFrame(currentPos);
          }
        } else {
          clock.switchSource('wall');
        }
      } else {
        clock.switchSource('wall');
        clearStallTimer();
        if (audioEl) audioEl.pause();
      }

      updateCaptionForCurrentPos(currentPos);
      updateProgressBars(currentPos, eff.frame_ms);
      setSoundStatus();
    }

    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver((entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      }, { threshold: 0.5 }).observe(stage);
    } else {
      inView = true;
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', sync);
    }
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(() => scrollToIndex(idx, true)).observe(track);
    }

    // Magic transition: light flash + sparkles
    function runMagic(onPeak, onDone) {
      const rect = stage.getBoundingClientRect ? stage.getBoundingClientRect() : { width: 800, height: 450 };
      const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext ? canvas.getContext('2d') : null;
      if (!ctx) {
        onPeak();
        onDone();
        return;
      }
      ctx.scale(dpr, dpr);
      const w = rect.width, h = rect.height, k = Math.max(Math.min(w, h * 1.6) / 800, 0.5);
      const parts = [];
      for (let i = 0; i < 160; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = (2 + Math.random() * 8) * k;
        parts.push({
          x: w * (0.4 + Math.random() * 0.2), y: h * (0.4 + Math.random() * 0.2),
          vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * k, g: 0.07 * k,
          s: (2 + Math.random() * 6) * k, c: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
          star: Math.random() < 0.6, life: 0, max: 60 + Math.random() * 60, tw: Math.random() * 6,
        });
      }
      for (let i = 0; i < 70; i++) {
        parts.push({
          x: Math.random() * w, y: -10 - Math.random() * h * 0.4, vx: (Math.random() - 0.5) * 0.6 * k, vy: (0.8 + Math.random() * 1.5) * k,
          g: 0.01 * k, s: (1.5 + Math.random() * 3.5) * k, c: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
          star: true, life: -20 - Math.random() * 30, max: 120 + Math.random() * 40, tw: Math.random() * 6,
        });
      }
      const star = (x, y, r) => {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const rr = i % 2 ? r * 0.32 : r;
          const a = (i * Math.PI) / 4;
          ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
      };
      flash.classList.remove('is-on');
      void flash.offsetWidth;
      flash.classList.add('is-on');
      setTimeout(onPeak, 380);

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        ctx.clearRect(0, 0, w, h);
        onDone();
      };
      setTimeout(finish, 2600);

      const tick = () => {
        if (finished) return;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        let alive = 0;
        for (const p of parts) {
          p.life++;
          if (p.life < 0) { alive++; continue; }
          if (p.life > p.max) continue;
          alive++;
          p.vx *= 0.985; p.vy = p.vy * 0.985 + p.g;
          p.x += p.vx; p.y += p.vy;
          ctx.globalAlpha = Math.max(0, 1 - p.life / p.max) * (0.6 + 0.4 * Math.sin(p.life * 0.3 + p.tw));
          ctx.fillStyle = p.c;
          ctx.shadowColor = p.c;
          ctx.shadowBlur = p.s * 2;
          if (p.star) star(p.x, p.y, p.s); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.5, 0, 7); ctx.fill(); }
        }
        if (alive) requestAnimationFrame(tick);
        else finish();
      };
      requestAnimationFrame(tick);
    }

    // Input handlers
    stage.addEventListener('click', (e) => {
      if (e.target.closest('button, a') || ended) return;
      // Inside the chat the viewer scrolls back and reads; a tap there must not skip ahead.
      if (chat && e.target.closest('.story-chat')) return;
      if (player) {
        const r = stage.getBoundingClientRect ? stage.getBoundingClientRect() : { left: 0, right: 800, width: 800 };
        const startEdge = rtl ? e.clientX > r.right - r.width * 0.25 : e.clientX < r.left + r.width * 0.25;
        if (startEdge) { prev(); return; }
      }
      next();
    });
    btnPlay.addEventListener('click', (e) => { e.stopPropagation(); setPlaying(!playing); });
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      ((e.key === 'ArrowLeft') === rtl ? next : prev)();
      e.preventDefault();
    });
    if (player) {
      let t0 = null;
      // A drag inside the chat scrolls it (back-reading); it must not close the player.
      stage.addEventListener('touchstart', (e) => {
        t0 = chat && e.target && e.target.closest && e.target.closest('.story-chat') ? null : e.touches[0];
      }, { passive: true });
      stage.addEventListener('touchend', (e) => {
        if (!t0) return;
        const t1 = e.changedTouches[0];
        const dy = t1.clientY - t0.clientY, sx = t1.clientX - t0.clientX, dx = Math.abs(sx);
        t0 = null;
        if (dy > 90 && dx < 60) root.dispatchEvent(new CustomEvent('story:close', { bubbles: true }));
        // A mixed story's chat overlay covers the track during a chat phase, so the native sideways scroll
        // cannot reach it; a sideways swipe there navigates like a swipe on a picture frame.
        else if (mixed && isChat(idx) && dx > 60 && Math.abs(dy) < 60 && !busy) {
          const forward = rtl ? sx > 0 : sx < 0;
          (forward ? next : prev)();
        }
      }, { passive: true });
    }

    function state() {
      const eff = frameEff(idx);
      return {
        idx,
        playing,
        sound,
        pos_ms: clock.getPos(),
        frame_ms: eff.frame_ms,
        mode: isNarratedMode(idx) ? 'narrated' : 'legacy',
        sound_status: soundEnabled ? soundStatus() : 'none',
        phase: isChat(idx) ? 'chat' : 'picture',
        chat: chat ? {
          lead_ms: leadMs,
          shown: chatNodes.filter((x) => !x.bubble.hidden).length,
          typing: chatNodes.filter((x) => x.typing && !x.typing.hidden).length,
          scene: root.dataset.scene
        } : null
      };
    }

    root.story = {
      go,
      setPlaying,
      restart,
      preload,
      pause: () => setPlaying(false),
      setSound,
      state
    };

    resetClockForFrame();
    render(0);
    setPlaying(player ? false : !isReduced());
    setSoundStatus();
  }

  // ---- Poster initialization ----
  function initPoster(poster) {
    const dialogId = poster.dataset.storyOpen;
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    const root = dialog.querySelector('[data-story]');
    const pics = [...poster.querySelectorAll('img')];
    let k = 0;
    let visible = false;
    if (pics.length > 1) {
      if (typeof IntersectionObserver === 'function') {
        new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(poster);
      }
      setInterval(() => {
        if (!visible || document.hidden || reducedMQ.matches || dialog.open) return;
        pics[k].classList.remove('is-on');
        k = (k + 1) % pics.length;
        pics[k].classList.add('is-on');
      }, 2600);
    }
    ['pointerenter', 'focus', 'touchstart'].forEach((type) =>
      poster.addEventListener(type, () => { if (root.story) root.story.preload(); }, { once: true, passive: true }));

    // Opens the player and starts it inside the click, so narration starts with the user gesture.
    // soundOn true/false is an explicit (remembered) choice; null uses the remembered choice,
    // else the poster default (data-story-sound="on" when the story is narrated).
    const open = (soundOn) => {
      if (!root.story) return;
      if (soundOn != null) root.dataset.soundChoice = soundOn ? 'on' : 'off';
      const choice = root.dataset.soundChoice;
      const want = choice ? choice === 'on' : poster.dataset.storySound === 'on';
      root.story.preload();
      dialog.showModal();
      root.story.setSound(want);
      root.story.restart();
    };
    poster.addEventListener('click', () => open(null));

    const parent = poster.parentElement;
    const find = (attr) => (parent && parent.querySelector(`[${attr}="${dialogId}"]`)) ||
      document.querySelector(`[${attr}="${dialogId}"]`);
    [['data-story-narrated', true], ['data-story-silent', false]].forEach(([attr, on]) => {
      const btn = find(attr);
      if (!btn) return;
      ['pointerenter', 'focus', 'touchstart'].forEach((type) =>
        btn.addEventListener(type, () => { if (root.story) root.story.preload(); }, { once: true, passive: true }));
      btn.addEventListener('click', () => open(on));
    });

    const closeBtn = dialog.querySelector('.story-close');
    if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());
    dialog.addEventListener('story:close', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (root.story) root.story.pause();
      poster.focus();
    });
  }

  if (typeof document !== 'undefined') {
    document.querySelectorAll('[data-story]').forEach(init);
    document.querySelectorAll('[data-story-open]').forEach(initPoster);
  }

  if (typeof window !== 'undefined') {
    window.PowStory = {
      _loaded: true,
      init,
      initPoster,
      _internals: {
        validateFrame,
        effectiveDuration,
        cueAt,
        createClock,
        clampTail,
        chatLead,
        chatFrameMs,
        chatStateAt,
        chatGeometryVars
      }
    };
  }
})();
