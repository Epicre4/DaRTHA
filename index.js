require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const data = [
      {
          name: 'stats',
          description: 'Get server statistics'
      },
      {
          name: 'numberofmessages',
          description: 'Get the number of messages sent today in this channel'
      }
      // Add more commands as needed
  ];

  await client.application?.commands.set(data);
});


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, channel } = interaction;

    if (commandName === 'stats') {
        const messages = await channel.messages.fetch({ limit: 100 });

        let wordCount = 0;
        let charCount = 0;
        let emojiCount = 0;
        let activeMoments = new Map();

        messages.forEach(message => {
            wordCount += message.content.split(/\s+/).length;
            charCount += message.content.replace(/\s+/g, '').length;
            emojiCount += (message.content.match(/<:.+?:\d+>/g) || []).length;

            const minute = message.createdAt.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
            activeMoments.set(minute, (activeMoments.get(minute) || 0) + 1);
        });

        const mostActiveMinute = [...activeMoments.entries()].reduce((a, b) => a[1] > b[1] ? a : b)[0];

        // Format data for Discord
        const stats = [
            `Words: ${wordCount}`,
            `Characters: ${charCount}`,
            `Emojis: ${emojiCount}`,
            `Most Active Minute: ${mostActiveMinute}`
        ];

        const maxLength = Math.max(...stats.map(s => s.length)) + 2; // Extra space for padding
        const border = '─'.repeat(maxLength - 2);
        const response = [
            `┌${border}┐`,
            ...stats.map(s => `${s.padEnd(maxLength, ' ')}`),
            `└${border}┘`
        ].join('\n');

        await interaction.reply(response);
    }

    if (commandName === 'numberofmessages') {
        const today = new Date().setHours(0, 0, 0, 0);
        const messagesToday = (await channel.messages.fetch()).filter(m => m.createdAt >= today);

        const messageCountStr = `Messages Today: ${messagesToday.size}`;
        const maxLength = messageCountStr.length + 2; // Padding and borders
        const border = '─'.repeat(maxLength - 2);

        const response = `┌${border}┐\n${messageCountStr.padEnd(maxLength, ' ')}\n└${border}┘`;

        await interaction.reply(response);
    }
});

client.login(process.env.TOKEN);
