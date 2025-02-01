const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');  
const qrcodeTerminal = require('qrcode-terminal'); 
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Simulate a user authentication storage (you can use a real database here)
let authenticatedUser = null;

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form2.html'));
});

// Handle form submission and generate QR code
app.post('/submit-form', async (req, res) => {
    const { name, email, mobile, gender } = req.body;

    // Format data in a single-line JSON string (easier for QR readers)
    const qrData = JSON.stringify({ name, email, mobile, gender });

    try {
        // Generate QR Code for web response
        const qrImage = await qrcode.toDataURL(qrData);

        // Generate QR Code in terminal for debugging
        console.log("QR Code for authentication:");
        qrcodeTerminal.generate(qrData, { small: true });

        res.json({ message: "Form submitted successfully!", qrImage });
    } catch (error) {
        res.status(500).json({ message: "Error generating QR code", error: error.message });
    }
});

// Simulate QR code scan and authentication (In real-world, this would come from the scanner or webhook)
app.post('/authenticate', (req, res) => {
    const { qrData } = req.body; // This should be the scanned QR data

    try {
        // Validate scanned QR data (You could add real checks here)
        if (qrData && qrData.name && qrData.email) {
            authenticatedUser = qrData;  // Store user data on successful authentication

            // Send a welcome message to the authenticated user
            res.json({
                message: "Welcome to the Bot, How may I help you?",
                user: authenticatedUser,
            });
        } else {
            res.status(400).json({ message: "Invalid QR Data" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error during authentication", error: error.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
