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

// Function to generate the file list
const generateFileList = () => {
    if (Object.keys(files).length === 0) return "No files available.";
    let fileList = "📂 *Available Files:*\n";
    for (const key in files) {
        fileList += `${key}. ${files[key]}\n`;
    }
    return fileList;
};

// Handle Incoming Messages
client.on('message_create', async (message) => {
    const chatId = message.from;
    const text = message.body.trim();

    // ✅ **1. Handle File Upload (Auto-Save)**
    if (message.hasMedia) {
        const media = await message.downloadMedia();
        const fileName = `file_${Date.now()}.${media.mimetype.split('/')[1]}`;
        files[fileName] = fileName;

        // Save file locally
        fs.writeFileSync(`./uploads/${fileName}`, media.data, { encoding: 'base64' });

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
});

// Initialize Client
client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('Client is ready!'));
client.initialize();
