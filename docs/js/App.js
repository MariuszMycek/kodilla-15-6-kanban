// Genrating mustache templates
function generateTemplate(name, data, basicElement) {
  var template = document.getElementById(name).innerHTML;
  var element = document.createElement(basicElement || "div");
  if (basicElement == "li") {
    element.id = data.id;
  }
  Mustache.parse(template);
  element.innerHTML = Mustache.render(template, data);

  return element;
}
/* API endpoint: 
    GET https://kodilla.com/pl/bootcamp-api/board */

var prefix = "https://cors-anywhere.herokuapp.com/";
var baseUrl = "https://kodilla.com/pl/bootcamp-api";
var myHeaders = {
  "X-Client-Id": "3833",
  "X-Auth-Token": "0d44144c37883a61821bbca53a5c8a6d",
  "Content-Type": "application/json"
};

/* 
GET /board
-----------------------------
Response:
{
   id: int,
   name: string,
   columns: [{
       id: int,
       name: string,
       cards: [{
           id: int,
           bootcamp_kanban_column_id: int,
           name: string
       }]
   }]
}
*/
// Initial data fetch for creating board after page refresh
fetch(prefix + baseUrl + "/board", { headers: myHeaders })
  .then(function(resp) {
    return resp.json();
  })
  .then(function(resp) {
    setupColumns(resp.columns);
    hideNotification();
  });
// Creating columns after page refresh
function setupColumns(columns) {
  columns.forEach(function(column) {
    var col = new Column(column.id, column.name);
    board.addColumn(col);
    setupCards(col, column.cards);
  });
}
// Creating cards after page refresh
function setupCards(col, cards) {
  cards.forEach(function(card) {
    var cardObj = new Card(card.id, card.name);
    col.addCard(cardObj);
  });
}

// Notifications

/* Showing info about present operation when waiting for server response. 
During this time user cannot do other operations */
function showNotification(infoType) {
  var notification = document.querySelector(".notification");
  notification.className = "notification";
  if (infoType == "Deleting...") {
    notification.classList.add("notification--delete");
  } else if (infoType == "Creating...") {
    notification.classList.add("notification--create");
  } else if (infoType == "Renaming..." || infoType == "Moving...") {
    notification.classList.add("notification--rename");
  }
  notification.innerHTML = infoType;
  document.querySelector(".notification-overlay").classList.remove("hidden");
}

function hideNotification() {
  document.querySelector(".notification-overlay").classList.add("hidden");
}
