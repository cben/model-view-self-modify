var H = 10
var W = 8

// Sets of coordinates are a fun representation, but JS Set doesn't support tuple keys :-(
var formatRC = JSON.stringify
var parseRC = JSON.parse

var RCSet = pairs => new Set(pairs.map(formatRC))
var mapRC = (rcset, f) => RCSet([...rcset].map(parseRC).map(f))
var unionRC = (a, b) => new Set(_.union([...a], [...b]))
var intersectionRC = (a, b) => new Set(_.intersection([...a], [...b]))

var Cell = ({ rc, color }) =>
  html`<td 
    style="border: grey solid 1px; background-color: ${color}; color: grey;"
    onClick=${() => WRITE(`${rc}, `)}
  >
    ${rc}
  </td>`

var Board = ({ rcToColorFunc, h = H, w = W }) => 
  html`<table>
    ${_.range(0, h).map(r =>
      html`<tr>
        ${_.range(0, w).map(c => {
          const rc = formatRC([r, c])
          return html`<${Cell} key=${rc} rc=${rc} color=${rcToColorFunc(rc)}/>`
        })}
      </tr>`
    )}
  </table>`

var fullBoard = RCSet(_.range(0, H).flatMap(r => _.range(0, W).map(c => [r, c])))
var floor = RCSet(_.range(0, W).map(c => [H, c]))

var L = RCSet([
  [0,4],
  [1,4], 
  [2,4], [2,5]
])

var newGame = { 
  shape: L, 
  board: RCSet([[8,3], [8,4], [9,4], ]), // TEMP, to test shape/board collisions
  score: 0,
}

var View = ({ shape, board, score }) => 
  html`<div>
    <div>Score: ${score}</div>
    <${Board} h=${H+1} rcToColorFunc=${rc =>
            shape.has(rc) ? (board.has(rc) ? 'red' : 'blue') :
            board.has(rc) ? 'green' : 
            floor.has(rc) ? 'grey' :
            'white'
      }/>
    <button onClick=${() => WRITE('\nmodel = left(model)')}>left</button>
    <button onClick=${() => WRITE('\nmodel = right(model)')}>right</button>
    <button onClick=${() => WRITE('\nmodel = down(model)')}>down</button>
  </div>`
// return View(newGame)

var completeLines = (model) => {
  let { shape, board, score } = model
  var newRows = []
  // scan bottom-up
  _.rangeRight(0, H).forEach(r => {
    const colSet = _.range(0, W).filter(c => board.has(formatRC([r, c])))
    if (colSet.length == W) {
      score += 10
      // omit the completed line
    } else {
      // include it
      newRows.push(colSet)
    }
  })
  return {
    board: RCSet(_.rangeRight(0, H).flatMap((row, i) => 
      (newRows[i] ?? []).map(col => [row, col])
    )),
    shape,
    score,
  }
}


var lockInPlace = (model) => {
  const { shape, board, score } = model
  return completeLines({
    score: score + 1,
    board: (unionRC(shape, board)),
    shape: L,
  })
}

var invalidMove = model => model

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
/* -- TIME TRAVEL: use Alt+Up / Alt+Down to move this line ---
model = down(model)
model = down(model)
*/

// Any of these forms should render:

// return View(model)

return () => View(model)

// return html`<${View} ...${model}/>`

class App extends Component { render = () => View(model) }
// return App
