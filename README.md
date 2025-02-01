# what-sApp-Bot
this is used for what'sApp bot using whatsapp-web.js docs , after setup run the project . 
it will showing QR Code , Scan from whats'app link deviced and start chating 



#automation command

📌 Final Steps

Scan the QR code again

Monitor logs with: Check Logs
1.pm2 logs whatsapp-bot

Start Your Script with PM2
pm2 start bot.js --name whatsapp-bot

Restart the bot:
2.pm2 restart whatsapp-bot

3.pm2 status


Save the PM2 process list
pm2 save


Delete the bot from PM2:
pm2 delete whatsapp-bot

Stop the bot:
pm2 stop whatsapp-bot

Check Running Processes
pm2 list
