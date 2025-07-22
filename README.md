> This README is better viewed [online](https://model-view-self-modify.netlify.app/README.html) with interactive iframes, then on github.
>
> You can `git clone https://github.com/cben/model-view-self-modify` and serve locally by e.g. `python3 -m http.server` but current implementation won't load offline.

# what: Model |> View |> Self-Modify architecture

An approach to interactive apps/games I'd wanted to try in a toy language but realized is largely language-agnostic. I made a JS proof-of-concept of it.

To explain it, first recall **"Model-View-Update"** architecture popularized by [Elm](https://elmprogramming.com/model-view-update-part-1.html) / [Redux](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow):  
app state is immutable ("Model" / "store"), View renders UI as a pure function of state,  
user actions are [defunctionalize][]d into pure data e.g. `{ type: "rotateRight" }`,  
and "Update" / "reducer" function dispatches on (action, old model) → to compute new model.

Like "[event sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)", having the actions log enables fun tooling. Notably "live reload" simulated by replaying actions from scratch on new code, and [time traveling debugging](https://elm-lang.org/news/time-travel-made-easy).

[defunctionalize]: https://www.pathsensitive.com/2019/07/the-best-refactoring-youve-never-heard.html

### a live coding JS environment, where _user actions call `WRITE(...)` to modify app source_

What if we represent the same user intent as code, not data, and actually append them into relevant place in app code?!

https://model-view-self-modify.netlify.app/?load=counter.js :
<iframe src="index.html?load=counter.js" width=1600 height=600></iframe>

This is a bad idea in many ways (⚠ including security!) but it challenges assumptions on essential complexity and walls between language/env authors | developer | end-user.

## Who is this for?

TBH, I don't know.  
**Cons:** The null hypothesis remains that self-modifying code is to be minimized not embraced, the ⚠ security worries are real, and without smart cachiing performance will decline O(n²)...

🤪 Could this be a stepping stone for **beginner** programmers making home-cooked, offline, single-user apps?!  
**Pros:** It's radically minimalistic: It leverages a mental model they need _anyway_ — how changed code gets re-run — to model user interaction too.  
It smuggles some "advanced" practices like unidirection data flow & event sourcing, with minimal ceremony.  
Most important to me, it'd spread the subversive ideas that code _is_ data _is_ code, that "using" _is_ "programming", that any UI forms a [weak] language, and that tools should be moldable.

Can they later learn saner but more complex practices?  Or would it leave them "mentally mutilated beyond hope of regeneration"? Shrug. Yes my first PC exposure was to BASIC, and it was fun ;-)

## Why: Reduce barriers between app "end user" / app developer / IDE developer

If user-facing UI actually edits (well, inserts) code, same skills translate to developer making mini-UIs for themself!  

- TDD helpers: visualize pass/fail/rich results, button to jump to failing test...  
  _Help yourself_ to [Babylonian-style Programming](https://arxiv.org/abs/1902.00549) without hard-wired IDE support?
- Level/asset editors...  Poor man's [livelits](https://doi.org/10.1145/3462276) (side-by-side with code, not actually inline)...

## Why: internal/external DSL perspective

> By admitting input, a program acquires a control language by which a user can guide the program through a maze of possibilities.  
> — [Chuck Moore](http://forth.org/POL.pdf) (for particular definition of "input")

The redux append-only log of user actions _is_ code, in an _app-specific language_.  
The pattern-matching we do in Update / reducer functions _is_ an explicit interpreter for an "external DSL":
```js
... onclick="dispatch({ type: 'rotateRight' })" ...

switch (action.type) {
   case 'rotateRight': ...
```

This adds ceremony & cognitive load.  The "internal DSL" alternative is (1) define regular model → model function calls.

- Now add functions that take model and return new model.
- _If_ user were willing to type function calls into editor, you're done ;-)
  This is an _internal DSL_ approach to interaction: Model + View is all you need, and you can be purely
  functional without any in-language approach to state (like in spreadsheets).

- To make it friendlier, classical UI explicitly reads events, translates them to state changes —
  i.e. treats user input as _external DSL_.  Don't do that!  
  _Instead, translate user actions to changes in the source editor_ — which trigger re-computation.

## Why: make user state 1st-class

Traditional developer (especially one attempting event sourcing / time travel / record-replay live coding)
needs two concepts of stateful change: changing state inside the app, but also changing the app source.

```mermaid
graph LR
  code --> runtime --> developer ==> code
  subgraph runtime
     state --> view --> action ==> state
  end
```

  This approach reduces it to only one.

  - Think of an event-sourcing DB migration changing the format of past events,
    or a refactor changing Redux actions structure, invalidating the recorded history.
    Fixing those requires thinking of both "change" concepts at once :-/
    
    In this self-modify paradigm you get same issues — but _history is regular code_,
    so regular "refactor after a function interface changed" skills apply.

TODO: stress does NOT solve schema evolution like cambria!  
I punt on that hard problem and expect user=dev resolve conflicts, just in a conceptually simple way.

```mermaid
graph LR
  code[[source code]] -->|re-run| state
  p(programmer affects) --> code
  subgraph language semantics
    state[(state)] -->|React| DOM
  end
  DOM -->|browsers| screen --> u
  u(user affects) -..-x|MVU| state
  u -->|💡| code
```

1. 199x Browsers popularized what user sees being a pure function of DOM.
2. 201x React popularized DOM being pure function of your data/state ("model").
3. Given a live coding environment where the code you edit gets _re-evaluated on every edit_,  
   we could move _all_ mutation out of the language!
   

   - [ ] (TODO: to scale this [needs](https://www.joelonsoftware.com/2001/12/11/back-to-basics/) caching of intermediate results, but full re-run works for a PoC.)

My attempts to google prior art like "purely functional self-modifying code" led nowhere, what with self-modifying code being shunned even in imperative circles for _being hard to reason about_ :-)  


# Putting it all together: Tetris

1. https://model-view-self-modify.netlify.app/?load=tetris.js

   <iframe src="index.html?load=tetris.js" width=1600 height=600></iframe>

2. Start moving "TIME TRAVEL" line up.
3. Put editor cursor before it and start clicking [left] [right] [down] buttons to play from that moment.
4. Put cursor inside `RCSet([...])` in `newGame.board`.  Start clicking board cells to mark them occupied.

If you want to edit freely, drop the `?load=...` from URL, otherwise your edits get overwritten on reload.
You can append different `?id=...` to keep separate projects in browser localStorage.

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
  - check out https://tomasp.net/academic/papers/live/, https://pldi17.sigplan.org/series/ic
  - mobx?
  - benefit from user-provided data-flow structure e.g. observablehq cells

* don't reinvent the env — build on observablehq or similar. (https://github.com/asg017/dataflow ?)
  - Observable notebook already parses separate JS cells, [computes data dependencies and manages re-computation](https://observablehq.com/@observablehq/how-observable-runs)...
    - Or Tom's local-first take on Observable: https://github.com/tomlarkworthy/lopecode.
  - See https://maxbo.me/a-html-file-is-all-you-need.html for how to use Observable Runtime library, but also other cool tricks 🤯

* Try React "fast refresh" API to replace re-defined components in-place?

## TODO: Language qualities that'd make this work better?

Is this really language agnostic?  Kinda, but some language affordances may help:

- postfix order / pipeline operator
- It'd be safer & cleaner to mutate directly AST rather than source text.  So might be easier in homoiconic language like LISP; can approximate with good parser + pretty-printer for round tripping.  
  Specifically, parametrizing inserted code should use safe templating rather than string interpolation to reduce risks of injection.
- immutable semantics conductive to incremental re-computation.

# Prior Art

The core idea is so simple that I'm sure many people independently discovered it before, but I'm not aware of an agreed upon term to search...  


Perhaps my main contribution will be "Model View Self-Modify", and the explanation by comparison to now widely understood MVU architecture.

TODO split into relevant "Why" aspects above?
- Graphite.rs image editor with [language-centric architecture](https://www.youtube.com/watch?v=ZUbcwUC5lxA)
- TAPE https://www.youtube.com/watch?v=drNgClYXEzc&list=PLyrlk8Xaylp7qvYybMfyApufV0HWfbwi-&index=10
- [mage: Fluid Moves Between Code and Graphical Work in Computational Notebooks](https://marybethkery.com/projects/Verdant/mage.pdf) prototyped a Jupyter extension that lets UI user actions to edit back the cell's code.
- Typst aspires to be a better TeX, designed for fast incremental rendering.  Typst creators used a very similar approach to make "interactive" games [icicle](https://typst.app/universe/package/icicle/) & [badformer](https://typst.app/universe/package/badformer/), where user types a sequence of WASD letters & documented is re-rendered each time.  Also picked up in community [soviet-matrix package](https://github.com/YouXam/soviet-matrix) implementating Tetris.

