let nlp = require('compromise')
const lexicons = nlp.model().one.lexicon;
const stopwords = [];

for(let word in lexicons) {
  if(Array.isArray(lexicons[word])) {
    if(lexicons[word].includes("Conjunction") || lexicons[word].includes("Preposition") || lexicons[word].includes("Pronoun")) {
      stopwords.push(word);
    }
  } else {
    if(lexicons[word].match("Conjunction") || lexicons[word].match("Preposition") || lexicons[word].match("Pronoun")) {
      stopwords.push(word);
    }
  }
}

console.log(stopwords)

let text = "To create an interactive map area, the developer defined a rectangle by specifying its left as 50, top as 100, right as 500, and bottom as 400 coordinates.";
// let text = "The graphic designer used the rect function to position a vibrant rectangle in the top-left corner of the canvas."
// let text = " To draw a rectangle on the canvas, specify its top-left corner coordinates (50, 60) and dimensions (20, 30) using the rect function."
// let text = "The rectangle function allows you to define a rectangular area by providing the coordinates of its left (10), top (20), right (90), and bottom (80) edges."
// let text = " Use the drawRect function to render a rectangle centered at the given X (45) and Y (55) coordinates, with the specified width (70) and height (40)."
// let text = "Create a new rectangle by passing the coordinates of two opposite corners (10, 20) and (90, 80) to the makeRectangle function."
// let text  = " You can createRect with the desired dimensions by supplying the left (15) and top (25) coordinates, along with the width (50) and height (35)."
// let text  = "To define a rectangle, provide the coordinates of its top-left (30, 40) and bottom-right (70, 80) corners to the rectangle function."
// let text = " The addRectangle function accepts the starting (20, 30) and ending (80, 90) coordinates to construct a new rectangular shape. "
// let text  = "Specify two points (10, 20) and (90, 100), and the rectangleFromPoints function will create a rectangle using those as opposite corners."
// let text = " Call the newRectangle function with the desired X (55) and Y (65) coordinates, along with the width (75) and height (85), to create a new rectangular object."
// let text = "Use the buildRect function to construct a rectangle by giving its origin coordinates (35, 45) and dimensions (width: 60, height: 40)"
// let text  = "Specify two points (10, 20) and (90, 100), and the rectangleFromPoints function will create a rectangle using those as opposite corners."
// let text = "The addRectangle function accepts the starting (20, 30) and ending (80, 90) coordinates to construct a new rectangular shape."
// let text = "To define a rectangle, provide the coordinates of its top-left (30, 40) and bottom-right (70, 80) corners to the rectangle function."
// let text  =   "You can createRect with the desired dimensions by supplying the left (15) and top (25) coordinates, along with the width (50) and height (35)."
// let text =  " To draw a rectangle on the canvas, specify its top-left corner coordinates (50, 60) and dimensions (20, 30) using the rect function."

// let text   = "00Draw a quadrilateral with sides measuring 7 units and 4 units."

// let text   = "00Construct a planar shape with angles of 90, 90, 90, and 90 degrees."
// let text   = " Illustrate a rectangle with a length of 12 cm and a width of 8 cm."
// let text   = "2200Render a four-sided figure with vertices at (2, 3), (2, 7), (6, 7), and (6, 3)."
// let text   = "0000Generate a closed shape with adjacent sides of 5 inches and 3 inches."
// let text   = "0000 Depict a two-dimensional figure with a perimeter of 20 meters."
// let text = "0000 Produce a quadrilateral with opposite sides measuring 9 units and 6 units."
// let text = "Compose a rectangle with an area of 48 square feet."
// let text = "2200Establish a four-sided shape with coordinates (1, 2), (1, 6), (5, 6), and (5, 2)."
// let text = "0001 Draft a geometric figure with a base of 11 cm and a height of 7 cm."
// let text = "Design a rectangle with a diagonal length of 10 units."
// let text = "1200Formulate a four-sided polygon with vertices at (-2, 4), (-2, 8), (3, 8), and (3, 4)."
// let text = "1000Delineate a quadrilateral with adjacent sides of 6 inches and 4 inches."
// let text = "0000Manifest a closed shape with a perimeter of 24 meters."
// let text = "0010Originate a rectangle with a length of 15 cm and a width of 10 cm."
// let text = "2200Articulate a four-sided figure with coordinates (0, 0), (0, 5), (8, 5), and (8, 0)."
// let text = "0000Conceive a two-dimensional shape with adjacent sides measuring 7 units and 5 units."
// let text = "0000Visualize a rectangle with an area of 63 square inches."
// let text = "1200Convey a four-sided polygon with vertices at (-1, 2), (-1, 6), (4, 6), and (4, 2)."
// let text = "0001Characterize a planar shape with a base of 9 cm and a height of 6 cm."
// let text = "0000Sketch a quadrilateral with opposite sides measuring 8 units and 4 units."
// let text = "Construct a rectangle with a diagonal length of 13 units."
// let text = "2200Draw a four-sided figure with coordinates (2, 1), (2, 6), (7, 6), and (7, 1)."
// let text = "0000Create a closed shape with adjacent sides of 6 units and 4 units."
// let text = "0000Outline a two-dimensional figure with a perimeter of 28 meters."
// let text = "0010Form a rectangle with a length of 18 cm and a width of 12 cm."
// let text = "2200Depict a quadrilateral with vertices at (0, 0), (0, 7), (5, 7), and (5, 0)."
// let text = "0000Produce a four-sided shape with an area of 72 square feet."
// let text    = "Render a geometric figure with adjacent sides measuring 9 units and 6 units."
// let text = "1200Generate a rectangle with coordinates (-2, 3), (-2, 8), (4, 8), and (4, 3)."
// let text = "0001Craft a two-dimensional polygon with a base of 12 cm and a height of 8 cm."
// let text = "1000Develop a quadrilateral with opposite sides of 7 units and 5 units."
// let text = "0000Establish a rectangle with a diagonal length of 15 units."
// let text = "2200Lay out a four-sided shape with vertices at (1, 1), (1, 6), (6, 6), and (6, 1)."
// let text = "0000Portray a planar figure with a perimeter of 32 meters."
// let text = "2200To define a rectangle, provide the coordinates of its top-left (30, 40) and bottom-right (70, 80) corners to the rectangle function."
// let text = "2200To create an interactive map area, the developer defined a rectangle by specifying its left as 50, top as 100, right as 500, and bottom as 400 coordinates."

