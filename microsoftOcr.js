'use strict';
const async = require('async');
const path = require('path');
const fs = require('fs');
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;

const key = process.env.VISION_KEY;
const endpoint = process.env.VISION_ENDPOINT;

const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);

module.exports.computerVision = function computerVision(req, res) {
    const fileUrl = req.body.fileUrl;
    async.series([
        async function () {
            // const fileUrl = await fs.readFileSync(req.file.path);
            // console.log(fileUrl,"fileUrl")
            // The URL can point to image files (.jpg/.png/.bmp) or multi-page files (.pdf, .tiff).
            const printedResult = await readTextFromURL(computerVisionClient, fileUrl);
            return res.send({ code: 200, message: 'success', data: printedResult });

            async function readTextFromURL(client, url) {
                // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
                let result = await client.read(url);
                // Operation ID is last path segment of operationLocation (a URL)
                let operation = result.operationLocation.split('/').slice(-1)[0];

                // Wait for read recognition to complete
                // result.status is initially undefined, since it's the result of read
                while (result.status !== "succeeded") { await sleep(1000); result = await client.getReadResult(operation); }

                return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
            }
        },
        function () {
            return new Promise((resolve) => {
                resolve();
            })
        }
    ], (err) => {
        return res.send({ code: 500, err: err });
    });
}

