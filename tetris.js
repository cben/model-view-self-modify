var H = 10
var W = 8

// Sets of coordinates are a fun representation, but JS Set doesn't support tuple keys :-(
var formatRC = JSON.stringify
var parseRC = JSON.parse

var RCSet = pairs => new Set(pairs.map(formatRC))
var mapRC = (rcset, f) => RCSet([...rcset].map(parseRC).map(f))
var unionRC = (a, b) => new Set(_.union([...a], [...b]))
var intersectionRC = (a, b) => new Set(_.intersection([...a], [...b]))

// UI that links to source
// [subtle scoping: `CALLER().JUMP` is evaluated before building the html]
var H1 = (text) => html`<h1 id=${encodeURIComponent(text)} onclick=${CALLER().JUMP} style="color: blue; cursor: pointer;">
  <style>:target { background-color: #cceeff44; }</style>
  <a href=${"#"+encodeURIComponent(text)}># ${text}</a>
</h1>`
var H2 = (text) => html`<h2 id=${encodeURIComponent(text)} onclick=${CALLER().JUMP} style="color: blue; cursor: pointer;">
  <style>:target { background-color: #cceeff44; }</style>
  <a href=${"#"+encodeURIComponent(text)}>## ${text}</a>
</h2>`

yield H2("Unit test helpers") ///////////////////////////

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
  // TODO: can I use implementation's betterEvalFunction() or is it cheating?
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
// yield Test('exception', () => { foo.bar })
// yield Test('addition', () => { assertEqual(2+2, 5); assertEqual(2+2, 4); assertEqual(2+2, [6]) })
// yield Test('good', () => { assertEqual(2+2, 4) })

yield H2("Shapes on a board") ///////////////////////////

var Cell = ({ rc, style }) =>
  html`<td
    style="border: grey solid 1px; color: grey; ${style}"
    onClick=${() => WRITE(`${rc}, `)}
  >
    ${rc}
  </td>` 

var Board = ({ rcToStyleFunc, h = H, w = W }) =>
  html`<table>
    ${_.range(0, h).map(r =>
      html`<tr>
        ${_.range(0, w).map(c => {
          const rc = formatRC([r, c])
          return html`<${Cell} key=${rc} rc=${rc} style=${rcToStyleFunc(rc)}/>`
        })}
      </tr>`
    )}
  </table>`

var clockwiseRC = ([r, c]) => [c, -r]
yield Test('rotation is cyclic', () => {
  assertEqual(clockwiseRC([2,3]), [3,-2])
  assertEqual(clockwiseRC(clockwiseRC(clockwiseRC(clockwiseRC([2,3])))), [2,3])
})

var offsetRC = ([deltaR, deltaC]) => ([r,c]) => [r + deltaR, c + deltaC]
yield Test('shift is invertible', () => {
  assertEqual(offsetRC([-10,-20])(offsetRC([10,20])([2,3])), [2,3])
})

var rotationsAround = ([centerR, centerC], cells) => {
  var result = [cells]
  for (let i = 1; i < 4; i++) {
    cells = mapRC(cells, offsetRC([-centerR, -centerC]))
    cells = mapRC(cells, clockwiseRC)
    cells = mapRC(cells, offsetRC([centerR, centerC]))
    result.push(cells)
  }
  return result
}

// https://tetris.wiki/Super_Rotation_System

var shapes = {}

shapes.I = rotationsAround([1.5,1.5], RCSet([
  [1,0], [1,1], [1,2], [1,3], 
]))
yield shapes.I.map(shape => html`<td>${Board({ h: 4, w: 4, rcToStyleFunc: rc => shape.has(rc) ? 'background-color: cyan' : ''})}</td>`)

shapes.J = rotationsAround([1,1], RCSet([
  [0,0],
  [1,0], [1,1], [1,2], 
]))
yield shapes.J.map(shape => html`<td>${Board({ h: 4, w: 4, rcToStyleFunc: rc => shape.has(rc) ? 'background-color: blue' : ''})}</td>`)

shapes.L = rotationsAround([1,1], RCSet([
                [0,2], 
  [1,0], [1,1], [1,2], 
]))
yield shapes.L.map(shape => html`<td>${Board({ h: 4, w: 4, rcToStyleFunc: rc => shape.has(rc) ? 'background-color: orange' : ''})}</td>`)

shapes.O = rotationsAround([0.5,1.5], RCSet([
  [0,1], [0,2],
  [1,1], [1,2], 
]))
yield shapes.O.map(shape => html`<td>${Board({ h: 4, w: 4, rcToStyleFunc: rc => shape.has(rc) ? 'background-color: yellow' : ''})}</td>`)

shapes.S = rotationsAround([1,1], RCSet([
         [0,1], [0,2], 
  [1,0], [1,1],
]))
yield shapes.S.map(shape => html`<td>${Board({ h: 4, w: 4, rcToStyleFunc: rc => shape.has(rc) ? 'background-color: green' : ''})}</td>`)

shapes.T = rotationsAround([1,1], RCSet([
         [0,1], 
  [1,0], [1,1], [1,2],
]))
yield shapes.T.map(shape => html`<td>${Board({ h: 4, w: 4, rcToStyleFunc: rc => shape.has(rc) ? 'background-color: purple' : ''})}</td>`)

shapes.Z = rotationsAround([1,1], RCSet([
  [0,0], [0,1], 
         [1,1], [1,2], 
]))
yield shapes.Z.map(shape => html`<td>${Board({ h: 4, w: 4, rcToStyleFunc: rc => shape.has(rc) ? 'background-color: red' : ''})}</td>`)


yield H1('Game model') ///////////////////////////

