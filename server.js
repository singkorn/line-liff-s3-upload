require('dotenv').config();
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const app = express();
const port = 3000;

// Log environment variables
console.log(process.env.AWS_ACCESS_KEY_ID);
console.log(process.env.AWS_SECRET_ACCESS_KEY);
console.log(process.env.AWS_REGION);
console.log(process.env.AWS_S3_BUCKET);

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.file);
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        console.log(data);
        res.status(200).send(data);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});