// Code goes here
var app = angular.module('app', []);

app.factory('recognizeService', function($http) {
    return {
        recognize: function(imgLink) {
            var url = 'https://wt-db53b18966382f7a05192dc8caac9930-0.run.webtask.io/splus-mems-detect';
            return $http({
                method: 'POST',
                url,
                data: {
                    url: imgLink
                }
            });
        }
    }
});

app.controller('mainCtrl', function($scope, recognizeService) {
    $scope.isLoading = false;

    $scope.$watch('imageLink', function(oldValue, newValue) {
        $scope.faces = [];
        $scope.faceDisplay = [];
    });

    // Gọi hàm này khi người dùng click button "Nhận diện"
    $scope.recognize = function() {
        if ($scope.isLoading)
            return;

        $scope.isLoading = true;
        // Gọi hàm recognize của service
        recognizeService.recognize($scope.imageLink).then(result => {
            $scope.faces = result.data;

            // Dựa vào kết quả trả về để set style động cho class idol-face
            $scope.faceDisplay = result.data.map(rs => {
                return {
                    style: {
                        top: rs.face.top + 'px',
                        left: rs.face.left + 'px',
                        width: rs.face.width + 'px',
                        height: rs.face.height + 'px'
                    },
                    name: rs.idol.name
                }
            });
            $scope.isLoading = false;
        });
    }

    // Danh sách ảnh để test
    $scope.testImages = ["http://nghianguyenit.net/faces_data/nghianh.jpg", "http://nghianguyenit.net/faces_data/cucongcan.JPG", "http://nghianguyenit.net/faces_data/dinhlt.jpg", "http://nghianguyenit.net/faces_data/kylbh.jpg"];

    // Danh sách idol
    $scope.idols = [
        "Lê Trạch Dinh",
        "Nguyễn Hữu Nghĩa",
        "Cù Công Cẩn",
        "Lê Bùi Hồng Ký"
    ];
});
