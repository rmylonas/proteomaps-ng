"use strict";

 angular.module('config', [])

     .constant('ENV', {serverURL:'http://mixmhcp/api/index.php', imageURL: 'http://mixmhcp/api/image_get.php', withCredentials:false,debugInfoEnabled:true,CORS:true})

;