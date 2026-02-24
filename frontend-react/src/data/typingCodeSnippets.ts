/**
 * Code snippets for coding typing practice (ChaiTyper-style).
 * Covers: functions, arrays, async, classes, conditionals, objects, destructuring,
 * spread/rest, loops, promises, try/catch, HTML, and more.
 */
export const TYPING_CODE_SNIPPETS = {
  javascript: [
    // Functions
    `function add(a, b) {
  return a + b;
}

const result = add(2, 3);
console.log(result);`,
    `const multiply = (x, y) => x * y;
const square = n => n * n;
const greet = name => \`Hello, \${name}\`;`,
    `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
    // Arrays
    `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = doubled.reduce((a, b) => a + b, 0);`,
    `const items = [10, 20, 30, 40];
const filtered = items.filter(x => x > 25);
const found = items.find(x => x === 30);`,
    `const arr = [1, 2, 3];
const copy = [...arr];
const merged = [...arr, 4, 5, 6];`,
    `const nums = [3, 1, 4, 1, 5];
nums.sort((a, b) => a - b);
const reversed = [...nums].reverse();`,
    `const matrix = [[1, 2], [3, 4]];
const flat = matrix.flat();
const mapped = matrix.flatMap(row => row);`,
    // Async & Promises
    `async function fetchUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  const data = await res.json();
  return data;
}`,
    `const loadData = () => {
  return fetch("/api/data")
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
};`,
    `async function fetchAll(urls) {
  const results = await Promise.all(
    urls.map(url => fetch(url).then(r => r.json()))
  );
  return results;
}`,
    // Conditionals & loops
    `if (score >= 90) {
  grade = "A";
} else if (score >= 80) {
  grade = "B";
} else {
  grade = "C";
}`,
    `for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

for (const item of arr) {
  console.log(item);
}`,
    `const status = score >= 60 ? "pass" : "fail";
const name = user?.profile?.name ?? "Guest";`,
    `switch (day) {
  case "mon":
    return "Monday";
  case "tue":
    return "Tuesday";
  default:
    return "Unknown";
}`,
    // Objects & classes
    `class Counter {
  constructor() {
    this.count = 0;
  }
  increment() {
    this.count++;
  }
}`,
    `const user = {
  name: "Alice",
  age: 25,
  greet() {
    return \`Hello, \${this.name}\`;
  }
};`,
    `class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return \`\${this.name} makes a sound\`;
  }
}

class Dog extends Animal {
  speak() {
    return \`\${this.name} barks\`;
  }
}`,
    // Destructuring & rest
    `const { name, age } = user;
const [first, second, ...rest] = arr;

function log(...args) {
  console.log(args);
}`,
    `const config = { host: "localhost", port: 3000 };
const { host, port } = config;
const url = \`http://\${host}:\${port}\`;`,
    // Try/catch & validation
    `try {
  const data = JSON.parse(input);
  return data;
} catch (e) {
  console.error("Parse failed", e);
  return null;
}`,
    `if (!value) throw new Error("Value is required");
if (typeof id !== "number") return;

const safe = value ?? defaultValue;`,
    // Dates & utils
    `const now = new Date();
const iso = now.toISOString();
const stamp = Date.now();`,
    `const str = "hello world";
const upper = str.toUpperCase();
const words = str.split(" ");
const joined = words.join("-");`,
    `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    `const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const search = debounce((q) => fetchResults(q), 300);`,
  ],
  typescript: [
    `function add(a: number, b: number): number {
  return a + b;
}

const result = add(2, 3);`,
    `interface User {
  id: number;
  name: string;
  email?: string;
}

const user: User = { id: 1, name: "Alice" };`,
    `const fetchUser = async (id: number): Promise<User> => {
  const res = await fetch(\`/api/users/\${id}\`);
  const data = await res.json();
  return data;
};`,
    `type Status = "pending" | "success" | "error";

const setStatus = (s: Status) => {
  state.status = s;
};`,
    `function identity<T>(arg: T): T {
  return arg;
}

const num = identity(42);
const str = identity("hello");`,
    `class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(\`\${this.baseUrl}\${path}\`);
    return res.json();
  }
}`,
    `const map = new Map<string, number>();
map.set("a", 1);
map.set("b", 2);
const val = map.get("a");`,
    `type Handler = (event: Event) => void;

const handlers: Handler[] = [];
handlers.push((e) => console.log(e));`,
    `enum HttpStatus {
  Ok = 200,
  NotFound = 404,
  ServerError = 500,
}

const handleResponse = (status: HttpStatus) => {
  switch (status) {
    case HttpStatus.Ok:
      return "Success";
    default:
      return "Error";
  }
};`,
    `interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

async function request<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  const data = await res.json();
  return { data, status: res.status };
}`,
  ],
  html: [
    `<div class="container">
  <h1>Welcome</h1>
  <p>Hello, world!</p>
  <button onclick="submit()">Submit</button>
</div>`,
    `<form action="/login" method="post">
  <input type="email" placeholder="Email" />
  <input type="password" placeholder="Password" />
  <button type="submit">Log in</button>
</form>`,
    `<ul class="list">
  <li>Item one</li>
  <li>Item two</li>
  <li>Item three</li>
</ul>`,
    `<nav class="navbar">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>`,
    `<section class="hero">
  <h1>Welcome to the site</h1>
  <p>Build something great.</p>
  <button class="cta">Get started</button>
</section>`,
    `<article class="post">
  <header>
    <h2>Post title</h2>
    <time datetime="2025-01-01">Jan 1, 2025</time>
  </header>
  <p>Content goes here.</p>
</article>`,
    `<table>
  <thead>
    <tr><th>Name</th><th>Score</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>95</td></tr>
    <tr><td>Bob</td><td>87</td></tr>
  </tbody>
</table>`,
    `<img src="photo.jpg" alt="Description" width="400" height="300" />

<a href="https://example.com" target="_blank" rel="noopener">
  Visit site
</a>`,
    `<div class="card">
  <img src="thumb.png" alt="Card" />
  <div class="card-body">
    <h3>Card title</h3>
    <p>Card description text.</p>
  </div>
</div>`,
    `<header>
  <h1>Site name</h1>
  <nav aria-label="Main">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/docs">Docs</a></li>
    </ul>
  </nav>
</header>
<main>Content</main>
<footer>&copy; 2025</footer>`,
    `<label for="username">Username</label>
<input id="username" type="text" name="username" required />

<select name="country">
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
</select>`,
    `<script src="app.js" defer></script>
<link rel="stylesheet" href="styles.css" />

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />`,
  ],
  python: [
    `def add(a: int, b: int) -> int:
    return a + b

result = add(2, 3)
print(result)`,
    `def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
    `numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
total = sum(doubled)`,
    `def fetch_user(user_id: int):
    response = requests.get(f"/api/users/{user_id}")
    return response.json()`,
    `with open("data.txt") as f:
    lines = f.readlines()
for line in lines:
    print(line.strip())`,
    `class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1`,
  ],
  sql: [
    `SELECT id, name, email
FROM users
WHERE status = 'active'
ORDER BY created_at DESC;`,
    `SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;`,
    `INSERT INTO products (name, price, category)
VALUES ('Widget', 19.99, 'tools');`,
    `UPDATE users
SET last_login = NOW()
WHERE id = :user_id;`,
    `SELECT * FROM orders
WHERE created_at BETWEEN '2025-01-01' AND '2025-01-31'
LIMIT 100;`,
    `CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  start_time TIMESTAMP
);`,
  ],
} as const;

export type CodeLanguage = keyof typeof TYPING_CODE_SNIPPETS;

export function getRandomCodeSnippet(lang: CodeLanguage): string {
  const list = TYPING_CODE_SNIPPETS[lang];
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Token types for syntax highlighting (character-level).
 */
export type TokenType = "keyword" | "string" | "comment" | "number" | "operator" | "function" | "punctuation" | "property" | "default";

interface Token {
  type: TokenType;
  start: number;
  end: number;
  value: string;
}

const JS_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "class", "extends", "constructor", "async", "await", "new", "this", "true", "false",
  "null", "undefined", "in", "of", "try", "catch", "finally", "import", "export", "default",
]);

function tokenizeJavaScript(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = code.length;

  while (i < n) {
    const start = i;
    const c = code[i];

    // Single-line comment
    if (c === "/" && code[i + 1] === "/") {
      let end = i + 2;
      while (end < n && code[end] !== "\n") end++;
      tokens.push({ type: "comment", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Multi-line comment
    if (c === "/" && code[i + 1] === "*") {
      let end = i + 2;
      while (end < n - 1 && (code[end] !== "*" || code[end + 1] !== "/")) end++;
      end += 2;
      tokens.push({ type: "comment", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // String double
    if (c === '"') {
      let end = i + 1;
      while (end < n) {
        if (code[end] === "\\") end += 2;
        else if (code[end] === '"') { end++; break; }
        else end++;
      }
      tokens.push({ type: "string", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // String single
    if (c === "`" || c === "'") {
      const quote = c;
      let end = i + 1;
      while (end < n) {
        if (code[end] === "\\") end += 2;
        else if (code[end] === quote) { end++; break; }
        else end++;
      }
      tokens.push({ type: "string", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Number
    if (/\d/.test(c)) {
      let end = i;
      while (end < n && /[\d.]/.test(code[end])) end++;
      tokens.push({ type: "number", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(c)) {
      let end = i;
      while (end < n && /[a-zA-Z0-9_$]/.test(code[end])) end++;
      const value = code.slice(i, end);
      const type = JS_KEYWORDS.has(value) ? "keyword" : value === "function" ? "keyword" : "default";
      tokens.push({ type, start: i, end, value });
      i = end;
      continue;
    }

    // Operator / punctuation
    if (/[+\-*/%=<>!&|.,;:?{}()[\]\\]/.test(c)) {
      tokens.push({ type: "operator", start: i, end: i + 1, value: c });
      i++;
      continue;
    }

    // Newline, space, etc.
    tokens.push({ type: "default", start: i, end: i + 1, value: code[i] });
    i++;
  }

  return tokens;
}

function tokenizeHtml(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = code.length;

  while (i < n) {
    const start = i;
    const c = code[i];

    if (c === "<") {
      let end = i + 1;
      if (code[end] === "/") end++;
      while (end < n && /[a-zA-Z0-9-]/.test(code[end])) end++;
      tokens.push({ type: "keyword", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      let end = i + 1;
      while (end < n && code[end] !== quote) end++;
      end++;
      tokens.push({ type: "string", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }
    tokens.push({ type: "default", start: i, end: i + 1, value: code[i] });
    i++;
  }
  return tokens;
}

export function getTokenTypeAt(code: string, index: number, lang: CodeLanguage): TokenType {
  const tokens =
    lang === "html" ? tokenizeHtml(code) : tokenizeJavaScript(code);
  for (const t of tokens) {
    if (index >= t.start && index < t.end) return t.type;
  }
  return "default";
}

/**
 * Get CSS class for each character index (for syntax highlight).
 * HTML uses tokenizeHtml; javascript, typescript, python, sql use tokenizeJavaScript.
 */
export function getSyntaxClasses(code: string, lang: CodeLanguage): string[] {
  const tokens =
    lang === "html" ? tokenizeHtml(code) : tokenizeJavaScript(code);
  const classes: string[] = new Array(code.length).fill("ty-syntax-default");
  for (const t of tokens) {
    const cls = `ty-syntax-${t.type}`;
    for (let i = t.start; i < t.end; i++) classes[i] = cls;
  }
  return classes;
}
