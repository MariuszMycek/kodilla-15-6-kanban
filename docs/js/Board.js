//  Kanban board object, and column adding
var board = {
  name: "Kanban Board",
  addColumn: function(column) {
    this.element.appendChild(column.element);
    initSortable(column.id);
  },
  element: document.querySelector("#board .column-container")
};

function initSortable(id) {
  var el = document.getElementById(id);
  var sortable = Sortable.create(el, {
    group: "kanban",
    sort: true
  });
  return;
}

// Creating column after "Add column" button click
document
  .querySelector("#board .create-column")
  .addEventListener("click", function() {
    var columnName = prompt("Enter a column name");
    // Stop after "cancel"
    if (columnName === null) {
      return;
    }
    showNotification("Creating...");

    /*
    ==============================
    POST /column
    ------------------------------
    Request:
    name: string - name of the column to create
    ------------------------------
    Response:
    {
      id: int
    }
    */

    var data = {
      name: columnName
    };
    // Sending request to create column
    fetch(prefix + baseUrl + "/column", {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(data)
    })
      .then(function(resp) {
        //create json from resp
        return resp.json();
      })
      .then(function(resp) {
        var columnId = resp.id;
        // Fetching updated data
        fetch(prefix + baseUrl + "/board", { headers: myHeaders })
          .then(function(resp) {
            //create json from resp
            return resp.json();
          })
          .then(function(resp) {
            // Searching name of new column from data returned from server
            var columnName = function() {
              for (var i = 0; i < resp.columns.length; i++) {
                if (resp.columns[i].id == columnId) {
                  // When found - column name is returned for creating new column
                  return resp.columns[i].name || "Empty card";
                }
              }
            };
            // Creating new column with name returned from server
            var column = new Column(columnId, columnName());
            board.addColumn(column);
            hideNotification(); // hiding notification when done
          });
      });
  });
