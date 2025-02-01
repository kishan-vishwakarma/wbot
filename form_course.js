const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

const client = new Client();
const userSelections = {}; // Store user selections

// Dynamic Course List
let courses = {
    "1": "Web Development",
    "2": "Data Science",
    "3": "File",
    "4": "Link"
};

// Function to generate the course list message dynamically
const generateCourseList = () => {
    let courseList = "Select a course by typing the number:\n";
    for (const key in courses) {
        courseList += `${key}. ${courses[key]}\n`;
    }
    return courseList;
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
});

// QR Code Event for Authentication
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Initialize Client
client.initialize();
