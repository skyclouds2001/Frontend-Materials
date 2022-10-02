const xlsx = require('node-xlsx');

const SIZE = 68;

const leaders = 5;

const rand = Math.floor(Math.random() * (SIZE - leaders) + 1) + 1 + leaders;

const [{ data }] = xlsx.parse('D:/工作/青协/2022青年志愿者协会干部层信息收集表.xlsx');

const person = data[rand];

console.log(`幸运嘉宾是 ${person[1]}`);
