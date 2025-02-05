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

let text = "Draw a circle in CorelDRAW using the Ellipse tool with a startign point from 3cm and 5cm and  diameter of 5 cm.";

let doc = nlp(text)
let words = text.split(' ')
let filtered_words = words.filter(word => !stopwords.includes(word))
let filtered_text = filtered_words.join(' ')
doc = nlp(filtered_text)
let y_values = []
let x_values = []
let radius_values = []
let tokens = doc.terms().data()
let coordinates = text.match(/\((\d+), (\d+)\)/g)

if (coordinates) {
  for (let coord of coordinates) {
    let nums = coord.match(/\d+/g)
    x_values.push(parseInt(nums[0]))
    y_values.push(parseInt(nums[1]))
  }
}

let added_nums = coordinates ? [].concat.apply([], coordinates.map(coord => coord.match(/\d+/g))) : [];
let value_count = 0

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
      console.log(total_token)

      if ([' x','x ', 'left', 'center'].some(word => total_token.includes(word))) {
        x_values.push(num)
        console.log(`Added ${num} to x_values: ${x_values}`);
      } else if ([' y','y ', 'top'].some(word => total_token.includes(word))) {
        y_values.push(num)
      } else if (total_token.includes('radius')) {
        radius_values.push(num)
        console.log(num);
      }  else if (total_token.includes('diameter')) {
        radius_values.push(num/2)
        console.log(num/2);
      } 
      else if (['right', 'rhs'].some(word => total_token.includes(word))) {
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
  'radius': radius_values[radius_values.length - 1]
}

console.log(radius_values.length);
console.log(var_counts)