// Lab Task 3b: JavaScript arrays and functions (7 programs)

// 1. Second largest element without sorting (single loop)
function secondLargest(arr) {
  let first = -Infinity, second = -Infinity;
  for (const n of arr) {
    if (n > first) { second = first; first = n; }
    else if (n > second && n !== first) { second = n; }
  }
  return second === -Infinity ? null : second;
}

// 2. Rotate an array left or right by k positions
function rotate(arr, k, direction = "left") {
  const n = arr.length;
  k = ((k % n) + n) % n;
  return direction === "left" ? [...arr.slice(k), ...arr.slice(0, k)] : [...arr.slice(n - k), ...arr.slice(0, n - k)];
}

// 3. Prime numbers in an array using filter and a helper function
const isPrime = n => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};
const primesIn = arr => arr.filter(isPrime);

// 4. find, findIndex, some, every, includes on a product list
const products = [
  { name: "Pen", price: 10, inStock: true },
  { name: "Notebook", price: 60, inStock: true },
  { name: "Calculator", price: 650, inStock: false },
  { name: "Geometry box", price: 120, inStock: true }
];

// 5. Merge two sorted arrays into one sorted array (two-pointer method)
function mergeSorted(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return out.concat(a.slice(i), b.slice(j));
}

// 6. Split an array into chunks, and flatten a nested array (recursion)
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function flatten(arr) {
  return arr.reduce((acc, x) => (Array.isArray(x) ? acc.concat(flatten(x)) : acc.concat(x)), []);
}

// 7. IIFE, currying and rest parameters
const app = (function () {
  const version = "1.0";
  return { info: () => `Calculator module v${version} (created by an IIFE)` };
})();
const multiply = a => b => a * b;            // currying
const double = multiply(2);
const sumAll = (...nums) => nums.reduce((s, n) => s + n, 0); // rest parameters

const programs = [
  ["1. Second largest element", () => {
    const a = [14, 72, 9, 72, 55, 31];
    return `Array: [${a}]\nSecond largest: ${secondLargest(a)}`;
  }],
  ["2. Rotate an array", () => {
    const a = [1, 2, 3, 4, 5, 6];
    return `Array: [${a}]\nLeft by 2: [${rotate(a, 2)}]\nRight by 2: [${rotate(a, 2, "right")}]`;
  }],
  ["3. Prime numbers in an array", () => {
    const a = [2, 9, 11, 15, 17, 21, 23, 1, 29];
    return `Array: [${a}]\nPrimes: [${primesIn(a)}]`;
  }],
  ["4. find, findIndex, some, every, includes", () => {
    const names = products.map(p => p.name);
    return `First item over Rs 100 (find): ${products.find(p => p.price > 100).name}\n` +
      `Index of Notebook (findIndex): ${products.findIndex(p => p.name === "Notebook")}\n` +
      `Any item out of stock (some): ${products.some(p => !p.inStock)}\n` +
      `All items under Rs 1000 (every): ${products.every(p => p.price < 1000)}\n` +
      `Names include "Pen" (includes): ${names.includes("Pen")}`;
  }],
  ["5. Merge two sorted arrays", () => {
    const a = [1, 4, 9, 12], b = [2, 3, 10, 15, 20];
    return `A: [${a}]  B: [${b}]\nMerged: [${mergeSorted(a, b)}]`;
  }],
  ["6. Chunk and flatten", () => {
    const a = [1, 2, 3, 4, 5, 6, 7];
    const nested = [1, [2, [3, [4, 5]]], 6];
    return `Chunks of 3: ${JSON.stringify(chunk(a, 3))}\nFlatten ${JSON.stringify(nested)}: [${flatten(nested)}]`;
  }],
  ["7. IIFE, currying and rest parameters", () =>
    `${app.info()}\nmultiply(3)(4) = ${multiply(3)(4)}, double(21) = ${double(21)}\nsumAll(5, 10, 15, 20) = ${sumAll(5, 10, 15, 20)}`]
];

if (typeof document !== "undefined") {
  const select = document.getElementById("program");
  const output = document.getElementById("result");
  programs.forEach(([title], i) => select.add(new Option(title, i)));
  const show = () => { output.textContent = programs[select.value][1](); };
  select.addEventListener("change", show);
  document.getElementById("runAll").addEventListener("click", () => {
    output.textContent = programs.map(([t, fn]) => `${t}\n${fn()}`).join("\n\n");
  });
  show();
} else {
  programs.forEach(([t, fn]) => console.log(`\n${t}\n${fn()}`));
}
