
$(function(){

  //get packageID from url
  var urlParams = new URLSearchParams(window.location.search),
      packageID = urlParams.get('packageID');

  getPackageDetails(packageID);
  getPackageTransaction(packageID);

  //add transaction
  $('#packageTransactionAddForm #submit').click(function(){
    addNewtransaction(packageID, '');
  });
});

function addNewtransaction(PackageID, CaseID){
  var Type, ManDays, Remarks;
  TranType =  $('#packageTransactionAddForm #tranType').val();
  Days = $('#packageTransactionAddForm #days').val();
  Remarks = $('#packageTransactionAddForm #remarks').val();

  if (TranType.length==0 || Days.length==0 || Remarks.length==0){
    alert('Please fill in all mandatory fields!');
    return false;
  }
  if (IsValidManDay(Days)==false){
    alert('Please fill day in whole/decimal .5 only!');
    return false;
  }

  var data = {'PackageID':PackageID, 'CaseID':CaseID, 'TranType':TranType, 'Days':Days, 'Remarks': Remarks};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.AddNewPackageTransactions.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            getPackageDetails(PackageID);
            getPackageTransaction(PackageID);
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
}

function getPackageDetails(PackageID){
  var data = {'PackageID':PackageID};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetPackagedetails.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var packageDetails = data.d.RetData.Tbl.Rows[0];

          var packageDate = convertDateTime(packageDetails.CreatedDate,'datetime'),
              startDate = convertDateTime(packageDetails.StartDate,'date'),
              expiryDate = convertDateTime(packageDetails.ExpiryDate,'date');
          $('#summary .organization').html(packageDetails.Organization);
          $('#summary .packageType').html(packageDetails.PackageType);
          $('#summary .product').html(packageDetails.Product);
          $('#summary .status').html(packageDetails.Status);
          $('#summary .manDays').html(packageDetails.ManDaysLeft+'/'+packageDetails.ManDaysBought);
          $('#summary .startDate').html(startDate);
          $('#summary .expiryDate').html(expiryDate);
          $('#summary .pkgCreatedBy').html(packageDetails.CreatedBy);
          $('#summary .createdDate').html(packageDate);
        }
      }
    }
  });
};

function getPackageTransaction(PackageID){
  var data = {'PackageID':PackageID};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.getPackageTransaction.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        var htmlString = '';
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var transactionDetails = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<transactionDetails.length; i++ ){
            var tranDate = convertDateTime(transactionDetails[i].TranDate,'date');
            htmlString += '<tr id="'+ transactionDetails[i].PackageID  +'"> <td>'+transactionDetails[i].TranType+'</td> <td>'+transactionDetails[i].Days+'</td> <td>'+tranDate+'</td> <td>'+transactionDetails[i].TranCreatedBy+'</td> <td>'+transactionDetails[i].Remarks+'</td> <td>'+transactionDetails[i].CaseID+'</td> </tr>';
          }
          $('.packagetranTable tbody').html(htmlString);
        }
      }
    }
  });
};

function IsValidManDay(ManDay) {
	var re = /^\d*(\.[05])?$/;
	return re.test(ManDay);
}

function convertDateTime(inputFormat, type) {
  if (inputFormat == null){
    return '-';
  };
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  if (type == 'date'){
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
  }else if (type == 'datetime'){
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/') + ' ' + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  }else if (type == 'time'){
    return [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  }
};

//geneare drop down optioms
function GetDropdownList(id, category) {
  var data = {'LookupCat': category}
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.Lookup_Get.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data': JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var lookup = data.d.RetData.Tbl.Rows;
          for (var i=0; i<lookup.length; i++ ){
            $(id).append('<option value="'+lookup[i].LookupKey+'">'+lookup[i].Description+'</option>');
          }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

function getGUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};
