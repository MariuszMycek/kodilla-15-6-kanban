// Column class
function Column(id, name) {
  var self = this;

  this.id = id;
  this.name = name || "No name given";
  this.element = generateTemplate("column-template", {
    name: this.name,
    id: this.id
  });

  this.element
    .querySelector(".column")
    .addEventListener("click", function(event) {
      // changing column name
      if (event.target.classList.contains("btn--rename")) {
        self.renameColumn();
      }
      // removing column
      if (event.target.classList.contains("btn--delete")) {
        self.removeColumn();
      }
      // creating new card - whole process is the same as creating column process
      if (event.target.classList.contains("btn--create")) {
        var cardName = prompt("Enter the name of the card");
        if (cardName === null) {
          return;
        }
        event.preventDefault();
        showNotification("Creating...");

        /*
        POST /card
        ------------------------------
        Request:
        name: string - the name of the card we create
        bootcamp_kanban_column_id: int - the id of the column to which the card belongs
        ------------------------------
        Response:
        {
          id: int
        }
        */

        var data = {
          name: cardName,
          bootcamp_kanban_column_id: self.id
        };

        fetch(prefix + baseUrl + "/card", {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify(data)
        })
          .then(function(res) {
            return res.json();
          })
          .then(function(resp) {
            var cardId = resp.id;
            fetch(prefix + baseUrl + "/board", { headers: myHeaders })
              .then(function(resp) {
                return resp.json();
              })
              .then(function(resp) {
                var cardName = function() {
                  for (var i = 0; i < resp.columns.length; i++) {
                    for (var j = 0; j < resp.columns[i].cards.length; j++) {
                      if (resp.columns[i].cards[j].id == cardId) {
                        return resp.columns[i].cards[j].name || "Empty card";
                      }
                    }
                  }
                };
                var card = new Card(cardId, cardName());
                self.addCard(card);
                hideNotification();
              });
          });
      }
    });
}

Column.prototype = {
  addCard: function(card) {
    this.element.querySelector("ul").appendChild(card.element);
  },
  // removing column
  removeColumn: function() {
    var self = this;
    showNotification("Deleting...");

    /*
        DELETE /column/{id}
    ------------------------------
    Request:
    {id}: int - id column, we want to delete
    ------------------------------
    Response:
    {
      id: int
    }
    */

    fetch(prefix + baseUrl + "/column/" + self.id, {
      method: "DELETE",
      headers: myHeaders
    })
      .then(function(resp) {
        return resp.json();
      })
      .then(function(resp) {
        if (resp.id == self.id) {
          self.element.parentNode.removeChild(self.element);
          hideNotification();
        }
      });
  },
  // renaming column
  renameColumn: function() {
    var columnName = prompt("Enter new column name");
    var self = this;
    if (columnName === null) {
      return;
    }
    showNotification("Renaming...");
    /*     PUT /column/{id}
  ------------------------------
  Request:
  {id}: int - the column id we want to edit
  name: string - new column name
  ------------------------------
  Response:
  {
    id: int
  } */

    var data = {
      name: columnName
    };
    console.log(data);
    fetch(prefix + baseUrl + "/column/" + self.id, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(data)
    })
      .then(function(resp) {
        return resp.json();
      })
      .then(function(resp) {
        var columnId = resp.id;
        fetch(prefix + baseUrl + "/board", { headers: myHeaders })
          .then(function(resp) {
            return resp.json();
          })
          .then(function(resp) {
            getColumnName(resp, columnId);
            hideNotification();
          });
      });
  }
};
// Function setting column name based on server response: resp - response json from GET request, columnId - card ID from server response (PUT request)
function getColumnName(resp, columnId) {
  for (var i = 0; i < resp.columns.length; i++) {
    if (resp.columns[i].id == columnId) {
      var column = document.getElementById(columnId);
      column.parentNode.querySelector(".column-title").innerText =
        resp.columns[i].name || "No name given";
    }
  }
}
