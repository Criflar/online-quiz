// npx nodemon index.js (To run the server)

const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Parse json bodies
app.use(express.json());

// Create a connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // MySQL username (default: root)
  password: 'yourpassword', // MySQL password
  database: 'quiz_database' // database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the MySQL database.');
});

// 1. Create Route: /create
app.post('/create', (req, res) => {
  const { question, choices, answer } = req.body;

  if (!question || !choices || !answer) {
    return res.status(400).send('Question, choices, and answer are required.');
  }

  if (!choices.includes(answer)) { // Check if the answer is one of the choices
    return res.status(400).send('The answer must be one of the choices.');
  }

  const sql = 'INSERT INTO questions (question, choices, answer) VALUES (?, ?, ?)';
  const values = [question, JSON.stringify(choices), answer];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error adding question:', err);
      return res.status(500).send('Error adding question.');
    }
    res.status(201).send(`Question added with ID: ${results.insertId}`);
  });
});

// 2. Update Route: /update/:id
app.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { question, choices, answer } = req.body;

  if (!question && !choices && !answer) {
    return res.status(400).send('At least one field (question, choices, answer) is required.');
  }

  let updates = [];
  if (question) updates.push(`question = ?`);
  if (choices) updates.push(`choices = ?`);
  if (answer) updates.push(`answer = ?`);

  const sql = `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`;
  const values = [...(question ? [question] : []), ...(choices ? [JSON.stringify(choices)] : []), ...(answer ? [answer] : []), id];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error updating question:', err);
      return res.status(500).send('Error updating question.');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Question not found.');
    }
    res.send('Question updated successfully.');
  });
});

// 3. Delete Route: /delete/:id
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM questions WHERE id = ?';
  const values = [id];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error deleting question:', err);
      return res.status(500).send('Error deleting question.');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Question not found.');
    }
    res.send('Question deleted successfully.');
  });
});

// 4. Get Route: /get/:id
app.get('/get/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM questions WHERE id = ?';
  const values = [id];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error fetching question:', err);
      return res.status(500).send('Error fetching question.');
    }
    if (results.length === 0) {
      return res.status(404).send('Question not found.');
    }
    res.json(results[0]);
  });
});

// 5. List Route: /list
app.get('/list', (req, res) => {
  const sql = 'SELECT * FROM questions';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).send('Error fetching questions.');
    }
    res.json(results);
  });
});

// 6. Check Answer Route: /check-answer
app.post('/check-answer', (req, res) => {
  const { id, choice } = req.body;

  if (!id || !choice) {
    return res.status(400).send('ID and choice are required.');
  }

  const sql = 'SELECT answer FROM questions WHERE id = ?';
  const values = [id];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error checking answer:', err);
      return res.status(500).send('Error checking answer.');
    }
    if (results.length === 0) {
      return res.status(404).send('Question not found.');
    }

    const correctAnswer = results[0].answer;
    if (choice === correctAnswer) {
      res.send('Correct answer!');
    } else {
      res.send('Incorrect answer.');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});





