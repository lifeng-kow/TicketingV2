var access=false;

$(function(){

  $("#packageTransactionAddForm #tranType").change(function(){
    if ($("#packageTransactionAddForm #tranType").val()=='Debit'){
      $("#packageTransactionAddForm .hoursDiv").show();
      $("#packageTransactionAddForm #assurancePlusNo").val("");
      $("#packageTransactionAddForm .assurancePlusDiv").hide();
    }else if ($("#packageTransactionAddForm #tranType").val()=='Credit'){
      $("#packageTransactionAddForm .assurancePlusDiv").show();
      $("#packageTransactionAddForm #hours").val("");
      $("#packageTransactionAddForm .hoursDiv").hide();
    }else{
      $("#packageTransactionAddForm #hours").val("");
      $("#packageTransactionAddForm #assurancePlusNo").val("");
      $("#packageTransactionAddForm .hoursDiv").hide();
      $("#packageTransactionAddForm .assurancePlusDiv").hide();
    }
  });

  //get packageID from url
  var urlParams = new URLSearchParams(window.location.search),
      packageID = urlParams.get('packageID');

  /*var checkAccess =
    $.ajax({
      url: apiSrc+"BCMain/iCtc1.CheckIsAdmin.json",
      method: "POST",
      dataType: "json",
      xhrFields: {withCredentials: true},
      data: { 'data':JSON.stringify({}),
              'WebPartKey':WebPartVal,
              'ReqGUID': getGUID() },
      success: function(data){
        if ((data) && (data.d.RetVal === -1)) {
          if (data.d.RetData.Tbl.Rows.length > 0) {
            access = data.d.RetData.Tbl.Rows[0].CanAccess;
          }
        }
      }
    });

  $.when(checkAccess).then(function( x ) {
    if (access==false){
      $('.dataAccess').hide();
    }else{
      $('.dataAccess').show();
    }
  });*/

  getPackageDetails(packageID);
  getPackageTransaction(packageID);

  //add transaction
  $('#packageTransactionAddForm #submit').click(function(){
    addNewtransaction(packageID, '');
  });

  $('#packageExtendForm #submit').click(function(){
    extendExpiry(packageID);
  });
});

function addNewtransaction(PackageID, CaseID){
  var Type, Hours, AssuranceNo, Remarks;
  TranType =  $('#packageTransactionAddForm #tranType').val();
  AssuranceNo = $('#packageTransactionAddForm #assurancePlusNo').val()*8;
  Hours = $('#packageTransactionAddForm #hours').val();
  Remarks = $('#packageTransactionAddForm #remarks').val();

  if (TranType.length==0 || Remarks.length==0){
    alert('Please fill in all mandatory fields!');
    return false;
  }

  if (TranType=='Credit' && AssuranceNo==''){
    alert('Please fill in all mandatory fields!');
    return false;
  } else if (TranType=='Debit' && Hours.length==0){
    alert('Please fill in all mandatory fields!');
    return false;
  }

  if (AssuranceNo!=''){
    Hours = AssuranceNo;
  }else{
    Hours = Hours;
  }

  var data = {'PackageID':PackageID, 'FLID':CaseID, 'TranType':TranType, 'Hours':Hours, 'Remarks': Remarks};
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

function extendExpiry(PackageID){
  var NewExpiry, Remarks;
  NewExpiry =  $('#packageExtendForm #expiryDate').val();
  Remarks = $('#packageExtendForm #remarks').val();

  if (NewExpiry.length==0 || Remarks.length==0){
    alert('Please fill in all mandatory fields!');
    return false;
  }

  var data = {'PackageID':PackageID, 'TranType':'Extend', 'NewExpiry':NewExpiry, 'Remarks': Remarks};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.ExtendPackageExpiry.json",
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
          var assuranceFlag;
          if (packageDetails.AssurancePlus==1){
            assuranceFlag = 'Yes'
          }else{
            assuranceFlag = 'No';
          }
          var packageDate = convertDateTime(packageDetails.CreatedDate,'datetime'),
              startDate = convertDateTime(packageDetails.StartDate,'date'),
              expiryDate = convertDateTime(packageDetails.ExpiryDate,'date');
          $('#summary .organization').html(packageDetails.Organization);
          $('#summary .product').html(packageDetails.Product);
          $('#summary .status').html(packageDetails.Status);
          $('#summary .packageType').html(packageDetails.PackageType);
          $('#summary .assurancePlusLbl').html(assuranceFlag);
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
            htmlString += '<tr id="'+ transactionDetails[i].PackageID  +'"> <td>'+tranDate+'</td> <td>'+transactionDetails[i].TranCreatedBy+'</td> <td>'+transactionDetails[i].Hours+'</td> <td>'+transactionDetails[i].Remarks+'</td> </tr>';
          }
          $('.packagetranTable tbody').html(htmlString);
        }
      }
    }
  });
};

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

function getGUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};
