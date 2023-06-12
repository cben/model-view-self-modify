var w = 10
var h = 20

// Sets of coordinates are a fun representation, but JS Set doesn't support tuple keys :-(
var formatRC = JSON.stringify
var parseRC = JSON.parse

var RCSet = pairs => new Set(pairs.map(formatRC))
var mapRC = (rcset, f) => RCSet([...rcset].map(parseRC).map(f))

var shape = RCSet([[0,4], [0,5],
                   [1,4],
                   [2,4]])

var shift = (board, deltaRow, deltaCol) =>
  mapRC(board, ([r, c]) => [r + deltaRow, c + deltaCol])

var Cell = ({ rc, color }) =>
  html`<td style="border: grey solid 1px; background-color: ${color}; color: grey;">${rc}</td>`

var Board = ({ set }) => 
  html`<table>
    ${_.range(0, h).map(r =>
      html`<tr>
        ${_.range(0, w).map(c => {
          const rc = formatRC([r, c])
          const color = set.has(rc) ? 'blue' : 'white'
          return html`<${Cell} rc=${rc} color=${color}/>`
        })}
      </tr>`
    )}
  </table>`

var state = shape
state = shift(state, 1, 0)
state = shift(state, 0, 1)
state = shift(state, 1, 0)
state = shift(state, 1, 0)
state = shift(state, 1, 0)
state = shift(state, 1, 0)
state = shift(state, 1, 0)



var App = (props) =>
  html`<div>
    <div>Score: 0</div>
    <div><${Board} set=${state}/></div>
  </div>`
// window.App = App