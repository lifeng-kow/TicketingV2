
$(function(){

  $("#packageAddForm #assurancePlus").change(function(){
    if ($("#packageAddForm #assurancePlus").is(':checked')){
      $("#packageAddForm #assurancePlusNo").show();
    }else{
      $("#packageAddForm #assurancePlusNo").val("");
      $("#packageAddForm #assurancePlusNo").hide();
    }
  });

  //get packageID from url
  //var urlParams = new URLSearchParams(window.location.search),
    //  packageID = urlParams.get('packageID');

  var getOrgnaisation =
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.getOrgnaisationList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify({}),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length == 1) {
          var org = data.d.RetData.Tbl.Rows[0];
          $('#packageFilter #organisation, #packageAddForm #organisation').append('<option value="'+org.DefaultRoleID+'" selected>'+org.DisplayName+'</option>');
        }else if (data.d.RetData.Tbl.Rows.length > 0) {
          $('#packageFilter #organisation, #packageAddForm #organisation').append('<option value="">-- Please Select --</option>');
          var orgList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<orgList.length; i++ ){
            $('#packageFilter #organisation, #packageAddForm #organisation').append('<option value="'+orgList[i].DefaultRoleID+'">'+orgList[i].DisplayName+'</option>');
          }
        }
      }
    }
  });

  var checkRoleAccess =
    $.ajax({
      url: apiSrc+"BCMain/iCtc1.CheckRoleAccess.json",
      method: "POST",
      dataType: "json",
      xhrFields: {withCredentials: true},
      data: { 'data':JSON.stringify({}),
              'WebPartKey':WebPartVal,
              'ReqGUID': getGUID() },
      success: function(data){
        if ((data) && (data.d.RetVal === -1)) {
          if (data.d.RetData.Tbl.Rows.length > 0) {
            var RoleName = data.d.RetData.Tbl.Rows[0].RoleName;
            if (RoleName=='Admin'){
              $('.adminControl').show();
            }else{
              $('.adminControl').hide();
            }
          }
        }
      }
    });

  $.when(getOrgnaisation).then(function( x ) {
    getPackageList();
    getOrgProductList($('#packageFilter #organisation').val());
  });

  $("#packageFilter #organisation").change(function(){
    getOrgProductList($('#packageFilter #organisation').val());
  });

  //filter
  $('#packageFilterForm .packageFilterSubmit').click(function(){
    getPackageList();
  });
  //add package
  $('#packageAddForm #submit').click(function(){
    addNewPackage();
  });
});

function addNewPackage(){
  var RoleID, PackageType, Product, StartDate, ExpiryDate, AssurancePlus, NoAssPlus, Remarks;
  RoleID = $('#packageAddForm #organisation').val();
  PackageType =  $('#packageAddForm #type').val();
  Product = $('#packageAddForm #product').val();
  StartDate = $('#packageAddForm #packageStartDate').val();
  ExpiryDate = $('#packageAddForm #packageExpiryDate').val();
  if ($("#packageAddForm #assurancePlus").is(':checked')){
    AssurancePlus = 1;
  }else{
    AssurancePlus = 0;
  }
  NoAssPlus = $('#packageAddForm #assurancePlusNo').val();
  Remarks = $('#packageAddForm #remarks').val();

  if (RoleID.length==0 || PackageType.length==0 || Product.length==0 || StartDate.length==0 || ExpiryDate.length==0){
    alert('Please fill in all mandatory fields!');
    return false;
  }

  var data = {'RoleID':RoleID, 'PackageType':PackageType, 'Product':Product, 'StartDate':StartDate, 'ExpiryDate':ExpiryDate, 'Remarks':Remarks, 'AssurancePlus':AssurancePlus, 'NoAssPlus':NoAssPlus};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.AddNewPackage.json",
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
            getPackageList();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
}

//Get All Package List
function getPackageList(){
  var Organization, Product, Status;
  Organization = $('#packageFilter #organisation').val();
  Status = $('#packageFilter #status').val();
  Product = $('#packageFilter #product').val();

  var data = {'Organization':Organization, 'Status':Status, 'Product':Product};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetPackageList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {'data':JSON.stringify(data),
          'WebPartKey':WebPartVal,
          'ReqGUID': getGUID()},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        var htmlString = '';
        $('.packageTable tbody').html(htmlString);
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var packages = data.d.RetData.Tbl.Rows;
          for (var i=0; i<packages.length; i++ ){
            var startDate = convertDateTime(packages[i].StartDate,'date');
            var expiryDate = convertDateTime(packages[i].ExpiryDate,'date');
            var asp = packages[i].AssurancePlus;
            var assuranceYesNo;
            if (asp=1){
              assuranceYesNo = 'Yes';
            }else{
              assuranceYesNo = 'No';
            }
            htmlString += '<tr id="'+ packages[i].PackageID  +'"> <td>'+packages[i].Organization+'</td> <td>'+packages[i].PackageType+'</td> <td>'+packages[i].Product+'</td> <td>'+assuranceYesNo+'</td> <td>'+startDate+'</td> <td>'+expiryDate+'</td> <td>'+packages[i].Status+'</td> </tr>';
          }
          $('.packageTable tbody').html(htmlString);
          $('.packageTable tbody tr').click(function(){
            var packageId = $(this).attr('id'),
                packageUrl = './packageDetails.html?packageID=' + packageId;
            window.location.href = packageUrl;
          });
        }
      }
    }
  });
};

function getOrgProductList(Organization){
  $('#packageFilter #product').html('');
  $('#packageFilter #product').append('<option value="">-- Please Select --</option>');
  var data = {'Organization':Organization};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.getOrgProductList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var productList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<productList.length; i++ ){
            $('#packageFilter #product').append('<option value="'+productList[i].Product+'">'+productList[i].Product+'</option>');
          }
        }
      }
    }
  });
}

function IsValidDate(inputDate) {
  var re = /^(([0-9])|([0-2][0-9])|([3][0-1]))( )(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)( )\d{4}$/;
  return re.test(inputDate);
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

function getGUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};
