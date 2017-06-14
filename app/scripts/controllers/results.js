/************************ LICENCE ***************************
*     This file is part of <ViKM Vital-IT Knowledge Management web application>
*     Copyright (C) <2017> SIB Swiss Institute of Bioinformatics
*
*     This program is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as
*     published by the Free Software Foundation, either version 3 of the
*     License, or (at your option) any later version.
*
*     This program is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>
*
*****************************************************************/


/*global angular */
(function () {
    'use strict';
	/**
	 * @ngdoc controller
	 * @name vikmApp.controller:ResultsCtrl
	 * @description
	 * Controller of the vikmApp
	 */

    angular
        .module('vikmApp')
        .controller('ResultsCtrl', ResultsCtrl);

    ResultsCtrl.$inject = ['$location', 'toastr','siteTitle','$http', 'Upload', 'Restangular'];
    function ResultsCtrl($location, toastr, siteTitle, $http, Upload, Restangular) {
        var vm = this;
		vm.siteTitle = siteTitle.name;
        vm.status = {};

	/**
	 * @ngdoc function
	 * @name vikmApp.controller:SubmissionCtrl:upload
	 * @description
	 * upload the data to the backend
	 */
		vm.sendToBackend = function() {
            loadingMessage(true);

			// prepare the form data
			var backendCall = Restangular.one('results/' + vm.resultId).get();

			backendCall.then(function(data){
				console.log('all ok');
				console.log(data);
				vm.resultHtml = data.html_file;
                loadingMessage(false);
			}, function(response){
                console.log("Error with status code", response.status);
                loadingMessage(false);
			});

		};

        /**
         * show the loading message or errors
         * @param stat
         * @param error
         */
        function loadingMessage(stat, error) {
            var toastr_loading_parameters = {
                timeOut: 5000000,
                closeButton: false,
                iconClass: 'loading-toast-icon',
                messageClass: 'loading-toast-message',
                titleClass: 'loading-toast-title',
                allowHtml: true,
                preventOpenDuplicates: true,
                tapToDismiss: false
            };
            if (stat && !vm.status.loading_data) {
                vm.status.loading_data = true;
                vm.waitingToastr = toastr.info('<p class="text-center">Please wait, data are loading</p><p class="text-center"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i> <span class="sr-only">Loading...</span></p>', '<p class="text-center">Loading</p>', toastr_loading_parameters);
            }
            else if (!stat && vm.status.loading_data) {
                vm.status.loading_data = false;
                toastr.clear(vm.waitingToastr);
                if (error) {
                    toastr.error('Error please reload the page');
                }
            }
        }

	}


})();
