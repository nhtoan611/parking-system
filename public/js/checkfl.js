//check input xe vao co theo doi ko
$('#carInNumberPlate').on('keyup', function(){
    $('#txtNoti').hide();
    var carInNumberPlate = $('#carInNumberPlate').val();
    $.ajax({
        url: 'follows/carIsFollow',
        method: 'GET',
        data: {
            carNumberPlate: carInNumberPlate
        },
        dataType: 'JSON',
        success: function(data){
            //console.log(data)
            if(data.length != 0){
                $('#txtNoti').show();
            }else {
                $('#txtNoti').hide();
            }
        },
        error: function(err){
            console.log(err);
        }
    })
});

//check input xe ra co theo doi ko
$('#carOutNumberPlate').on('keyup', function(){
    $('#costVal').val('');
    $('#txtNotiFollow').hide();
    $('#txtNotiMonthly').hide();
    $('#txtNotiErr').hide();      
    $('#costDiv').hide();
    var carOutNumberPlate = $('#carOutNumberPlate').val().trim();
    checkCarIn(carOutNumberPlate);
});

//create car in
function createCarIn(){
    $('#btnCreateCarIn').click(function(){
        var carInNumberPlate = $('#carInNumberPlate').val();
        var carInImage = $('#carInImage').val();
        $.ajax({
            url: '/carin',
            method: 'POST',
            dataType: 'JSON',
            data: {
                carInNumberPlate: carInNumberPlate,
                carInImage: carInImage
            },
            success: function(data){
                $.notify('Thêm mới thành công',{
                    className: "success",
                    autoHideDelay: 1000
                });
                $('#myTableCarIn').find('tr:gt(0)').remove();
                createTableCarIn(data);
                $('#myModal').modal('hide');   
            },
            error: function(err){
                $.notify('Thêm mới thất bại',{
                    className: "error",
                    autoHideDelay: 1000
                });
            }
        });
    })
}

function createTableCarIn(data){
    var emptySlot = 100- data.length;
    $('#emptySlot').html('');
    $('#emptySlot').append('Số chỗ trống khả dụng: '+emptySlot);
    data.forEach(function(element) {
        $('#listCar tr:last')
            .after(
                '<tr id="' + element._id + '"><td class="carNumberPlate">' +
                element.carNumberPlate +
                '</td><td class="carInTime">' +
                new Date(element.carInTime).toLocaleString() +
                '</td><td><input class="checkFl" type="checkbox"></td><td><button id="btnDetails" type="button" class="btn btn-outline-info">Chi tiết</button></td></tr>');
        $('#'+element._id +' .checkFl').prop('checked', element.isFollow);
    });
    $('#listCar').simplePagination({
        previousButtonClass: "btn btn-danger",
        nextButtonClass: "btn btn-danger",
        perPage: 10
    });
}

//create car out
function createCarOut(){
    $('#btnAddCarOut').click(function(){
        var carOutNumberPlate = $('#carOutNumberPlate').val();
        var carOutImage = $('#carOutImage').val();
        var fee = $('#costVal').val();
        $.ajax({
            url: 'outcars/carout',
            method: 'PUT',
            dataType: 'JSON',
            data: {
                carOutNumberPlate: carOutNumberPlate,
                carOutImage: carOutImage,
                fee: fee
            },
            success: function(data){
                $.notify('Xác nhận xe ra thành công',{
                    className: "success",
                    autoHideDelay: 1000
                });
                $('#myTableCarOut').find('tr:gt(0)').remove();
                createTableCarOut(data.carOut);
                $('#myTableCarIn').find('tr:gt(0)').remove();
                createTableCarIn(data.carIn);
                $('#myModalOut').modal('hide');   
            },
            error: function(err){
                $.notify('Xác nhận xe ra thất bại',{
                    className: "error",
                    autoHideDelay: 1000
                });
            }
        })
    })
}

function createTableCarOut(data){
    data.forEach(function(element) {
        var fee;
        if(element.fee==0){
            fee = 'Xe gửi theo tháng';
        }else{
            fee = element.fee;
        }
        $('#listCarOut tr:last')
            .after(
                '<tr id="' + element._id + '"><td class="carNumberPlate">' +
                element.carNumberPlate +
                '</td><td class="carInTime">' +
                new Date(element.carInTime).toLocaleString() +
                '</td><td class="carOutTime">'+
                new Date(element.carOutTime).toLocaleString() +
                '</td><td class="fee">'+fee +
                '</td><td><button id="btnDetails" type="button" class="btn btn-outline-info">Chi tiết</button></td></tr>');
    })

    $('#listCarOut').simplePagination({
        previousButtonClass: "btn btn-danger",
        nextButtonClass: "btn btn-danger",
        perPage: 10
    });
}