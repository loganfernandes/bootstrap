# The Dead System — Build Map

A phase-by-phase plan for building the game. Open this when you sit down, pick the topmost unchecked box, do that one thing, commit, close the laptop. That's a good night.

---

## How to use this

**One story per session.** Each box below is scoped to roughly one sitting. Some are shorter, a few will take two or three nights. Do not start a box until the one above it is checked, unless the dependency note says otherwise.

**The game must run at the end of every session.** If you're mid-refactor and it's broken, either finish it or `git stash` it. You never want to sit down and spend the first 40 minutes remembering what you broke.

**Commit every time something works.** Small commits with plain messages. This is your quicksave before the boss.

**Placeholder content until Phase 7.** Every file in the game world can say "lorem ipsum sysadmin note" until the machine works. Do not write real prose into a system that might get rewritten. The one exception is a handful of files you need to test with — three or four, not thirty.

---

## What "v1" means

Scope creep is what kills first projects, so here is the finish line, defined now, while you're calm:

**V1 is one act, playable start to finish, with real content, at least one working anomaly, one ending, and a public URL.**

That's it. Not four acts. Not every mechanic we designed. One act that a stranger can click into and come out of having felt something.

Everything else is v1.1+. Write the ideas down, don't build them.

### Explicit non-goals for v1

- No backend, no accounts, no server-side anything
- No sound (optional polish, very late, or never)
- No mobile support — desktop keyboard only, say so on the landing page
- No fully explorable second machine; remote paths are readable, not livable
- No multiple endings; one ending, done well
- No natural-language parser; verb plus one argument, terminal-style, forever
- No procedural or generated content; every word is hand-authored.

---

## Phase 0 — Foundation ✅

Done. Page, echo terminal, repo, remote. Skip.

- [x] Static page with input and output area
- [x] Enter key echoes typed text to the screen
- [x] Repo initialized, committed, synced to GitHub
- [x] GitHub Pages enabled, public URL confirmed working

That last one is worth doing tonight if you haven't. Deploying on day one means deploying is never scary later.

---

## Phase 1 — The shell responds

**Goal:** a terminal that understands structured commands and answers politely when it doesn't. No game world yet — this is the machine that will run the game world.

- [ ] **Parser.** Turn a raw input string into a structured command: a verb, plus zero or more arguments. Handle extra whitespace, empty input, and mixed case. This is its own module.
- [ ] **Dispatch.** A lookup that maps a verb to the function that handles it. Reach for a lookup structure rather than a growing if/else chain — you'll be adding a dozen commands, and the chain gets ugly fast.
- [ ] **Unknown command handling.** As a player, when I type something the shell doesn't know, I get a calm, helpful message that points me at `help`. Get the tone right here — this is your first accessibility surface. Terse Unix-style errors will lose a novice in the first two minutes.
- [ ] **`help`.** As a player, I can list available commands and get a one-line description of each. Consider a per-command form (`help ls`) — it's cheap now and it's the setup for the `help` → `me` scare much later.
- [ ] **Scrollback.** As a player, new output scrolls into view automatically and I can scroll back through history.
- [ ] **Command history.** As a player, I can press up and down to cycle through commands I've already typed. This is a small thing that makes the terminal feel real, and it costs an evening.
- [ ] **`clear`.** As a player, I can wipe the screen.

**Done when:** you can type several commands, get sensible responses, tab through your history, and nothing crashes on garbage input.

---

## Phase 2 — The filesystem

**Goal:** a navigable, readable file tree. This is the biggest phase and the heart of the game.

- [ ] **Content data shape.** Decide how a directory and a file are represented as data. At minimum a file needs: name, body text, and metadata (created, modified, author, hidden, locked). Directories need a name and their children. Write this down as a convention before you author anything, because changing it later means touching every file you've written.
- [ ] **Path resolution.** The real subsystem of this phase. Given a current location and a path string, resolve it to an actual node in the tree. Needs to handle: relative paths, absolute paths, `.` and `..`, trailing slashes, and paths that don't exist. Build it standalone and test it hard — every command below depends on it, so a bug here looks like a bug everywhere.
  - *Decision to make now:* forward slashes, Unix-style. You wrote backslashes in one of our conversations; pick forward and be consistent, since the fiction is a Linux kernel underneath.
- [ ] **`pwd`.** As a player, I can see where I am.
- [ ] **`ls`.** As a player, I can list what's in the current directory. Hidden entries excluded.
- [ ] **`cd`.** As a player, I can move between directories, including up.
- [ ] **`cat`.** As a player, I can read a file's contents to the screen.
- [ ] **`ls -a`.** As a player, I can reveal hidden entries. This teaches the rule that will later be violated by the directory that stays hidden even here.
- [ ] **`stat`.** As a player, I can inspect a file's metadata in a clean, readable layout. Build the friendly version — labeled fields, plain dates, a visible marker for "unchanged." This command is a tutorial tool now and a horror instrument later; the payoff depends entirely on how boringly trustworthy it looks in Phase 2.
- [ ] **`grep`.** As a player, I can search for text across files. Scope this tightly — searching the current directory is enough. Recursive search across the whole tree is a nice-to-have, not a requirement.

