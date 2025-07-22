const model = 0
  + 1 + 1
// PUT CURSOR ABOVE BEFORE CLICKING "increment" / "decrement".
// If you mess up, use Ctrl+Z / Ctrl+Shift+Z.

const View = (model) => html`<div>
    <h1>${model}</h1>
    <button onclick=${() => WRITE(' + 1')}>increment</button>
    <button onclick=${() => WRITE(' - 1')}>decrement</button>
  </div>`

yield View(model)
