function formatString(str, startLength = 5, endLength = 5) {
    // Ensure the string is longer than the sum of startLength and endLength
    if (str.length > startLength + endLength) {
        // Take the first `startLength` characters and the last `endLength` characters
        return str.substr(0, startLength) + '...' + str.substr(-endLength);
    }
    // If the string is not long enough, return it as is
    return str;
}

const originalString = "rzknlerpmvpxsagyejpylxhyvkublluclgegyaezbbvrmmggqdftrqieoggg";
const formattedString = formatString(originalString);
console.log(formattedString);


function randomSample(str, sampleSize = 10) {
    let result = '';
    for (let i = 0; i < sampleSize; i++) {
        result += str.charAt(Math.floor(Math.random() * str.length));
    }
    return result;
}

console.log(randomSample("rzknlerpmvpxsagyejpylxhyvkublluclgegyaezbbvrmmggqdftrqieoggg"));


function simpleHash(str) {
    return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100000;
}

console.log(simpleHash("rzknlerpmvpxsagyejpylxhyvkublluclgegyaezbbvrmmggqdftrqieoggg"));

function regexReplace(str) {
    return str.replace(/[aeiou]/g, 'x').replace(/[lrpmv]/g, 'y');
}

console.log(regexReplace("rzknlerpmvpxsagyejpylxhyvkublluclgegyaezbbvrmmggqdftrqieoggg"));

function shiftString(str, shiftAmount = 1) {
    return str
        .split('')
        .map(char => String.fromCharCode(char.charCodeAt(0) + shiftAmount))
        .join('');
}

console.log(shiftString("rzknlerpmvpxsagyejpylxhyvkublluclgegyaezbbvrmmggqdftrqieoggg"));
