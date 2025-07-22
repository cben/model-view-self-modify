# Implementation things I learnt in 1st week of prototyping

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
