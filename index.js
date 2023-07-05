require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');

const upload = multer({ dest: 'uploads/' });
const { computerVision } = require('./microsoftOcr.js');
const { googleImageOCR, googleOCR, googlePdfOCR } = require('./googleOcr.js');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.post('/google/pdf', googlePdfOCR)
app.post('/google/image', upload.single('image'), googleImageOCR)
app.post('/google/ocr', upload.single('image'), googleOCR);

app.post('/microsoft/ocr', upload.single('image'), computerVision)
app.get('/', (req, res) => {
    res.send('TEXT TRACT BACKEND...')
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
    if (!err) {
        console.log('SERVER PORT :', PORT);
    }
});