let doc = nlp(text)
let words = text.split(' ')

let filtered_words = words.filter(word => !stopwords.includes(word))

let filtered_text = filtered_words.join(' ')

function identifyShape(text) {
    let doc = nlp(text)
    
    let shapes = ['circle', 'square', 'rectangle', 'triangle', 'quadrilateral', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'nonagon', 'decagon']
    
    for (let shape of shapes) {
        if (doc.has(shape)) {
            return shape
        }
    }
    
    return 'No shape found'
}

console.log(identifyShape(text))  
doc = nlp(filtered_text)

let x_values = []
let y_values = []
let width_values = []
let height_values = []

let tokens = doc.terms().data()

let coordinates = text.match(/\((\d+), (\d+)\)/g)

if (coordinates) {
    for (let coord of coordinates) {
        let nums = coord.match(/\d+/g)
        x_values.push(parseInt(nums[0]))
        y_values.push(parseInt(nums[1]))
    }
}

let added_nums = coordinates ? [].concat.apply([], coordinates.map(coord => coord.match(/\d+/g))) : []

let value_count = 0
let x = 0 
let y = 0 
let z = 0
let w = 0
for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    let terms = token.terms
    for (let term of terms) {
        if (term.tags && term.tags.includes('Value')) {
            let num = parseInt(term.text)
            value_count++
            if (added_nums.includes(num)) {
                continue
            }

            let prev_token = i > 0 ? tokens[i - 1].text.toLowerCase() : ""
            let next_token = i < tokens.length - 1 ? tokens[i + 1].text.toLowerCase() : ""
            let total_token = prev_token + ' ' + next_token 
            console.log('total_token :>> ', total_token);
            if (['x', 'left', 'corner'].some(word => total_token.includes(word)) || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                x_values.push(num)
                x++
            } else if (['y', 'top'].some(word => total_token.includes(word)) || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                y_values.push(num)
                y++
            } else if (total_token.includes('width') || (total_token.includes('sides') && doc.text().includes('quadrilateral')) || total_token.includes('width')) {
                width_values.push(num)
                z++
            } else if (total_token.includes('height') || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                height_values.push(num)
                w++
            } else if (['right', 'rhs'].some(word => total_token.includes(word))) {
                x_values.push(num)
            } else if (['bottom', 'down'].some(word => total_token.includes(word))) {
                y_values.push(num)
            }
        } 
    }
}

let var_counts = {
    'x': new Set(x_values).size,
    'y': new Set(y_values).size,
    'width': new Set(width_values).size,
    'height': new Set(height_values).size
}

console.log(`x: ${x_values[0] || 0}, y: ${y_values[0] || 0}, width: ${width_values[0] || 100}, height: ${height_values[0] || 100}`)
if (x+y+z+w < value_count) {
    let values = doc.values().toNumber().out('array');
    if (values.length >= 2) {

        if (x_values.length === 0 && y_values.length === 0) {
            width_values.push(values[0]);
            height_values.push(values[1]);
            console.log(`Assumed width: ${values[ width_values.length-1]}, height: ${values[height_values.length - 1]}`);
        }

        else if (width_values.length === 0 && height_values.length === 0) {
            console.log("thank you")
        }
    }
}

console.log(`x: ${x_values[0] || 0}, y: ${y_values[0] || 0}, width: ${width_values[0] || 100}, height: ${height_values[0] || 100}`)