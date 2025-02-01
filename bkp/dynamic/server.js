const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());

// Serve static files from the 'dynamic' folder
app.use(express.static(path.join(__dirname)));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Route to handle course selection
app.post('/select-course', (req, res) => {
    const { course } = req.body;

    let courseNames = {
        "1": "Web Development",
        "2": "Data Science",
        "3": "File (PDF)",
        "4": "Link"
    };

    let message;
    if (course === "3") {
        message = "Here is your PDF: dummy.pdf"; // You can send a file here
    } else if (course === "4") {
        message = "Here is your requested link: http://advitsoft.com/";
    } else {
        message = `Welcome to ${courseNames[course]} course!`;
    }

    res.json({ message });
});

// Start server
app.listen(3000, () => console.log("✅ Server running on port 3000"));
