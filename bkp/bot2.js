const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

const client = new Client();
const userSelections = {}; // Store user selections

// Dynamic Data Storage
let courses = {
    "1": "Web Development",
    "2": "Data Science"
};

let files = {}; // Store uploaded files
let links = {}; // Store links

// Function to generate the course list message dynamically
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

// Function to generate the links list
const generateLinkList = () => {
    if (Object.keys(links).length === 0) return "No links available.";
    let linkList = "🔗 *Available Links:*\n";
    for (const key in links) {
        linkList += `${key}. ${links[key]}\n`;
    }
    return linkList;
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
                // Send a PDF file dynamically
                const filePath = path.join(__dirname, 'dummy.pdf'); // Ensure this file exists
                const media = MessageMedia.fromFilePath(filePath);
                await client.sendMessage(chatId, media, { caption: "Here is your requested PDF file: dummy.pdf" });

            } else if (selectedCourse === "Link") {
                // Send a link
                await client.sendMessage(chatId, "Here is your requested link: http://advitsoft.com/");

            } else {
                // General course selection message
                await client.sendMessage(chatId, `Welcome to *${selectedCourse}* course!`);
            }

            delete userSelections[chatId]; // Clear session

        } else if (text.toLowerCase() === "no") {
            client.sendMessage(chatId, "Selection canceled. Type *start* to choose again.");
            delete userSelections[chatId];
        }

    } else if (text.startsWith("add_course:")) {
        // Add new course dynamically
        const newCourseName = text.replace("add_course:", "").trim();
        if (newCourseName) {
            const newKey = (Object.keys(courses).length + 1).toString();
            courses[newKey] = newCourseName;
            client.sendMessage(chatId, `✅ Course *${newCourseName}* added successfully!\n\n${generateCourseList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ Please provide a valid course name! Example: `add_course: AI Basics`");
        }

    } else if (text.startsWith("remove_course:")) {
        // Remove course dynamically
        const courseKey = text.replace("remove_course:", "").trim();
        if (courses[courseKey]) {
            const removedCourse = courses[courseKey];
            delete courses[courseKey];
            client.sendMessage(chatId, `🗑 Course *${removedCourse}* removed successfully!\n\n${generateCourseList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ Invalid course number! Please check the list by typing *start*.");
        }
    }

    // ✅ **1. Handle File Upload (Auto-Save)**
    if (message.hasMedia) {
        const media = await message.downloadMedia();
        const fileName = `file_${Date.now()}.${media.mimetype.split('/')[1]}`;
        files[fileName] = fileName;

        // Save file locally
        fs.writeFileSync(`./${fileName}`, media.data, { encoding: 'base64' });

        client.sendMessage(chatId, `✅ *File uploaded successfully!*\n\n${generateFileList()}`);
        return;
    }

    // ✅ **2. Manually Add File via Link**
    if (text.startsWith("add_file:")) {
        const fileUrl = text.replace("add_file:", "").trim();
        if (fileUrl.startsWith("http")) {
            const newKey = (Object.keys(files).length + 1).toString();
            files[newKey] = fileUrl;
            client.sendMessage(chatId, `✅ *File added successfully!*\n\n${generateFileList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid file link!* Please use: `add_file: https://example.com/file.pdf`");
        }
        return;
    }

    // ✅ **3. View Files**
    if (text.toLowerCase() === "files") {
        client.sendMessage(chatId, generateFileList());
        return;
    }

    // ✅ **4. Remove File**
    if (text.startsWith("remove_file:")) {
        const fileKey = text.replace("remove_file:", "").trim();
        if (files[fileKey]) {
            const removedFile = files[fileKey];
            delete files[fileKey];

            client.sendMessage(chatId, `🗑 *File removed successfully!*\n\n${generateFileList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid file number!* Type `files` to check available files.");
        }
        return;
    }

    // ✅ **5. Add Link**
    if (text.startsWith("add_link:")) {
        const linkUrl = text.replace("add_link:", "").trim();
        if (linkUrl.startsWith("http")) {
            const newKey = (Object.keys(links).length + 1).toString();
            links[newKey] = linkUrl;
            client.sendMessage(chatId, `✅ *Link added successfully!*\n\n${generateLinkList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid link!* Please use: `add_link: http://example.com/`");
        }
        return;
    }

    // ✅ **6. View Links**
    if (text.toLowerCase() === "links") {
        client.sendMessage(chatId, generateLinkList());
        return;
    }

    // ✅ **7. Remove Link**
    if (text.startsWith("remove_link:")) {
        const linkKey = text.replace("remove_link:", "").trim();
        if (links[linkKey]) {
            const removedLink = links[linkKey];
            delete links[linkKey];

            client.sendMessage(chatId, `🗑 *Link removed successfully!*\n\n${generateLinkList()}`);
        } else {
            client.sendMessage(chatId, "⚠️ *Invalid link number!* Type `links` to check available links.");
        }
        return;
    }
});

// QR Code Event for Authentication
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Initialize Client
client.initialize();
