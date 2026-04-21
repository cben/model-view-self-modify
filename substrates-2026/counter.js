var model = 0
  + 1
  + 1
var here = LINE_START(HERE())

const View = (model, where) => html`<div>
    <h1>${model}</h1>
    <button onclick=${() => where.WRITE('  + 1\n')}>increment</button>
    <button onclick=${() => where.WRITE('  - 1\n')}>decrement</button>
  </div>`
yield View(model, here)

var instancesHere = LINE_START(HERE())

const newInstance = `\
var model = 0
var here = LINE_START(HERE())
yield View(model, here)

`
return html`<button onClick=${() => instancesHere.WRITE(newInstance)}>Create counter</button>`