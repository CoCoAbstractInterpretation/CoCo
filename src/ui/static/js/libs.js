function upload_file() {
  var form_data = new FormData($('#uploadfile')[0]);
  $.ajax({
    url: '/upload',
    type: 'POST',
    data: form_data,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data){
      console.log(data);
    }
  });
}

function start_check() {
  $.ajax({
    url: '/check',
    type: 'POST',
    data: $('#options').serialize(),
    success: function(data){
      if (data == "Not detected") {
        $("#cy").html(data);
      } else {
        eval(data);
      }
    }
  });
}
