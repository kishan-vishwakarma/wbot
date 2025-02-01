const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const express = require('express');




const app = express();

app.use(express.json());
app.use(cors());

// Serve static files from the 'dynamic' folder
app.use(express.static(path.join(__dirname)));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'bot4_form.html'));
});



const client = new Client();
const userSelections = {}; // Store user selections

// Dynamic Data Storage for Courses, Files, and Links
let courses = {
    "1": "Web Development",
    "2": "Data Science",
    "3": "File",
    "4": "Link"
};

let files = {}; // Store uploaded files
let links = {}; // Store links

// Function to generate the course list
const generateCourseList = () => {
    let courseList = "Select a course by typing the number:\n";
    for (const key in courses) {
        courseList += `${key}. ${courses[key]}\n`;
    }
    return courseList;
};

// Function to generate the file list
const generateFileList = () => {
    if (Object.keys(files).length === 0) return "No files available.";
    let fileList = "📂 *Available Files:*\n";
    for (const key in files) {
        fileList += `${key}. ${files[key]}\n`;
    }
    return fileList;
};

// Function to generate the link list
const generateLinkList = () => {
    if (Object.keys(links).length === 0) return "No links available.";
    let linkList = "🌐 *Available Links:*\n";
    for (const key in links) {
        linkList += `${key}. ${links[key]}\n`;
    }
    return linkList;
};

// Function to add a new course
const addCourse = (courseName) => {
    const newKey = (Object.keys(courses).length + 1).toString();
    courses[newKey] = courseName;
    return `✅ *Course added successfully!*\n\n${generateCourseList()}`;
};

// Function to remove a course
const removeCourse = (courseKey) => {
    if (courses[courseKey]) {
        delete courses[courseKey];
        return `🗑 *Course removed successfully!*\n\n${generateCourseList()}`;
    } else {
        return "⚠️ *Invalid course number!* Please type `courses` to check available courses.";
    }
};

// Bot Ready Event
client.on('ready', () => {
    console.log('Client is ready!');
});

// Handle Incoming Messages
client.on('message_create', async (message) => {
    const chatId = message.from;
    const text = message.body.trim();

    // Start course selection
    if (text.toLowerCase() === 'start') {
        client.sendMessage(chatId, generateCourseList());
        userSelections[chatId] = { step: "select_course" };

    } else if (userSelections[chatId]?.step === "select_course" && courses[text]) {
        // User selects a course
        userSelections[chatId].course = courses[text];
        userSelections[chatId].step = "confirm";
        client.sendMessage(chatId, `You selected *${courses[text]}*. Type *yes* to confirm or *no* to cancel.`);

    } else if (userSelections[chatId]?.step === "confirm") {
        if (text.toLowerCase() === "yes") {
            const selectedCourse = userSelections[chatId].course;

            if (selectedCourse === "File") {
                // Send the list of available files
                client.sendMessage(chatId, generateFileList());

            } else if (selectedCourse === "Link") {
                // Send the list of available links
                client.sendMessage(chatId, generateLinkList());

            } else {
                // General course selection message
                await client.sendMessage(chatId, `Welcome to *${selectedCourse}* course!`);
            }

            delete userSelections[chatId]; // Clear session

        } else if (text.toLowerCase() === "no") {
            client.sendMessage(chatId, "Selection canceled. Type *start* to choose again.");
            delete userSelections[chatId];
        }

    } else if (text.startsWith("add_file:")) {
        // Add new file dynamically
        const fileUrl = text.replace("add_file:", "").trim();
        if (fileUrl.startsWith("http")) {
            const newKey = (Object.keys(files).length + 1).toString();
            files[newKey] = fileUrl;
            client.sendMessage(chatId, `✅ *File added successfully!*\n\n${generateFileList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid file link!* Please use: `add_file: https://example.com/file.pdf`");
        }

    } else if (text.startsWith("remove_file:")) {
        // Remove file dynamically
        const fileKey = text.replace("remove_file:", "").trim();
        if (files[fileKey]) {
            const removedFile = files[fileKey];
            delete files[fileKey];

            client.sendMessage(chatId, `🗑 *File removed successfully!*\n\n${generateFileList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid file number!* Type `files` to check available files.");
        }

    } else if (text.startsWith("add_link:")) {
        // Add new link dynamically
        const newLink = text.replace("add_link:", "").trim();
        if (newLink.startsWith("http")) {
            const newKey = (Object.keys(links).length + 1).toString();
            links[newKey] = newLink;
            client.sendMessage(chatId, `✅ *Link added successfully!*\n\n${generateLinkList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid link!* Please use: `add_link: https://example.com`");
        }

    } else if (text.startsWith("remove_link:")) {
        // Remove link dynamically
        const linkKey = text.replace("remove_link:", "").trim();
        if (links[linkKey]) {
            const removedLink = links[linkKey];
            delete links[linkKey];

            client.sendMessage(chatId, `🗑 *Link removed successfully!*\n\n${generateLinkList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid link number!* Type `links` to check available links.");
        }

    } else if (text.startsWith("add_course:")) {
        // Add new course dynamically
        const newCourse = text.replace("add_course:", "").trim();
        if (newCourse) {
            const response = addCourse(newCourse);
            client.sendMessage(chatId, response);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid course name!* Please use: `add_course: Course Name`");
        }

    } else if (text.startsWith("remove_course:")) {
        // Remove course dynamically
        const courseKey = text.replace("remove_course:", "").trim();
        const response = removeCourse(courseKey);
        client.sendMessage(chatId, response);
    }
});

// Handle form submission
app.post('/submit-form', async (req, res) => {
    const { name, email, mobile, gender } = req.body; // Fix field names

    // Construct WhatsApp message
    const whatsappMessage = `📩 *New Form Submission* \n\n` +
        `*Name:* ${name}\n` +
        `*Email:* ${email}\n` +
        `*Phone:* ${mobile}\n` +
        `*Gender:* ${gender}`;

    try {
        const chatId = '919695116238@c.us'; // Fix WhatsApp number format
        await client.sendMessage(chatId, whatsappMessage);
        res.json({ success: true, message: 'Form submitted successfully!' });
    } catch (error) {
        console.error("WhatsApp Message Error:", error);
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

// QR Code Event for Authentication
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Start server
app.listen(3000, () => console.log("✅ Server running on port 3000"));

// Initialize Client
client.initialize();
