const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();
const userSelections = {}; // Store user selections

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message_create', message => {
    const chatId = message.from;
    const text = message.body.toLowerCase().trim();

    const courses = {
        "1": "Web Development",
        "2": "Data Science",
        "3": "Machine Learning",
        "4": "Digital Marketing",
        "5": "PDF",
        "5": "Link"
    };

    if (text === '!start') {
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
            client.sendMessage(chatId, `Welcome to *${userSelections[chatId].course}* course!`);
            delete userSelections[chatId]; // Clear session
        } else if (text === "no") {
            client.sendMessage(chatId, "Selection canceled. Type *!start* to choose again.");
            delete userSelections[chatId];
        }
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.initialize();



// image and link  ( file )
// 