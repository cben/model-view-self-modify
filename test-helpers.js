// Unit test helpers: render pass/diff + jump to source

var testFailures = []
var assertEqual = (actual, expected) => {
  // FLAWED quick-and-dirty equality.
  // TODO: import expect from 'https://unpkg.com/expect/build/index.js'
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    testFailures.push(html`<li style=${'list-style-type: "≠"'}>
      Actual: <code>${JSON.stringify(actual, null, 2)}</code><br/>
      Expected: <code>${JSON.stringify(expected, null, 2)}</code>
    </li>`)
  }
}
var Test = (name, func) => {
  testFailures = []
  const pos = CALLER()
  const jump = html`<button onclick=${() => pos.JUMP()}>${name}</button>`
  try {
    func()
  } catch (e) {
    return html`${jump} 💥 ${e.name}: ${e.message}<br/>
    // TODO: .stack line numbers don't match editor numbering by \`functionLineOffset\`<br/>
    ${e.stack.split('\n')[0]}`
  }
  if (testFailures.length > 0) {
    return html`${jump} ❌ <ul>${testFailures}</ul>`
    // TODO link to source location
  }
  return html`${jump} ✅`
}

yield Test('exception', () => { foo.bar })
yield Test('addition', () => { assertEqual(2+2, 5); assertEqual(2+2, 4); assertEqual(2+2, [6]) })
yield Test('good', () => { assertEqual(2+2, 4) })
