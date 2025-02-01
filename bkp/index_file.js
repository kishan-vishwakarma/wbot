const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

const client = new Client();
const userSelections = {}; // Store user selections

client.on('ready', () => {
    console.log('Client is ready!');
});


client.on('message_create', async (message) => {
    const chatId = message.from;
    const text = message.body.toLowerCase().trim();

    const courses = {
        "1": "Web Development",
        "2": "Data Science",
        "3": "File",
        "4": "Link"
    };

    if (text === 'start') {
        let courseList = "Select a course by typing the number:\n";
        for (const key in courses) {
            courseList += `${key}. ${courses[key]}\n`;
        }
        client.sendMessage(chatId, courseList);
        userSelections[chatId] = { step: "select_course" };

    } else if (userSelections[chatId]?.step === "select_course" && courses[text]) {
        userSelections[chatId].course = courses[text];
        userSelections[chatId].step = "confirm";
        client.sendMessage(chatId, `You selected *${courses[text]}*. Type *yes* to confirm or *no* to cancel.`);

    } else if (userSelections[chatId]?.step === "confirm") {
        if (text === "yes") {
            const selectedCourse = userSelections[chatId].course;

            if (selectedCourse === "File") {
                // Send a PDF file
                const filePath = path.join(__dirname, 'dummy.pdf'); // Ensure this file exists in your project directory
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

        } else if (text === "no") {
            client.sendMessage(chatId, "Selection canceled. Type *!start* to choose again.");
            delete userSelections[chatId];
        }
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.initialize();
