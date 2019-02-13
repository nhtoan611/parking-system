var socket = io("http://localhost:3000/");
socket.on("ssd", function (data) {
    $('#myModal').modal('show');
    var dataSplit = data.split(' ');
    $("#carInNumberPlate").val(dataSplit[0]);
    $('#carInImage').val(dataSplit[1]);
    imgElem.setAttribute('src', "data:image/jpg;base64," + dataSplit[1]);

    $.ajax({
        url: 'follows/carIsFollow',
        method: 'GET',
        data: {
            carNumberPlate: dataSplit[0]
        },
        dataType: 'JSON',
        success: function (data) {
            //console.log(data)
            if (data.length != 0) {
                $('#txtNoti').show();
            } else {
                $('#txtNoti').hide();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
});

//socket on car out
socket.on("ssdout", function (data) {
    $('#myModalOut').modal('show');
    $('#costVal').val('');
    $('#txtNotiFollow').hide();
    $('#txtNotiMonthly').hide();
    $('#txtNotiErr').hide();
    $('#costDiv').hide();

    var dataSplit = data.split(' ');
    var carOutNumberPlate = dataSplit[0];
    $("#carOutNumberPlate").val(dataSplit[0]);
    $('#carOutImage').val(dataSplit[1]);
    imgElemOut.setAttribute('src', "data:image/jpg;base64," + dataSplit[1]);
    checkCarIn(dataSplit[0]);
});

//kiem tra bien so xe trong ben
function checkCarIn(carOutNumberPlate) {
    // var carOutNumberPlate = $('#carOutNumberPlate').val();
    $.ajax({
        url: 'outcars/checkCarIn',
        method: 'GET',
        data: {
            carOutNumberPlate: carOutNumberPlate
        },
        dataType: 'JSON',
        success: function (data) {
            console.log(data);
            if (data.status == 1) {
                $('#btnAddCarOut').prop('disabled', false);
                $('#txtNotiErr').hide();
                if (data.isMonthly == 1) {
                    $('#txtNotiMonthly').show();
                    $('#costVal').val(0);
                } else {
                    $('#costVal').val(data.fee);
                    $('#costDiv').show();
                }
                if (data.isFollow == 1) {
                    $('#txtNotiFollow').show();
                }
            } else {
                $('#btnAddCarOut').prop('disabled', true);
                $('#txtNotiErr').show();
            }    
        },
        error: function (err) {
            console.log(err);
        }
    })
}