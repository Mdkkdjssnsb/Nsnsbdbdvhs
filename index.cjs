const express = require('express');
const ytdl = require('@distube/ytdl-core');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/ytdl', async (req, res) => {
  const { url, type } = req.query;

  try {
    if (!url || !type) {
      return res.status(400).json({
        error: '❌ | URL and Type is required.'
      });
    }

    if (type !== 'mp4' && type !== 'mp3') {
      return res.status(400).json({
        error: '❌ | Type must be either mp3 or mp4.'
      });
    }

    const videoInfo = await ytdl.getInfo(url);

    const format = videoInfo.formats.find(format => format.container === type);

    if (!format) {
      return res.status(500).json({
        error: '❌ | Unable to find requested format for the video.'
      });
    }

    res.set('Content-Disposition', `attachment; filename="video.${type}"`);
    res.set('Content-Type', format.mimeType);

    const videoStream = ytdl.downloadFromInfo(videoInfo, {
      filter: format => format.container === type,
      quality: 'highest',
    });

    videoStream.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '❌ | An error occurred while processing your request.'
    });
  }
});

app.listen(PORT, () => {
  console.log('ytdl api on');
});
