// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // parse JSON in request bodies

// Serve everything in 'public' as static files (index.html, script.js, bad.csv, etc.)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000; // or whichever port you like

// Path to your 'good words' CSV (instead of a MySQL table)
const contributedCSV = path.join(__dirname, 'contributed-words.csv');

/**
 * Load all words from contributed-words.csv as an array of objects:
 * [
 *   { word: 'example', cnt: 3 },
 *   { word: 'another', cnt: 1 },
 *   ...
 * ]
 */
function loadWordsCSV() {
    if (!fs.existsSync(contributedCSV)) {
        return [];
    }
    const data = fs.readFileSync(contributedCSV, 'utf-8');
    return data
        .split(/\r?\n/)     // split on newlines
        .map(line => line.trim())
        .filter(line => line.length > 0) // remove empty lines
        .map(line => {
            // Each line is "word,cnt"
            const [rawWord, rawCnt] = line.split(',');
            return {
                word: (rawWord || '').trim(),
                cnt: parseInt(rawCnt, 10) || 0
            };
        });
}

/**
 * Save an array of { word, cnt } objects back to contributed-words.csv
 */
function saveWordsCSV(items) {
    // Each line => "word,cnt"
    const lines = items.map(item => `${item.word},${item.cnt}`);
    fs.writeFileSync(contributedCSV, lines.join('\n'), 'utf-8');
}

/* ------------------------------------------------------------------
   GET /api/goodwords
   Replacement for "grab.php" 
   (old code did: SELECT * FROM guesses ORDER BY cnt ASC)
   Here we just sort by cnt ascending and return the JSON array.
   ------------------------------------------------------------------ */
app.get('/api/goodwords', (req, res) => {
    let items = loadWordsCSV();
    // Sort by cnt ascending
    items.sort((a, b) => a.cnt - b.cnt);
    res.json(items); // e.g. [ {word: 'alpha', cnt: 1}, ... ]
});

/* ------------------------------------------------------------------
   POST /api/log
   Replacement for "log.php"
   Old code did "INSERT INTO guesses (word, cnt) VALUES(...) 
   ON DUPLICATE KEY UPDATE cnt=cnt+1"

   We'll replicate that logic in CSV form:
   If the 'word' is found, increment its cnt; if not, add a new line.
   ------------------------------------------------------------------ */
app.post('/api/log', (req, res) => {
    const { word } = req.body;
    if (!word || !word.trim()) {
        return res.status(400).json({ error: 'No valid "word" provided.' });
    }

    const items = loadWordsCSV();
    const cleanWord = sanitize(word);

    // Find existing row
    const existing = items.find(item => item.word === cleanWord);
    if (existing) {
        existing.cnt++;
    } else {
        // Add new entry
        items.push({ word: cleanWord, cnt: 1 });
    }

    saveWordsCSV(items);

    res.json({ success: true, word: cleanWord });
});

/* ------------------------------------------------------------------
   POST /api/new
   Replacement for "new.php"
   Same "ON DUPLICATE KEY UPDATE cnt=cnt+1" logic, but for user-submitted words
   We'll store them in the same CSV for simplicity.
   ------------------------------------------------------------------ */
app.post('/api/new', (req, res) => {
    const { word } = req.body;
    if (!word || !word.trim()) {
        return res.status(400).json({ error: 'No valid "word" provided.' });
    }

    const items = loadWordsCSV();
    const cleanWord = sanitize(word);

    const existing = items.find(item => item.word === cleanWord);
    if (existing) {
        existing.cnt++;
    } else {
        items.push({ word: cleanWord, cnt: 1 });
    }

    saveWordsCSV(items);

    res.json({ success: true, word: cleanWord });
});

/**
 * Very basic "sanitize" function. 
 * In practice, you'd want a more robust approach or library for HTML/etc. 
 */
function sanitize(input) {
    return input.replace(/[<>]/g, ''); // remove angle brackets
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
