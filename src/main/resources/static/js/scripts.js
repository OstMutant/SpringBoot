  var eventSource = new EventSource("/stream-sse");
  var dataElement = document.getElementById("events");

  eventSource.onopen = function() {
    var element = document.createElement("div");
    element.innerHTML = 'Connection is opened.';
    dataElement.appendChild(element);
  };

  // Listening to the default "message" event
  eventSource.addEventListener('message', function(event) {
    var element = document.createElement("div");
    const jsonEvent = JSON.parse(event.data);
    element.innerHTML = "Message: " + JSON.stringify(jsonEvent);
    dataElement.appendChild(element);
  });

  // Handling errors
  eventSource.addEventListener('error', function(error) {
    var element = document.createElement("div");
    element.innerHTML = 'Error:' + error.data;
    dataElement.appendChild(element);
  });

  // Handling close
  eventSource.addEventListener('close', function(error) {
    var element = document.createElement("div");
    element.innerHTML = 'Connection is closed.';
    eventSource.close();
    dataElement.appendChild(element);
  });
