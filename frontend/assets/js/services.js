angular.module('savvy')

.service('productService', ['$http', function($http){
    'use strict';

    this.getProductById = function(product_id, price_limit) {
        return $http.get("/api/v1/products/" + product_id + "?price_limit=" + price_limit).then(function(response) {
            return response.data;
        });
    };

    this.getProductsByDesc = function(description) {
        if(description !== "") {
            return $http.get("/api/v1/products/search?query=" + description).then(function(response) {
                return response.data;
            });
        }
    };

    this.saveProduct = function(product) {
        return $http({
            method: "POST",
            url: "/api/v1/prices/add",
            data: product,
            headers: {'Content-Type': 'application/json'}
        }).then(function(response){
            return response.data;
        });
    };

    this.saveVote = function(vote, product_id) {
        vote = 'up'
        if(vote === -1) {
            vote = 'down';
        }

        if(typeof product_id !== 'undefined') {
            return $http.post("/api/v1/products/" + product_id + "/thumbs-" + vote).then(function(response) {
                return response;
            });
        }
    };

    this.saveTag = function(tag, product_id) {
        if(tag && tag !== "") {
            return $http.post('/api/v1/products/' + product_id + '/tag/' + tag).then(function(response) {
                return response;
            });
        }
    }
}])

.factory('User',
['$http', '$q', '$state', '$rootScope', 'EVENTS', '$cookies', 'cookieHandler',
function($http, $q, $state, $rootScope, EVENTS, $cookies, cookieHandler) {
    function User() {
        var self = this;
        self.userData = null;

        self.getCurrentUser = function() {
            var deferred = $q.defer();
            if(self.userData !== null) {
                deferred.resolve(self.userData);
            } else if($cookies.getObject('user')) {
                self.userData = $cookies.getObject('user');
                deferred.resolve(self.userData);
            } else if($cookies.get('user_token')) {
                $http.get('/api/v1/users/current').then(function(response) {
                    self.userData = response.data.user;
                    deferred.resolve(response.data);
                }, function(err) {
                    self.userData = null;
                    deferred.reject(err);
                });
            } else {
                deferred.reject(EVENTS.notAuthenticated);
                self.userData = null;
            }

            return deferred.promise;
        };

        self.getUserRoles = function() {
            return self.userData.roles;
        };

        self.getPriceSubmissions = function(user_id) {
            var deferred = $q.defer();

            $http.get('api/v1/users/' + user_id + '/submissions').then(function(response) {
                deferred.resolve(response.data.user_submissions);
            }, function(err) {
                deferred.reject('api error');
                console.log(err);
            });

            return deferred.promise;
        };

        self.getVotingHistory = function(user_id) {
            return $http.get('api/v1/users/' + user_id + '/voting-history').then(function(response) {
                return response.data.voting_history;
            });
        };

        self.createUser = function(userData) {
            return $http({
                method: 'POST',
                url: 'api/v1/users/create',
                data: userData,
                headers: {'Content-Type': 'application/json'}
            }).then(function(response) {
                return response.data;
            });
        };

        self.isAuthenticated = function() {
            return self.userData !== null;
        };

        self.isAuthorized = function(authorizedRoles) {
            var isAuthorized = true;
            if(self.isAuthenticated()) {
                if(!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }

                self.getUserRoles().forEach(function(value, index) {
                    if(authorizedRoles.indexOf(value) === -1) {
                        isAuthorized = false;
                    }
                });
            } else {
                isAuthorized = false;
            }
            return isAuthorized;
        };

        self.login = function(credentials) {
            return $http({
                method: 'POST',
                url: 'api/v1/users/login',
                data: credentials,
                headers: {'Content-Type': 'application/json'}
            }).then(function(response) {
                $cookies.putObject('user', response.data.user, {
                    expires: response.data.user.user_token_expires
                });
                self.userData = response.data.user;
                $rootScope.$broadcast(EVENTS.loginSuccess);
                $state.go('home');
                return response.data.user;
            });
        };

        self.logout = function() {
            return $http.post('/api/v1/users/logout').then(function(response) {
                cookieHandler.removeAllUserCookies();
                self.userData = null;
                $rootScope.$broadcast(EVENTS.logoutSuccess);
                $state.go('login');
                return response.data;
            });
        };
    }

    return new User();
}])

.service('cookieHandler', ['$cookies', function($cookies) {
    'use strict';
    var self = this;

    self.getExpireDate = function() {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);
        expireDate.setHours(expireDate.getHours() - 5);
        return expireDate;
    };

    self.removeAllUserCookies = function() {
        ['user', 'username', 'user_token'].forEach(function(value, index) {
            $cookies.remove(value);
        });
    };
}])

.service('geolocationService', ['$q', '$window', function ($q, $window) {
    'use strict';
    var self = this;
    self.currentPosition = null;

    self.getCurrentPosition = function() {
        var deferred = $q.defer();
        var coordinates = JSON.parse($window.sessionStorage.getItem('coordinates'));

        if(!$window.navigator.geolocation) {
            deferred.reject('Geolocation not supported.');
        }

        if(self.currentPosition !== null) {
            deferred.resolve(self.currentPosition);
        } else if(coordinates) {
            self.currentPosition = coordinates;
            deferred.resolve(self.currentPosition);
        } else {
            $window.navigator.geolocation.getCurrentPosition(function(position) {
                var coordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                self.currentPosition = coordinates;
                $window.sessionStorage.setItem('coordinates', JSON.stringify(coordinates));
                deferred.resolve(self.currentPosition);
            },
            function (err) {
                deferred.reject(err);
            });
        }

        return deferred.promise;
    }
}])

/*module.service('Search', ['$rootScope', '$injector', '$state' function($rootScope, $injector, $state) {
    var service = {
        search: function(search_term) {
             if($scope.search_term !== "") {
                 $state.go('search', {search_term: $scope.search_term});
             }
        }
    };
    return service;
}]);*/

.service('stringReplace', function() { //For removing every occurence of "%20" in string
    this.escapeRegExp = function(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    this.replaceAll = function(str, find, replace) {
        return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    };
})

.factory('responseObserver', ['$q', '$injector', function($q, $injector) {
    return {
        'responseError': function(errorResponse) {
            switch (errorResponse.status) {
                case 403:
                    //$injector.get('$state').go('login');
                    break;
            }
            return $q.reject(errorResponse);
        }
    }
}]);
