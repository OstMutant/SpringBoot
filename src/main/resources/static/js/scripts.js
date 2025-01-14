$(document).ready(function() {
  var $loadButton = $('#loadButton');
  var $buttonText = $('.button-text');
  var $tableBody = $('tbody');
  var $filterSeqNo = $('#filterSeqNo');
  var $filterTimestamp = $('#filterTimestamp');

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
      seqNo: $filterSeqNo.val() ? parseInt($filterSeqNo.val()) : null,
      timestamp: $filterTimestamp.val() ? new Date($filterTimestamp.val()).toISOString() : null
    };

    oboe({
      url: '/stream-json',
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
      if (record.seqNo == -1) {
        stopLoading();
        console.log('End of stream reached');
      } else {
        $('tbody').append('<tr><td>' + record.seqNo + '</td><td>' + record.timestamp.toLocaleString() + '</td></tr>');
      }
      return oboe.drop;
    })
      .fail(function(error) {
      console.error('Stream failed: ', error);
      stopLoading();
    });
  });
});
