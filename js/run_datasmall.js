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

// let text = "To create an interactive map area, the developer defined a rectangle by specifying its left as 50, top as 100, right as 500, and bottom as 400 coordinates.";
// let text = "To create an interactive map area, the developer defined a rectangle by specifying its left as 50, top as 100, right as 500, and bottom as 400 coordinates.";
// let text = "The graphic designer used the rect function to position a vibrant rectangle in the top-left corner of the canvas."
// let text = " To draw a rectangle on the canvas, specify its top-left corner coordinates (50, 60) and dimensions (20, 30) using the rect function."
// let text = "The rectangle function allows you to define a rectangular area by providing the coordinates of its left (10), top (20), right (90), and bottom (80) edges."
// let text = " Use the drawRect function to render a rectangle centered at the given X (45) and Y (55) coordinates, with the specified width (70) and height (40)."
// let text = "Create a new rectangle by passing the coordinates of two opposite corners (10, 20) and (90, 80) to the makeRectangle function."
// let text  = "You can createRect with the desired dimensions by supplying the left (15) and top (25) coordinates, along with the width (50) and height (35)."
// let text  = "To define a rectangle, provide the coordinates of its top-left (30, 40) and bottom-right (70, 80) corners to the rectangle function."
// let text = " The addRectangle function accepts the starting (20, 30) and ending (80, 90) coordinates to construct a new rectangular shape. "
// let text  = "Specify two points (10, 20) and (90, 100), and the rectangleFromPoints function will create a rectangle using those as opposite corners."
// let text = " Call the newRectangle function with the desired X (55) and Y (65) coordinates, along with the width (75) and height (85), to create a new rectangular object."
// let text = "Use the buildRect function to construct a rectangle by giving its origin coordinates (35, 45) and dimensions (width: 60, height: 40)"
// let text  = "Specify two points (10, 20) and (90, 100), and the rectangleFromPoints function will create a rectangle using those as opposite corners."
// let text = "The addRectangle function accepts the starting (20, 30) and ending (80, 90) coordinates to construct a new rectangular shape."
// let text = "To define a rectangle, provide the coordinates of its top-left (30, 40) and bottom-right (70, 80) corners to the rectangle function."
// let text  =   "You can createRect with the desired dimensions by supplying the left (15) and top (25) coordinates, along with the width (50) and height (35)."
// let text =  "To draw a rectangle on the canvas, specify its top-left corner coordinates (50, 60) and dimensions (20, 30) using the rect function."
// let text   = "Draw a quadrilateral with sides measuring 7 units and 4 units."
// let text   = "Construct a planar shape with angles of 90, 90, 90, and 90 degrees."
// let text   = "Illustrate a rectangle with a length of 12 cm and a width of 8 cm."
// let text   = "Render a four-sided figure with vertices at (2, 3), (2, 7), (6, 7), and (6, 3)."
// let text   = "Generate a closed shape with adjacent sides of 5 inches and 3 inches."
// let text   = "Depict a two-dimensional figure with a perimeter of 20 meters."
// let text = "Produce a quadrilateral with opposite sides measuring 9 units and 6 units."
// let text = "Compose a rectangle with an area of 48 square feet."
// let text = "Establish a four-sided shape with coordinates (1, 2), (1, 6), (5, 6), and (5, 2)."
// let text = "Draft a geometric figure with a base of 11 cm and a height of 7 cm."
// let text = "Design a rectangle with a diagonal length of 10 units."
// let text = "Formulate a four-sided polygon with vertices at (-2, 4), (-2, 8), (3, 8), and (3, 4)."
// let text = "Delineate a quadrilateral with adjacent sides of 6 inches and 4 inches."
// let text = "Manifest a closed shape with a perimeter of 24 meters."
// let text = "Originate a rectangle with a length of 15 cm and a width of 10 cm."
// let text = "Articulate a four-sided figure with coordinates (0, 0), (0, 5), (8, 5), and (8, 0)."
// let text = "Conceive a two-dimensional shape with adjacent sides measuring 7 units and 5 units."
// let text = "Visualize a rectangle with an area of 63 square inches."
// let text = "Convey a four-sided polygon with vertices at (-1, 2), (-1, 6), (4, 6), and (4, 2)."
// let text = "Characterize a planar shape with a base of 9 cm and a height of 6 cm."
// let text = "Sketch a quadrilateral with opposite sides measuring 8 units and 4 units."
// let text = "Construct a rectangle with a diagonal length of 13 units."
// let text = "Draw a four-sided figure with coordinates (2, 1), (2, 6), (7, 6), and (7, 1)."
// let text = "Create a closed shape with adjacent sides of 6 units and 4 units."
// let text = "Outline a two-dimensional figure with a perimeter of 28 meters."
// let text = "Form a rectangle with a length of 18 cm and a width of 12 cm."
// let text = "Depict a quadrilateral with vertices at (0, 0), (0, 7), (5, 7), and (5, 0)."
// let text = "Produce a four-sided shape with an area of 72 square feet."
// let text    = "Render a geometric figure with adjacent sides measuring 9 units and 6 units."
// let text = "Generate a rectangle with coordinates (-2, 3), (-2, 8), (4, 8), and (4, 3)."
// let text = "Craft a two-dimensional polygon with a base of 12 cm and a height of 8 cm."
// let text = "Develop a quadrilateral with opposite sides of 7 units and 5 units."
// let text = "Establish a rectangle with a diagonal length of 15 units."
// let text = "Lay out a four-sided shape with vertices at (1, 1), (1, 6), (6, 6), and (6, 1)."
// let text = "Portray a planar figure with a perimeter of 32 meters."
// let text = "To define a rectangle, provide the coordinates of its top-left (30, 40) and bottom-right (70, 80) corners to the rectangle function."
// let text = "To create an interactive map area, the developer defined a rectangle by specifying its left as 50, top as 100, right as 500, and bottom as 400 coordinates."
// let text  = "Describe a rectangle in the context of a billboard that is 20 feet wide and 10 feet high."
// let text  = "Imagine a rectangular room that is 15 feet long and 12 feet wide. How would you decorate it?"
// let text  = "Describe a rectangular garden plot that is 30 feet long and 20 feet wide."
// let text  = "How would you design a rectangular swimming pool that is 25 meters long and 10 meters wide?"
// let text  = "Describe a rectangular painting that is 60 cm wide and 80 cm tall."
// let text  = "Imagine a rectangular window that is 1. meter wide and 1.5 meters tall. What view would you like to see through it?"
// let text  = "Describe a rectangular rug that is 3 meters long and 2 meters wide. What pattern would it have?"
// let text  = "Imagine a rectangular cake that is 30 cm long and 20 cm wide. What flavor would it be?"
let text = "add a circle of 10 radius"
// let text  = "Describe a rectangular mirror that is 50 cm wide and 70 cm tall."
// let text  = "How would you arrange furniture in a rectangular living room that is 6 meters long and 4 meters wide?"
// let text  = "Describe a rectangular park that is 200 meters long and 100 meters wide."
// let text  = "Imagine a rectangular field that is 500 meters long and 300 meters wide. What crops would you plant?"
// let text  = "Describe a rectangular pond that is 100 meters long and 50 meters wide."
// let text  = "How would you design a rectangular playground that is 50 meters long and 30 meters wide?"
// let text  = "Describe a rectangular stage that is 10 meters wide and 5 meters deep. What performance would take place?"
// let text  = "Imagine a rectangular dining table that is 2 meters long and 1 meter wide. What meal would be served?"
// let text  = "Describe a rectangular bookshelf that is 2 meters tall and 1 meter wide. What books would it hold?"
// let text  = "How would you design a rectangular kitchen that is 4 meters long and 3 meters wide?"
// let text  = "Describe a rectangular terrace that is 5 meters long and 3 meters wide. What plants would you place?"