var fullBoard = RCSet(_.range(0, H).flatMap(r => _.range(0, W).map(c => [r, c])))
var floor = RCSet(_.range(0, W).map(c => [H, c]))

// TODO reproducible randromness:
// - Now using classic approach with explicit seed for reproducibility.
// - Consider encoding random choices in game history itself (like extra moves)?
//   Imagine if randomness were a network API — how would I represent responses in redux (consistent with time travel)?

var newGame = (seed='foo') => ({
  shape: shapes.L, // shape[0] is current orientation
  board: RCSet([[8,3], [8,4], [9,4], ]), // TEMP, to test shape/board collisions
  score: 0,
  lastMoveIvalid: false,
  rng: new Rand(seed),
})

var View = (model) => {
  const { shape, board, score } = model;
  const merged = unionRC(board, shape[0])
  return html`<div>
    <div>Score: ${score}</div>
    <${Board} h=${H+1} rcToStyleFunc=${rc =>
      `background-color: ${
        shape[0].has(rc) ? (board.has(rc) ? 'red' : 'blue') :
        board.has(rc) ? 'green' :
        floor.has(rc) ? 'grey' :
        'white'
      };
      opacity: ${isLineFull(merged, parseRC(rc)[0]) ? 0.4 : 1.0};
      `
    }/>
    <button disabled=${!rotateRight || rotateRight(model).lastMoveInvalid} onclick=${() => WRITE('\nmodel = rotateRight(model)')}>rotateR</button>
    <button disabled=${!left || left(model).lastMoveInvalid} onClick=${() => WRITE('\nmodel = left(model)')}>left</button>
    <button disabled=${!right || right(model).lastMoveInvalid} onClick=${() => WRITE('\nmodel = right(model)')}>right</button>
    <button disabled=${!down || down(model).lastMoveInvalid} onClick=${() => WRITE('\nmodel = down(model)')}>down</button>
  </div>`
}
// yield View(newGame())

// Deleting cleared rows requires re-numbering -
// temporarily representing each row as column numbers, forgetting the old row number.
var colSet = (board, row) =>
  _.range(0, W).filter(c => board.has(formatRC([row, c])))

var isLineFull = (board, row) =>
  colSet(board, row).length === W

var renumberRow = (board, oldRow, newRow) =>
  colSet(board, oldRow).map(c => [newRow, c])
// return { L1: shapes.L[1], result: RCSet(renumberRow(shapes.L[1], 2, 3)) }

var completeLines = (model) => {
  let { shape, board, score } = model
  // scan bottom-up
  var rowsToKeep = _.rangeRight(0, H).filter(r => !isLineFull(board, r))
  return {
    ...model,
    board: RCSet(_.rangeRight(0, H).flatMap((newRow, i) =>
      // kludge: where rowsToKeep[i] === undefined, colSet happens to be []
      renumberRow(board, rowsToKeep[i], newRow)
    )),
    score: score + 10 * (H - rowsToKeep.length),
    lastMoveInvalid: false,
  }
}

// KLUDGE: This has side effect on `rng`!  The dogmatic functional approach is I guess
//   for random generator state to be immutable and return a new state?
//   But then we'd have to thread it in and *out* of all calls and I don't care enough.
var randomChoice = (rng, values) =>
  values[Math.floor(rng.next() * values.length)]

// test RNG stability
r = new Rand(123)
yield _.range(10).map(i => randomChoice(r, ['a', 'b', 'c']))

var lockInPlace = (model) => {
  const { shape, board, score, rng } = model
  return completeLines({
    ...model,
    score: score + 1,
    board: unionRC(shape[0], board),
    shape: randomChoice(rng, Object.values(shapes)),
    lastMoveInvalid: false,
  })
}

var invalidMove = model =>
  ({ ...model, lastMoveInvalid: true })

var move = (deltaRow, deltaCol, onBoundary) => (model) => {
  const { shape, board, score } = model
  // Shift all rotations together; only newPos[0] orientation has to fit board.
  const newShape = shape.map(cells =>
    mapRC(cells, offsetRC([deltaRow, deltaCol]))
  )
  const newPos = newShape[0]

  if (intersectionRC(newPos, board).size > 0 ||
      intersectionRC(newPos, floor).size > 0) {
    return onBoundary(model)
  }
  if (intersectionRC(newPos, fullBoard).size < newPos.size) {
    return invalidMove(model)
  }
  return {
    ...model,
    shape: newShape,
    lastMoveInvalid: false,
  }
}

var left = move(0, -1, invalidMove)
var right = move(0, +1, invalidMove)
var down = move(+1, 0, lockInPlace)

var rotateRight = model => {
  const { shape, board } = model
  const newShape = shape.slice(1, 4) + shape.slice(0, 1)
  console.log(newShape)
  // TODO: try other "wall kick" positions
  const newPos = newShape[0]
  if (intersectionRC(newPos, board).size == 0 &&
      intersectionRC(newPos, fullBoard).size == newPos.size) {
    return {
      ...model, 
      shape: newShape,
      lastMoveInvalid: false
    }
  }
  return invalidMove(model)
}

// GAME HISTORY

model = newGame()
model = right(model)
model = right(model)
model = right(model)
model = right(model)
model = down(model)
model = down(model)
model = rotateRight(model)
model = rotateRight(model)
model = right(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = right(model)
model = down(model)
model = rotateRight(model)
model = rotateRight(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
/* -- TIME TRAVEL: use Alt+Up / Alt+Down to move this line ---
model = down(model)
*/

// Any of these forms should render:

// return View(model)

return () => View(model)

// return html`<${View} ...${model}/>`

class App extends Component { render = () => View(model) }
// return App
