const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

async function hlsUrl(ytUrl) {
    return await fetch(ytUrl)
      .then(async (r) => await r.text())
      .then((r) => r.match(/(?<=hlsManifestUrl":").*\.m3u8/g)[0]);
}

app.get('/', (req, res) => {
    res.send('Youtube live streaming SERVER!');
})

app.get('/stream', async (req, res) => {
    const id = req.query.id;
    try{
        const hlsStreamUrl = await hlsUrl(`https://www.youtube.com/watch?v=${id}`);
        res.status(200).redirect(hlsStreamUrl);
    }
    catch(e){
        res.json({
            error: e
        });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
