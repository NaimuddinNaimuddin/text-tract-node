const fs = require('fs');
const vision = require('@google-cloud/vision');
const visionV1 = require('@google-cloud/vision').v1;
const visionV2 = require('@google-cloud/vision').v1p3beta1;

const CONFIG = {
    credentials: {
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL
    }
};

module.exports.googleOCR = async (req, res) => {
    try {
        const _path = req.file.path;
        const client = new vision.ImageAnnotatorClient(CONFIG);
        const [result] = await client.documentTextDetection(_path);
        const fullTextAnnotation = result.fullTextAnnotation;
        return res.send({ code: 200, message: 'hello', data: fullTextAnnotation })
    } catch (err) {
        return res.send({ code: 500, message: 'server err', err: err });

    }
}

module.exports.googleImageOCR = async (req, res) => {
    try {
        const client = new visionV2.ImageAnnotatorClient(CONFIG);
        const fileName = req.file.path;
        const request = {
            image: {
                content: fs.readFileSync(fileName),
            },
            feature: {
                languageHints: ['en-t-i0-handwrit'],
            },
        };

        const [result] = await client.documentTextDetection(request);
        const fullTextAnnotation = result.fullTextAnnotation;

        return res.send({ code: 200, message: 'hello', data: fullTextAnnotation })
    } catch (err) {
        return res.send({ code: 500, message: 'server err', err: err });
    }
}

module.exports.googlePdfOCR = async (req, res) => {
    try {
        const client = new visionV1.ImageAnnotatorClient(CONFIG);
        const bucketName = process.env.BUCKET_NAME;
        const fileName = req.body.fileName;
        const outputPrefix = 'results'

        const gcsSourceUri = `gs://${bucketName}/${fileName}`;
        const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

        const inputConfig = {
            mimeType: 'application/pdf',
            gcsSource: {
                uri: gcsSourceUri,
            },
        };
        const outputConfig = {
            gcsDestination: {
                uri: gcsDestinationUri,
            },
        };
        const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];
        const request = {
            requests: [
                {
                    inputConfig: inputConfig,
                    features: features,
                    outputConfig: outputConfig,
                },
            ],
        };

        const [operation] = await client.asyncBatchAnnotateFiles(request);
        const [filesResponse] = await operation.promise();
        const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
        return res.send({ code: 200, message: 'text-pdf', data: destinationUri });
    } catch (err) {
        return res.send({ code: 500, message: 'server err', err: err });
    }
}