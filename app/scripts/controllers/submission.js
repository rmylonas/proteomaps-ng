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
	 * @name vikmApp.controller:SubmissionCtrl
	 * @description
	 * # initController to reset localStorage
	 * # gets User. Location to setnewpassword if 'is_password_reset' = Y
	 * Controller of the vikmApp
	 */

    angular
        .module('vikmApp')
        .controller('SubmissionCtrl', SubmissionCtrl);

    SubmissionCtrl.$inject = ['$location', 'toastr','siteTitle','$http', 'Upload', 'Restangular', '$scope'];
    function SubmissionCtrl($location, toastr, siteTitle, $http, Upload, Restangular, $scope) {
        var vm = this;
        vm.nr_motifs = 6;
		vm.fasta_filename;
		vm.siteTitle = siteTitle.name;
        vm.status = {};
        vm.selectedFileName = "No file chosen";


    /**
     * @ngdoc function
     * @name vikmApp.controller:SubmissionCtrl:downloadSampleFasta
     * @description
     * download the sample FASTA file
     */
    vm.downloadSampleFasta = function() {
        Restangular.one('test-fasta').withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
            var file = new Blob([res], { type: 'text/plain' });
            saveAs(file, 'test.fa');
        });
    };

    /**
     * @ngdoc function
     * @name vikmApp.controller:SubmissionCtrl:insertSamplePeptides
     * @description
     * insert sample peptides to text area
     */
    vm.insertSamplePeptides = function() {
        Restangular.one('test-peptides').withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
            var reader = new FileReader();
            reader.readAsText(res);
            reader.onloadend = function() {
                vm.pepSeqs = reader.result;
                $scope.$apply();
            }
        });
    };


    /**
     * @ngdoc function
     * @name vikmApp.controller:SubmissionCtrl:submitSampleFasta
     * @description
     * submit the sample FASTA file
     */
    vm.submitSampleFasta = function() {
        Restangular.one('test-fasta').withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
            var testFileName = 'test.fa';
            var file = new File([res], testFileName, { type: 'text/plain'});
            vm.fileData = file;
            vm.selectedFileName = testFileName;
        });
    };


    vm.clickBrowse = function(){
        $("#fastafile").click();
    };


	/**
	 * @ngdoc function
	 * @name vikmApp.controller:SubmissionCtrl:upload
	 * @description
	 * upload the data to the backend
	 */
		vm.sendToBackend = function() {

		    // check that only peptide sequences OR fasta file is submited
            if(vm.pepSeqs && vm.fileData){
                toastr.error("Please only provide a FASTA file or peptide sequences, but not both together.");
                return;
            }

            // prepare the form data
            var formData = new FormData();

            // check the provided peptide sequences
            if(vm.pepSeqs){
                var checkRes = checkAndFormatPepSeqs(vm.pepSeqs);
                if(!checkRes.isOk){
                    toastr.error(checkRes.errorMessage);
                    return;
                }
                formData.append('data', checkRes.fastaSeqs);
            }

            if(vm.fileData){
                formData.append('file', vm.fileData);
            }

            loadingMessage(true);

            formData.append('nr_of_motifs', vm.nr_motifs);

			var backendCall = Restangular.all('peptides').withHttpConfig({transformRequest: angular.identity})
				.customPOST(formData, '', undefined, {'Content-Type': undefined});

			backendCall.then(function(data){
                loadingMessage(false);
                $location.path('/results/' + data.result_id);
			}, function(response){
                console.log("Error with status code", response.status);
                loadingMessage(false);
			});

		};


        /**
         * check if the peptide sequences provided are OK and format them correctly by converting them to FASTA
         * @param pepSeq
         * @returns {*}
         */
        function checkAndFormatPepSeqs(pepSeq){
            var allLinesList = pepSeq.split("\n");

            // remove all FASTA headers
            var pepList = _.filter(allLinesList, function(p){ return p.charAt(0) != ">";});

            // remove empty lines
            var pepList2 = _.filter(pepList, function(p){ return p != ""; });

            // check that the sequnces are al of same length
            if(! pepList2.every(function(p){return p.length == pepList2[0].length; })){
                return {isOK: false, errorMessage: "<strong>PEPTIDE SEQUENCE ERROR</strong><br>Peptide sequences have to be of same length."};
            }

            // add a FASTA header to all sequences
            var fastaList = _.map(pepList2, function(p, i){ return ">" + i + "\n" + p; });

            return {isOk: true, fastaSeqs: fastaList.join("\n")};
        }

	/**
	 * @ngdoc function
	 * @name vikmApp.controller:SubmissionCtrl:getFiles
	 * @description
	 * upload the data to the backend
	 */
		vm.uploadFile = function($file) {
            vm.selectedFileName = $file.name;
			vm.fileData = $file;
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
