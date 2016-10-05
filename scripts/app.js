(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.constant('ApiBasePath', "https://davids-restaurant.herokuapp.com")
.directive('foundItems', FoundItems);


function FoundItems () {
  var ddo = {
    templateUrl: 'foundItemsList.html',
    scope: {
      found: '<',
      onRemove: '&'
    },
    controller: NarrowItDownController,
    controllerAs: 'ctrl',
    bindToController: true
  };

  return ddo;
}


NarrowItDownController.$inject = ['MenuSearchService'];

function NarrowItDownController(MenuSearchService) {

  var ctrl = this;

  ctrl.found = false;

  ctrl.isEmpty = function () {
    var result = ((ctrl.searchTerm == "") || (ctrl.found.length == 0));
    return result;
  }

  ctrl.isListLoaded = function () {
    return (ctrl.found.length > 0);
  }

  ctrl.search = function () {
    if (!ctrl.searchTerm == "") {

        var promise = MenuSearchService.getMatchedMenuItems(ctrl.searchTerm);

        promise.then(function (response) {
          ctrl.found = response.data.matchedItems;

          return response;
       })
       .catch(function (error) {
         console.log(error);
       })
    }
    else {
      ctrl.searchTerm = "";
    }
  }

  ctrl.removeItem = function (itemIndex) {
    ctrl.found.splice(itemIndex, 1);
  }

  ctrl.inputKeyPress = function (keyEvent) {
  if (keyEvent.which === 13)
    ctrl.search();
  }

}

MenuSearchService.$inject = ['$http', 'ApiBasePath'];

function MenuSearchService($http, ApiBasePath) {

  var service = this;

  service.getMenuItems = function () {
    var response = $http({
          method: "GET",
          url: (ApiBasePath + "/menu_items.json")
        });

        return response;
      }

  service.getMatchedMenuItems = function (searchTerm) {
       var promise = service.getMenuItems();

       var nextPromise = promise.then(function (response){

         var matchedItems = [];

         response.data.menu_items.forEach(function(item, index) {

           if (item.description.toUpperCase().indexOf(searchTerm.toUpperCase()) > -1) {
               matchedItems.push(item);
             }

             response.data.matchedItems = matchedItems;

         })

         return response;
       })
       .catch(function (error) {
                     console.log(error);
                   });

      return nextPromise;

      }

  }

})();
