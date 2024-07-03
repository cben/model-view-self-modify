var H = 10
var W = 8

// Sets of coordinates are a fun representation, but JS Set doesn't support tuple keys :-(
var formatRC = JSON.stringify
var parseRC = JSON.parse

var RCSet = pairs => new Set(pairs.map(formatRC))
var mapRC = (rcset, f) => RCSet([...rcset].map(parseRC).map(f))
var unionRC = (a, b) => new Set(_.union([...a], [...b]))
var intersectionRC = (a, b) => new Set(_.intersection([...a], [...b]))

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

var fullBoard = RCSet(_.range(0, H).flatMap(r => _.range(0, W).map(c => [r, c])))
var floor = RCSet(_.range(0, W).map(c => [H, c]))

var L = RCSet([
  [0,4],
  [1,4],
  [2,4], [2,5],
])
// return Board({ rcToStyleFunc: rc => L.has(rc) ? 'background-color: blue' : ''})

// === MODEL ===

var newGame = {
  shape: L,
  board: RCSet([[8,3], [8,4], [9,4], ]), // TEMP, to test shape/board collisions
  score: 0,
  lastMoveIvalid: false,
}

var View = (model) => {
  const { shape, board, score } = model;
  const merged = unionRC(board, shape)
  return html`<div>
    <div>Score: ${score}</div>
    <${Board} h=${H+1} rcToStyleFunc=${rc =>
      `background-color: ${
        shape.has(rc) ? (board.has(rc) ? 'red' : 'blue') :
        board.has(rc) ? 'green' :
        floor.has(rc) ? 'grey' :
        'white'
      };
      opacity: ${isLineFull(merged, parseRC(rc)[0]) ? 0.4 : 1.0};
      `
    }/>
    <button disabled=${left(model).lastMoveInvalid} onClick=${() => WRITE('\nmodel = left(model)')}>left</button>
    <button disabled=${right(model).lastMoveInvalid} onClick=${() => WRITE('\nmodel = right(model)')}>right</button>
    <button disabled=${down(model).lastMoveInvalid} onClick=${() => WRITE('\nmodel = down(model)')}>down</button>
  </div>`
}
// return View(newGame)

// Deleting cleared rows requires re-numbering -
// temporarily representing each row as column numbers, forgetting the old row number.
var colSet = (board, row) =>
  _.range(0, W).filter(c => board.has(formatRC([row, c])))

var isLineFull = (board, row) =>
  colSet(board, row).length === W

var renumberRow = (board, oldRow, newRow) =>
  colSet(board, oldRow).map(c => [newRow, c])
// return { L: L, result: RCSet(renumberRow(L, 2, 3)) }

var completeLines = (model) => {
  let { shape, board, score } = model
  // scan bottom-up
  var rowsToKeep = _.rangeRight(0, H).filter(r => !isLineFull(board, r))
  return {
    board: RCSet(_.rangeRight(0, H).flatMap((newRow, i) =>
      // kludge: where rowsToKeep[i] === undefined, colSet happens to be []
      renumberRow(board, rowsToKeep[i], newRow)
    )),
    shape,
    score: score + 10 * (H - rowsToKeep.length),
    lastMoveInvalid: false,
  }
}

var lockInPlace = (model) => {
  const { shape, board, score } = model
  return completeLines({
    score: score + 1,
    board: (unionRC(shape, board)),
    shape: L,
    lastMoveInvalid: false,
  })
}

var invalidMove = model =>
  ({ ...model, lastMoveInvalid: true })

var move = (deltaRow, deltaCol, onCollision) => (model) => {
  const { shape, board, score } = model
  const newPos = mapRC(shape, ([r, c]) => [r + deltaRow, c + deltaCol])

  if (intersectionRC(newPos, board).size > 0 ||
      intersectionRC(newPos, floor).size > 0) {
    return onCollision(model)
  }
  if (intersectionRC(newPos, fullBoard).size < newPos.size) {
    return invalidMove(model)
  }
  return {
    ...model,
    shape: newPos,
    lastMoveInvalid: false,
  }
}

var left = move(0, -1, invalidMove)
var right = move(0, +1, invalidMove)
var down = move(+1, 0, lockInPlace)

// GAME HISTORY

model = newGame
model = down(model)
model = down(model)
model = left(model)
model = left(model)
model = left(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = left(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = right(model)
model = right(model)
model = left(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = right(model)
model = right(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = down(model)
model = left(model)
model = left(model)
model = left(model)
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
