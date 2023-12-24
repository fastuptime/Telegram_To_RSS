const botToken = 'BOT_TOKEN';
const channelUsername = 'By_Can_i';

const fs = require('fs');
const { Telegraf } = require('telegraf');
const { Feed } = require('feed');
const express = require('express');
const app = express();
const bot = new Telegraf(botToken);

const feed = new Feed({
  title: 'Telegram Channel RSS Feed',
  image: 'https://cdn.pixabay.com/photo/2017/06/10/07/18/rss-2389219_960_720.png',
  categories: ['telegram'],
  pubDate: new Date(),
  description: 'RSS feed for the Telegram channel.',
});

bot.on('text', (ctx) => {
  handleTelegramMessage(ctx.message);
});

bot.on('photo', async (ctx) => {
  const photo = ctx.message.photo;
  const caption = ctx.message.caption || '';
  const imageUrl = await ctx.telegram.getFileLink(photo[photo.length - 1].file_id);

  handleTelegramMessage(ctx.message, imageUrl.href, caption);
});

function handleTelegramMessage(message, imageUrl = '', caption = '') {
    if (!message.text && !message.caption) {
      console.log('Mesaj metni veya başlık bulunamadı');
      return;
    }

    const content = message.text || message.caption;
    const title = content.split('\n')[0];

    if (!content.includes('#')) {
      console.log('Tag bulunamadı');
      return;
    }

    const tags = content.match(/#\w+/g);

    feed.addItem({
      title: title,
      link: `https://t.me/${channelUsername}/${message.message_id}`,
      date: new Date(),
      description: `<img src="${imageUrl}" /><br /><br /><p>${content.replace(title, '')}</p>`,
      image: imageUrl,
    });

    tags.forEach((tag) => {
        feed.addCategory(tag.replace('#', ''));
    });

    for (const tag of tags) {
        fs.writeFileSync(`rss_${tag.replace('#', '')}.xml`, feed.rss2());
    }
    console.log('RSS feed updated successfully.');
}

app.get('/', async (req, res) => {
    const type = req.query.type;
    if(!type) return res.send('Type parametresi zorunludur.');
    rssFeed = fs.readFileSync(`rss_${type}.xml`, 'utf8');
    res.type('application/xml');
    res.send(rss);
});

app.listen(80, () => {
    console.log('Server started on port 80');
});
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));