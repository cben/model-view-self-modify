# Things I learned in 1st week of prototyping

* localStorage is awesome for edit/reload development!
  2 lines for major quality of life improvement

* JS without bundler/transpiler is [fun again][1].
  - CDNs serving npm packages: unpkg.com, skypack.dev, esm.sh
    - If you don't want CDNs, there is snowpack.dev (didn't try it)

  - Can use ESM imports inside `<script type="module">`
    - may also need a `<script type="importmap">`

  - `htm` library: JSX-like notation in JS tagged templates

* JS eval() facilities are surprisingly junky :-(
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


# Future

* finish the Tetris
* look for max opportunities to use WRITE() during coding
  - "level editor" kind of stuff
  - color picker

* go meta: Shift parts of the live env e.g. <DisplayResult> into the env itself so they can be edited?
  - serialize CodeMirror edit actions to a text stream, allow time travel there too?!

but more important:

* computation caching!  Don't re-run code from start, esp. when appending at the end.

* don't reinvent the env — build on observablehq or similar. (https://github.com/asg017/dataflow ?)
  - Observable notebook already parses separate JS cells, computes data dependencies and manages re-computation...

* is React conceptual overkill here?  
  For the most part, instead of ``html`<${View} ...${model}/>` `` it's simpler to write `View(model)`.  
  The deep benefit of React.createElement is separation from "mount component now" vs. "render it later",
  and supporting a stateful lifecycle...  
  But if we [pretend to] re-evaluate everything all the time, we can just call functions (like in Elm!)