$(document).ready(function() {
  var $loadButton = $('#loadButton');
  var $buttonText = $('.button-text');
  var $tableBody = $('tbody');
  var $filterId = $('#filterId');

  function startLoading() {
    $loadButton.text('Loading...').prop('disabled', true);
    $tableBody.empty();
  }

  function stopLoading() {
    $loadButton.text('Load').prop('disabled', false);
  }

  $loadButton.on('click', function() {
    startLoading();
    var filter = {
      id: $filterId.val() ? parseInt($filterId.val()) : null
    };

    oboe({
      url: '/users/filter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filter)
    })
      .start(function() {
      startLoading();
    })
      .node('!', function(record) {
      if (record.type == 'data') {
        var value = record.value;
        $('tbody').append('<tr><td>' + value.id + '</td><td>' + value.name + '</td><td>' + value.createdAt.toLocaleString() + '</td><td>' + value.updatedAt.toLocaleString() + '</td></tr>');
      } else if (record.type == 'done') {
        stopLoading();
        console.log('End of stream reached');
      }
      return oboe.drop;
    })
      .fail(function(error) {
      console.error('Stream failed: ', error);
      stopLoading();
    });
  });
});
