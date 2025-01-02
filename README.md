> By admitting input, a program acquires a control language by which a user can guide the program
> through a maze of possibilities. — [Chuck Moore](http://forth.org/POL.pdf)

# what: Model |> View |> Self-modify architecture

An approach to interactive apps/games I'd wanted to try in a toy language but realized is largely language-agnostic,
and easy to explain to anybody who understands Redux/Elm. I had a week+ to prototype it in JS.

### a proof-of-concept live coding JS environment, where _user actions call `WRITE(...)` to modify app source_

This is a bad idea in many ways (⚠ including security!) but it challenges assumptions 
on essential complexity and walls between language/env authors | developer | end-user.

- Browsers popularized what user sees being a pure function of DOM.
- React popularized DOM being pure function of your data/state ("model").
- We need a live coding environment where the code you edit gets _re-evaluated on every edit_.
  (TODO: to scale this needs caching of intermediate results, but full re-run works for a PoC).

- Now add functions that take model and return new model.
- _If_ user were willing to type function calls into editor, you're done ;-)
  This is an _internal DSL_ approach to interaction: Model + View is all you need, and you can be purely
  functional without any in-language approach to state (like in spreadsheets).

- To make it friendlier, classical UI explicitly reads events, translates them to state changes —
  i.e. treats user input as _external DSL_.  Don't do that!  
  _Instead, translate user actions to changes in the source editor_ — which trigger re-computation.

- Traditional developer (especially one attempting event sourcing / time travel / record-replay live coding)
  needs two concepts of stateful change: changing state inside the app, but also changing the app source.
  This approach reduces it to only one.

  - Think of an event-sourcing DB migration changing the format of past events,
    or a refactor changing Redux actions structure, invalidating the recorded history.
    Fixing those requires thinking of both "change" concepts at once :-/
    
    In this self-modify paradigm you get same issues — but _history is regular code_,
    so regular "refactor after a funciton interface changed" skills apply.

# HOW TO TRY

1. https://model-view-self-modify.netlify.app/ (or open `index.html` locally, or serve it by e.g. `python3 -m http.server`).  
2. Paste the content of [tetris.js](tetris.js) into the editor.
3. Start moving "TIME TRAVEL" line up.
4. Put editor cursor before it and start clicking [left] [right] [down] buttons to play from that moment.
5. Put cursor inside `RCSet([...])` in `newGame.board`.  Start clicking board cells to mark them occupied.

# Implementation things I learnet in 1st week of prototyping

* localStorage is awesome for edit/reload development!
  2 lines for major quality of life improvement

* JS without bundler/transpiler is [fun again][1].
  - CDNs serving npm packages: unpkg.com, skypack.dev, esm.sh
    - If you don't want CDNs, there is snowpack.dev (didn't try it)

  - Can use ESM imports inside `<script type="module">`
    - may also need a `<script type="importmap">`

  - `htm` library: JSX-like notation in JS tagged templates

* JS eval() facilities are surprisingly junky :-(
  I spent most of the week tweaking my MVP environment instead of using it...

  - literal `eval()` has magic access to current scope
  - `myEval = eval; myEval()` doesn't.
    It's considered "safer" because the scope it'll 
    pollute is — reliably — only the GLOBAL scope :-D
  - `new Function()` constructor is better, separates
    parsing from running & clean passing of values.
  - SyntaxError within eval() / Function() doesn't report
    what line it happened (only Firefox does, non-standard)
    => [KLUDGE][2]: keep removing lines from the end until the error changes/goes away
  - [`//# sourceURL=` directive][3] for cleaner stack traces
  - TODO: dynamically creating `<script>` tags looks promising?

[1]: https://dev.to/ekeijl/no-build-todo-app-using-htm-preact-209p
[2]: https://stackoverflow.com/a/76452154/239657
[3]: https://fitzgeraldnick.com/2014/12/05/name-eval-scripts.html

# Paradigm things I discovered

* It's not just for end-user interaction!  WRITE() makes it easy to scaffold helpers you use while coding.

* I hoped to build Light Table-like env that magically renders values under the cursor, 
  i.e. time travel would be "stop evaluation at this point".
  I didn't get to that, but the twist is that's not good enough anyway — 
  *time travel requires stopping Model manipulation early, but still running later View code*!

  => I experimented with a kludge: eval skipping editor selection. Unusual and causes lots of flicker.    
  => Dropped that in favor of moving `/*` ... `*/` markers – zero magic just regular editor shortcuts.

* JS syntax is hard to slice into safe-for-partial execution chunks.
  A nd 

* is React conceptual overkill here?  
  For the most part, instead of ``html`<${View} ...${model}/>` `` it's simpler to write `View(model)`.  
  The deep benefit of React.createElement is separation from "mount component now" vs. "render it later",
  and supporting a stateful lifecycle...  
  But if we [pretend to] re-evaluate everything all the time, we can just call functions (like in Elm!)

  + It does give opportunity for some caching.
  + More importantly, it provides well-understood seam between stateless parts
    and off-the-shelf stateful-lifecycle parts.

# Future

* finish the Tetris

* look for max opportunities to use WRITE() during coding - "moldable development"
  - "level editor" kind of stuff
  - color picker

* It's fragile to place editor cursor correctly before interaction.  Add a way to target a fixed place in code.
  - MVP: `BEFORE_COMMENT('FOO').WRITE(...)` targetting `//FOO` or `/*FOO*/`?  
    (It's important to avoid target the code itself that mentions the target name :-)

* go meta: Shift parts of the live env e.g. <DisplayResult> into the env itself so they can be edited?
  - serialize CodeMirror edit actions to a text stream, allow time travel there too?!

but more important:

* computation caching!  Don't re-run code from start, esp. when appending at the end.
  - check out https://tomasp.net/academic/papers/live/
  - mobx?

* don't reinvent the env — build on observablehq or similar. (https://github.com/asg017/dataflow ?)
  - Observable notebook already parses separate JS cells, [computes data dependencies and manages re-computation](https://observablehq.com/@observablehq/how-observable-runs)...
  - See https://maxbo.me/a-html-file-is-all-you-need.html for how to use Observable Runtime library, but also other cool tricks 🤯

* Try React "fast refresh" API to replace re-defined components in-place?
