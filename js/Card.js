// Card class
function Card(id, name) {
  var self = this;

  this.id = id;
  this.name = name || "Empty card";
  this.element = generateTemplate(
    "card-template",
    { description: this.name, id: this.id },
    "li"
  );
  this.element
    .querySelector(".card")
    .addEventListener("click", function(event) {
      event.stopPropagation();

      if (event.target.classList.contains("btn--delete")) {
        // removing card
        self.removeCard();
      }
      if (event.target.classList.contains("btn--rename")) {
        // renaming card
        self.renameCard();
      }
    });
  // moving card from one column to another - drop event
  this.element.querySelector(".card").addEventListener("drop", function(event) {
    event.stopPropagation();
    self.moveCard();
  });
}

Card.prototype = {
  // removing card
  removeCard: function() {
    var self = this;
    showNotification("Deleting...");

    /* 
    DELETE /card/{id}
    ------------------------------
    Request:
    {id}: int - id card we want to remove
    ------------------------------
    Response:
    {
      id: int
    }
    */

    fetch(prefix + baseUrl + "/card/" + self.id, {
      method: "DELETE",
      headers: myHeaders
    })
      .then(function(resp) {
        return resp.json();
      })
      .then(function(resp) {
        var card = document.getElementById(resp.id);
        card.parentNode.removeChild(card);
        hideNotification();
      });
  },
  // renaming card
  renameCard: function() {
    var cardName = prompt("Enter new column name");
    var self = this;
    if (cardName === null) {
      return;
    }
    showNotification("Renaming...");

    /* PUT /card/{id}
    ------------------------------
    Request:
    {id}: int - id card we want to edit
    name: string - new name card
    bootcamp_kanban_column_id: int - the column id to which we want to move the post
    ------------------------------
    Response:
    {
    id: int
    } */

    var data = {
      name: cardName
    };

    fetch(prefix + baseUrl + "/card/" + self.id, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(data)
    })
      .then(function(resp) {
        return resp.json();
      })
      .then(function(resp) {
        var cardId = resp.id;
        fetch(prefix + baseUrl + "/board", { headers: myHeaders })
          .then(function(resp) {
            return resp.json();
          })
          .then(function(resp) {
            getCardName(resp, cardId);
            hideNotification();
          });
      });
  },
  // moving card
  moveCard: function() {
    showNotification("Moving...");
    var self = this;
    // geting id of new column - after drop
    var columnId = self.element.parentNode.id;
    // getting content of the card
    var cardName = self.element.querySelector(".card-description").innerText;
    var data = {
      name: cardName,
      bootcamp_kanban_column_id: columnId
    };
    /* Sending request to change column id to new column id, where we moved card
    Also sending content of the moved card */ 
    fetch(prefix + baseUrl + "/card/" + self.id, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(data)
    })
      .then(function(resp) {
        return resp.json();
      })
      .then(function(resp) {
        var cardId = resp.id;
        // getting updated data from server
        fetch(prefix + baseUrl + "/board", { headers: myHeaders })
          .then(function(resp) {
            return resp.json();
          })
          .then(function(resp) {
            // setting card content to moved card (from server)
            getCardName(resp, cardId);
            hideNotification();
          });
      });
  }
};

// Function setting card name based on server response: resp - response json from GET request, cardId - card ID from server response (PUT request)
function getCardName(resp, cardId) {
  for (var i = 0; i < resp.columns.length; i++) {
    for (var j = 0; j < resp.columns[i].cards.length; j++) {
      if (resp.columns[i].cards[j].id == cardId) {
        var card = document.getElementById(cardId);
        card.querySelector(".card-description").innerHTML =
          resp.columns[i].cards[j].name || "Empty card";
      }
    }
  }
}
