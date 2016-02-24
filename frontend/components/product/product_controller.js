angular.module('savvy')
.controller('product_controller', ['$scope', '$stateParams', 'productService', 'geolocationService',
function($scope, $stateParams, productService, geolocationService) {
    (function() {
        $scope.status = { product: 'loading', map: 'loading' };
        $scope.vote = {};
        $scope.product = {};
    })();

    $scope.sendVote = function(vote) {
        toggleVote(vote);
        productService.saveVote(vote, $scope.product.product_id);
    }

    function toggleVote(vote) {
        if(vote === 'up') {
            $scope.vote.up = true; $scope.vote.down = false;
        } else {
            $scope.vote.up = false; $scope.vote.down = true;
        }
    }

    function fetchProductDetails(product_id) {
        productService.getProductById(product_id).then(function(response){
            $scope.product = response;
            console.log($scope.product);
            console.log(Date.parse($scope.product.price_submissions[0].submitted_timestamp));
            $scope.status.product = 'ready';
            fetchUserLocation(geolocationService);
            initChart();
        });
    }


    function fetchUserLocation(geolocationService) {
        geolocationService.getCurrentPosition().then(function(position){
            initMap(position);
        });
    }

    function initMap(position) {
        console.log("lat: ", position.coords.latitude, "lng: ", position.coords.longitude);

        //THIS NEEDS TO BE CACHED AND INITIALIZED 
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: position.coords.latitude, lng: position.coords.longitude},
            scrollwheel: false,
            zoom: 12
        });
        console.log(map);
        generateBusinessMapMarkers(map, $scope.product.price_submissions);
        $scope.status.map = "ready";
    }

    function generateBusinessMapMarkers(map, price_submissions) {
        price_submissions.forEach(function(value, index) {
            new google.maps.Marker({
                map: map,
                position: {
                    lat: value.business_details.google_places.geometry.location.lat,
                    lng: value.business_details.google_places.geometry.location.lng
                },
                title: value.name
            });
        });
    }

    function initChart() {
        google.charts.setOnLoadCallback(function(){
            var data = [
                ['Date', 'Average Price (USD)']
            ];

            $scope.product.average_price_per_day.forEach(function(value, index) {
                value[1] = (value[1] / 100);
                data.push(value);
            });

            var chart = new google.visualization.LineChart(document.getElementById('prices-graph'));
            chart.draw(google.visualization.arrayToDataTable(data), {
                curveType: 'function',
                legend: { position: 'bottom' }
            });
            $scope.status.chart = 'ready';
        });
    }

    fetchProductDetails($stateParams.product_id);
}]);
