'use latest';
import { fromExpress } from 'webtask-tools';

import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import request from 'request';
import rp from 'request-promise';

let key = '8225ec485f624b4aa20c5e2123158f85'; // Thay bằng key của 
let idolPerson = [];

const app = express();

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cors());

app.post('/', (req, res) => {
  let imageUrl = req.body.url;
  recognize(imageUrl).then(result => {
    res.status(200).json(result);
  }).catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = fromExpress(app);

function detect(imageUrl) {
    console.log(`Begin to detect face from image: ${imageUrl}`);
    let url = `https://api.projectoxford.ai/face/v1.0/detect`;
    return rp({
        method: 'POST',
        uri: url,
        headers: {
            'Ocp-Apim-Subscription-Key': key
        },
        body: {
            url: imageUrl
        },
        json: true
    });
}

function identify(faceIds) {
    console.log(`Begin to identity face.`);
    let url = 'https://api.projectoxford.ai/face/v1.0/identify';
    return rp({
        method: 'POST',
        uri: url,
        headers: {
            'Ocp-Apim-Subscription-Key': key
        },
        body: {
            "personGroupId": 'splus-mems',
            "faceIds": faceIds,
            "maxNumOfCandidatesReturned": 1,
        },
        json: true
    });
}

function mapResultToIdol(result, faces) {
      var allIdols = result.map(result => {

        // Lấy vị trí khuôn mặt trong ảnh để hiển thị
        result.face = faces.filter(face => face.faceId == result.faceId)[0].faceRectangle;
        
        // Tìm idol đã được nhận diện từ DB
        if (result.candidates.length > 0) {
            // Kết quả chỉ trả về ID, dựa vào ID này ta tìm tên của idol
            var idolId = result.candidates[0].personId;
            var idol = idolPerson.filter(person => person.personId == idolId)[0];
            result.idol = {
                id: idol.userData,
                name: idol.name
            };
        } else {
            result.idol = {
                id: 0,
                name: 'Unknown'
            }
        }
        
        return result;
    });

    console.log(`Finish recognize image.`);
    return allIdols;
}

// Nhận diện vị trí khuôn mặt và tên idol từ URL ảnh
function recognize(imageUrl) {
    console.log(`Begin to recognize image: ${imageUrl}`);
    let faces = [];
    return detect(imageUrl)
    .then(result => {
      faces = result;
      console.log(faces);
      return faces.map(face => face.faceId);
    })
    .then(identify)
    .then(identifiedResult => {
       return mapResultToIdol(identifiedResult, faces);
    });
}
// Thay bằng nội dung trong file idol-person.json của bạn
idolPerson = [
    {
        "personId": "1ca88de9-033b-411a-a144-4145ebb31dad",
        "persistedFaceIds": [],
        "name": "Lê Trạch Dinh",
        "userData": "1"
    },
    {
        "personId": "41e2afcf-1b04-45ed-b707-467ecb6ba0c7",
        "persistedFaceIds": [],
        "name": "Lê Bùi Hồng Ký",
        "userData": "4"
    },
    {
        "personId": "af138cf3-3405-469e-a9f4-1b2565a1d2f3",
        "persistedFaceIds": [
            "345a2535-2c58-4d80-8b0e-a4cff6a25e78",
            "40d2e2a6-7505-48c2-8209-4e042014134f",
            "46d0662a-8c39-4278-b420-bd07bf286750",
            "9b3bcffe-855d-4304-a9ca-5056ad37eed9",
            "c51b3be8-d98b-4643-8376-2d1cfb798167",
            "cd1dfa70-a217-43a5-aab7-53bd1cf8ed20"
        ],
        "name": "Nguyễn Hữu Nghĩa",
        "userData": "2"
    },
    {
        "personId": "d98968d3-a223-4109-a06e-7bba9c677860",
        "persistedFaceIds": [
            "2b3e04e8-ee70-4e90-8642-162e399aa224",
            "3834a8c6-f15d-4227-9f8a-7d7d4a236a0e",
            "89590aed-e9e9-4d07-95a2-ad94f1277468",
            "d18b4948-4852-4956-855d-9886eb9a16cf",
            "dc16fe81-f6d1-4391-936e-8f30b3c8ecd9",
            "f250e035-a308-4393-85b6-805654debc31"
        ],
        "name": "Cù Công Cẩn",
        "userData": "3"
    }
];
