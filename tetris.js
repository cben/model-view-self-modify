var w = 8
var h = 10

// Sets of coordinates are a fun representation, but JS Set doesn't support tuple keys :-(
var formatRC = JSON.stringify
var parseRC = JSON.parse

var RCSet = pairs => new Set(pairs.map(formatRC))
var mapRC = (rcset, f) => RCSet([...rcset].map(parseRC).map(f))

var Cell = ({ rc, color }) =>
  html`<td 
    style="border: grey solid 1px; background-color: ${color}; color: grey;"
    onClick=${() => WRITE(`${rc}, `)}
  >
    ${rc}
  </td>`

var Board = ({ rcToColorFunc }) => 
  html`<table>
    ${_.range(0, h).map(r =>
      html`<tr>
        ${_.range(0, w).map(c => {
          const rc = formatRC([r, c])
          return html`<${Cell} rc=${rc} color=${rcToColorFunc(rc)}/>`
        })}
      </tr>`
    )}
  </table>`

var L = RCSet([
  [0,4],
  [1,4], 
  [2,4], [2,5]
])

var newGame = { 
  shape: L, 
  board: RCSet([[8,3], [8,4], [8,5], [9,4], ]), // TEMP, to test shape/board collisions
  score: 0,
}

var move = (deltaRow, deltaCol) => (model) => {
  return {
    ...model, 
    shape: mapRC(model.shape, ([r, c]) => [r + deltaRow, c + deltaCol]),
  }
  // TODO: collision / settling onto board
}

var down = move(1, 0)
var left = move(0, -1)
var right = move(0, +1)

var View = ({ shape, board, score }) => 
  html`<div>
    <div>Score: ${score}</div>
    <${Board} rcToColorFunc=${rc =>
            shape.has(rc) ? (board.has(rc) ? 'red' : 'blue')
                          : (board.has(rc) ? 'green' : 'white')
      }/>
    <button onClick=${() => WRITE('\nmodel = left(model)')}>left</button>
    <button onClick=${() => WRITE('\nmodel = right(model)')}>right</button>
    <button onClick=${() => WRITE('\nmodel = down(model)')}>down</button>
  </div>`

// GAME HISTORY

model = newGame
model = down(model)
model = down(model)
model = left(model)
model = left(model)
model = down(model)
model = down(model)
model = left(model)
model = down(model)
model = down(model)
model = down(model)
model = right(model)
/* -- TIME TRAVEL: use Alt+Up / Alt+Down to move this line ---
*/

// Any of these forms should render:

// return View(model)

return () => View(model)

// return html`<${View} ...${model}/>`

class App extends Component { render = () => View(model) }
// return App
