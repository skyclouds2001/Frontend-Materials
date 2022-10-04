const xlsx = require('node-xlsx');

const { filePath } = require('./config');

const SIZE = 68;

const leaders = 5;

const rand = Math.floor(Math.random() * (SIZE - leaders) + 1) + 1 + leaders;

const [{ data }] = xlsx.parse(filePath);

const person = data[rand];

console.log(`幸运嘉宾是 ${person[1]}`);