// let text  = "Imagine a rectangular photo frame that is 30 cm wide and 20 cm tall. What picture would it hold?"

let doc = nlp(text)
let words = text.split(' ')

let filtered_words = words.filter(word => !stopwords.includes(word))

let filtered_text = filtered_words.join(' ')

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

            if (['x', 'left', 'corner'].some(word => total_token.includes(word)) || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                x_values.push(num)
                x++
                console.log(`Added ${num} to x_values: ${x_values}`);
            } else if (['y', 'top'].some(word => total_token.includes(word)) || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
                y_values.push(num)
                y++
            } else if (total_token.includes('width') || (total_token.includes('sides') && doc.text().includes('quadrilateral'))) {
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

console.log(`x: ${x_values}, y: ${y_values}, width: ${width_values}, height: ${height_values}`)

console.log("var_counts",var_counts);

console.log(var_counts['x'] + var_counts['y'] + var_counts['width'] + var_counts['height']);

console.log("value_count",value_count);

// console.log(value_count[x]);

console.log(x+y+z+w);

if (x+y+z+w < value_count && value_count < 4) {
    let values = doc.values().toNumber().out('array');
    if (values.length >= 2) {

        if (x_values.length === 0 && y_values.length === 0) {
            console.log('width_values :>> ', width_values);
            console.log('height_values :>> ', height_values);
            console.log('width_values.length :>> ', width_values.length);
            console.log('height_values.length :>> ', height_values.length);
            if (width_values.length === 0 ){width_values.push(values[0]);
            console.log("width added first");}
            if (height_values.length === 0){height_values.push(values[1])}
            console.log(`Assumed width: ${values[ width_values.length-1]}, height: ${values[height_values.length - 1]}`);
        }

        else if (width_values.length === 0 && height_values.length === 0) {
            console.log("thank you")
        }
    
    
    }
}

if (var_counts['x'] >= 2 && var_counts['y'] >= 2) {
    let width = Math.abs(Math.max(...x_values) - Math.min(...x_values));
    let height = Math.abs(Math.max(...y_values) - Math.min(...y_values));
    console.log(Math.max(...x_values));
    console.log(Math.min(...x_values));
    console.log(Math.max(...y_values));
    console.log(Math.min(...y_values));
    width_values.push(width);
    height_values.push(height);
    console.log(`Calculated width: ${width}, height: ${height}`);
}

console.log(`x: ${x_values[0] || 0}, y: ${y_values[0] || 0}, width: ${width_values[0] || 100}, height: ${height_values[0] || 100}`)


