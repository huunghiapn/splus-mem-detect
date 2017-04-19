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
        "id":1,
        "name":"Lê Trạch Dinh",
        "images":[{
        "thumbnail":"http://nghianguyenit.net/faces_data/dinhlt/03_1.jpg",
        "image":"http://nghianguyenit.net/faces_data/dinhlt/03_1.jpg"
        }]
    },
    {
        "id":2,
        "name":"Nguyễn Hữu Nghĩa",
        "images":[{
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_1.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_1.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_2.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_2.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_3.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_3.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_4.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_4.jpg"
        }
        ,{
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_5.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_5.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_6.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_6.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_7.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_7.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_8.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_8.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_9.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_9.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/nghianh/01_10.jpg",
        "image":"http://nghianguyenit.net/faces_data/nghianh/01_10.jpg"
        }]
    },
    {
        "id":3,
        "name":"Cù Công Cẩn",
        "images":[{
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_1.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_1.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_2.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_2.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_3.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_3.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_4.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_4.jpg"
        }
        ,{
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_5.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_5.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_6.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_6.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_7.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_7.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_8.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_8.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_9.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_9.jpg"
        },
        {
        "thumbnail":"http://nghianguyenit.net/faces_data/cancc/02_10.jpg",
        "image":"http://nghianguyenit.net/faces_data/cancc/02_10.jpg"
        }]
    },
    {
        "id":4,
        "name":"Lê Bùi Hồng Ký",
        "images":[{
        "thumbnail":"http://nghianguyenit.net/faces_data/kylbh/04_1.jpg",
        "image":"http://nghianguyenit.net/faces_data/kylbh/04_1.jpg"
        }]
    }
];