**Done when:** you can navigate a small placeholder tree, read files, inspect metadata, and search — and none of the commands blow up on bad paths.

---

## Phase 3 — State, locks, and saving

**Goal:** the game remembers things, and some doors are shut until they aren't.

- [ ] **State object.** Define the single object that represents a game in progress: current directory, flags (what's been read, seen, done), and credentials held. Everything the player has accomplished lives here. Keep it plain data — no functions, no DOM references — because it has to survive being turned into text and back.
- [ ] **Flags.** As the author, I can mark that something happened (a file was read, a directory was entered) and check for it later. This is the substrate for every gate and every anomaly trigger in the game.
- [ ] **Locked nodes.** As a player, when I try to enter or read something I don't have access to, I'm told so clearly. As the author, I can mark a directory or file as requiring a specific credential.
- [ ] **Credential use.** As a player, I can supply a password or key I've found and gain access. Decide the command and the fiction around it — this is the shell's own auth, not real Unix `su`, so it can work however the sysadmin "built" it.
- [ ] **Save.** As a player, my progress is written to browser storage automatically after each command.
- [ ] **Load.** As a player, when I return to the page, I pick up exactly where I left off.
- [ ] **Save versioning.** As the author, when I change the state shape during development, old saves are detected and discarded rather than crashing the game. A version number on the save and a mismatch check is enough. Do this now, not after the first time a stale save wastes an evening.
- [ ] **Reset.** As a player, I can start over from scratch. Also your primary dev tool for the rest of the project.

**Done when:** you can play, close the tab, reopen, and be where you were — and a broken save recovers gracefully instead of white-screening.

---

## Phase 4 — Content pipeline

**Goal:** the ability to author lots of documents comfortably, and have them read well on screen.

- [ ] **Content authoring convention.** Settle how you'll write file bodies — where the text lives, how line breaks and blank lines are preserved, how you keep a long research doc readable in source. Whatever you pick, write it down as a note-to-self in the repo.
- [ ] **Long document rendering.** As a player, when I read a long document, it doesn't dump 400 lines and blow past my scrollback in one frame. Decide between paging (a "more" prompt) or just relying on scroll. Paging is more authentic and more work; scroll is free. Pick one and move on.
- [ ] **Typing animation.** As a player, output can appear character by character at a readable pace. Build this as a reusable renderer capability, not a one-off — the live-edit, the ghost-text, and every scripted effect later are variations on it. Also: as a player, I can skip the animation by pressing a key, because forced slow text becomes infuriating on a re-read.
- [ ] **Content separated from code.** Confirm your game world lives in its own file(s) as inert data, and that adding a new document means adding data, never writing a new function. If you find yourself writing a handler per file, stop and fix the shape.
- [ ] **Boot sequence.** As a player, when I first load the page, I get a short startup that establishes the fiction and drops me at a prompt. Small, but it's the first impression and it sets the whole tone.

**Done when:** you can add a new document to the world in under a minute, and reading it on screen feels good.

---

## Phase 5 — Autocomplete, the honest version

**Goal:** a genuinely useful, boringly reliable autocomplete. This is the baseline that gets violated much later. It has to earn trust before it can betray it — so this phase contains zero horror.

- [ ] **Command completion.** As a player, pressing tab completes a partially typed command.
- [ ] **Path completion.** As a player, pressing tab completes a partially typed file or directory name in the current location.
- [ ] **Ambiguity handling.** As a player, when several things match, I see the options rather than getting a wrong guess.
- [ ] **Ghost text.** As a player, I see a dim preview of what would be completed before I accept it. This is the visual channel every autocomplete anomaly will use, so build it deliberately.

**Done when:** you catch yourself using tab reflexively while testing. That reflex is the entire setup for Phase 6.

---

## Phase 6 — The anomaly engine

**Goal:** the machinery for wrongness. Deterministic, flag-driven, never random.

- [ ] **Trigger system.** As the author, I can attach an effect to an event — reading a specific file, entering a directory, reaching a flag state — and have it fire once, reliably, at the right moment. Deterministic is non-negotiable: random anomalies can't be playtested, can't be paced, and can't be reasoned about by the player, which kills the deduction pillar.
- [ ] **Effect registry.** As the author, content data can name an effect and the engine looks it up. Content stays inert data; effects are code, registered by name.
- [ ] **Anomalous metadata.** As a player, some files report impossible metadata through the normal `stat` command, in the same calm layout as everything else. Data-driven — no special-case code per file.
- [ ] **Live edit.** As a player, I can watch text on screen change itself, character by character, while I'm reading it. Built on the Phase 4 typing animation, running backward then forward.
- [ ] **The verification response.** As a player, when I check a file that just changed in front of me, the system calmly reports no changes. The gaslighting beat that closes every live-edit.
- [ ] **Autocomplete anomalies.** As a player, at scripted moments, the completion offered is not what it should be. Tier one first (the deniable one), tiers above it much later and rarely.
- [ ] **Input substitution.** As a player, at exactly two scripted moments, what I type is not what appears. Quarantine this in the renderer, comment it loudly, and gate it hard behind flags — a bug here that fires at the wrong time is indistinguishable from a broken game.
- [ ] **The hidden path.** As a player, there is a location that no listing command reveals, reachable only when the game leads me there.

**Done when:** you can trigger each effect on demand from a test file, and each one fires exactly once at exactly the right moment.

**Note:** hardcode the first anomaly. Generalize on the third. Building a beautiful abstract framework before you've written three concrete effects is the classic way to spend two weeks and ship nothing.

---

## Phase 7 — Act one, for real

**Goal:** the vertical slice. Real content, real pacing, real ending. This is where the game becomes a game.

- [ ] **Write the first research document.** The scientist's voice, calm, describing an output that arrived before its input. The tuning fork for everything else.
- [ ] **The sysadmin's opening notes.** The handoff, the tone-setting, the "this won't look like anything you've used." Warm and competent, no wrongness yet.
- [ ] **The mundane baseline.** The genuinely boring stretch — real tribal-knowledge archaeology, normal timestamps, a system that works. Resist the urge to make this interesting. Its dullness is load-bearing.
- [ ] **Anomaly one.** The first violation, placed after the baseline is installed.
- [ ] **The plant.** The future-dated file with the player's name on it. Placed where it will be found, flagged as important by nothing.
- [ ] **Act one ending beat.** Whatever closes the slice — a revelation, a door opening, a descent.
- [ ] **Playtest.** Hand it to your daughter. Watch, don't help. Every place she frowns or asks "wait, why is that bad?" is a baseline gap. Note them, fix them upstream by adding boring context earlier, never by adding a signpost at the moment of the scare.
- [ ] **Second playtest with someone else.** Ideally a non-technical adult. Different failure modes surface.

**Done when:** a stranger can play from boot to act one's end and describe what happened to them.

---

## Phase 8 — Ship v1

- [ ] Landing text on the page: what this is, that it needs a keyboard, roughly how long it takes.
- [ ] Corrupt/missing save resilience — someone will open this in a weird browser.
- [ ] A README in the repo. Future-you and any interviewer will read it.
- [ ] Public URL tested from a machine that has never loaded it before.
- [ ] Post it somewhere. itch.io is the natural home.

---

## Beyond v1 — the parking lot

Write ideas here instead of building them. In rough order of what you'd add next:

- Acts two through four; the descent through the document layers
- The bootstrap loop: the cron/scrape instruction, the forced write, the recognition
- The note rewrite (the sysadmin's apology being overwritten)
- The `help` → `me` beat, and the later personal completions
- The finale: the six-character correction
- The "trust the process" motif at act boundaries
- Remote paths — readable, not explorable
- Sound design
- Mobile input

---

## Where you'll stall, and the default answer

These are the decisions likely to eat an evening in analysis. Pre-decided, so they don't:

**"How robust should path resolution be?"** Support exactly what your content needs. If no path in your game is more than four levels deep, don't handle arbitrary depth edge cases.

**"Should I use a framework / TypeScript / a build tool?"** No. Not for v1. Adding tooling mid-project is a whole evening that produces zero player-facing progress. Ship vanilla, learn what you actually needed, use it on the next project.

**"Is my architecture right?"** If the engine has no DOM references and the content is data, it's right enough. Everything else is refactorable later.

**"Should I write more content or more features?"** Features until the end of Phase 6. Content in Phase 7. Mixing them means rewriting content when the shape changes.

**"This anomaly system feels too rigid / I should make it more flexible."** Ship three concrete anomalies first. If you still feel it after three, then generalize — and you'll generalize correctly, because you'll have three real examples instead of imagined ones.

**"I want to jump ahead to the cool scare."** Note it in the parking lot. The scare doesn't work without the baseline, and the baseline is Phases 1 through 5. Building the payoff before the setup produces a mechanic nobody has been trained to fear.

---

## Nightly rhythm

1. Open this file. Find the topmost unchecked box.
2. Build only that.
3. Run it. Play it for thirty seconds.
4. Commit.
5. Check the box.

If a box turns out to be three nights of work, split it in the file and check off the pieces. This document is yours — edit it as the project teaches you things.