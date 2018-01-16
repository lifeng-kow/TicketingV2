
$(function(){

  //get caseID from URL
  var urlParams = new URLSearchParams(window.location.search),
      caseID = urlParams.get('caseID');

  $.when(GetAvailablePackage(caseID),getStaffList()).then(function () {
    GetCaseDetails(caseID);
    GetCaseHistory(caseID);
	});

  checkAccess();

  $("#review #approval").change(function(){
    if ($("#review #approval").val()=='Yes'){
      $('#reviewForm #availablePackage, #reviewForm .charge').show();
    }else{
      $('#reviewForm #availablePackage, #reviewForm .charge').hide();
    }
  });

  $("#reviewForm #charges").change(function(){
    if ($("#reviewForm #charges").val() > 0){
      $('#reviewForm #chargeForm').show();
    }else{
      $('#reviewForm #chargeForm, #reviewForm .charge').hide();
    }
  });

  //Review submit
  $('#reviewForm .charge').click(function(){
    chargeToPackage(caseID);
  });

  //Add New Log
  $('#submit').click(function(){
    editCase(caseID);
  });
});

function GetAvailablePackage(caseId){
  $('#packageChoice').html('');
  var html = '<option value="0">-- Please Select --</option>';
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetAvailablePackage.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify({'CaseID':caseId}),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var availablePackage = data.d.RetData.Tbl.Rows;
          for (var i=0; i<availablePackage.length; i++ ){
            html += '<option value="'+availablePackage[i].PackageID+'">'+availablePackage[i].AvailablePackage+'</option>';
          }
        }
      }else {
        alert(data.d.RetMsg);
      }
      $('#packageChoice').html(html);
    }
  });
}

//Get Case Details
function GetCaseDetails(caseId){
  $.ajax({
    url: apiSrc+"BCMain/FL1.GetCasesDetails.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify({'CaseID':caseId}),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var caseDetails = data.d.RetData.Tbl.Rows[0];
          var createdDate = convertDateTime(caseDetails.CreatedDate, 'datetime'),
              updatedDate = convertDateTime(caseDetails.ModifiedDate, 'datetime');
          $('#summary .organisation').html(caseDetails.Organisation);
          $('#summary .name').html(caseDetails.Name);
          $('#summary .email').html(caseDetails.Email);
          $('#summary .contact').html(caseDetails.Contact);
          $('#summary .title').html(caseDetails.Title);
          $('#summary .category').html(caseDetails.Category);
          $('#summary .details').html(caseDetails.Details);
          $('#summary .createdDate').html(createdDate);
          $('#summary .updatedDate').html(updatedDate);
          $('#information #status').val(caseDetails.Status);
          $('#information #statusRemarks').val(caseDetails.StatusRemarks);
          $('#information #dateFrom').val(caseDetails.DateFrom);
          $('#information #dateTo').val(caseDetails.DateTo);
          $('#information #assignedTo').val(caseDetails.AssignedTo);
          $('#review #notes').val(caseDetails.Notes);
          $('#review #category').val(caseDetails.Category);
          $('#review #charges').val(caseDetails.ManDays);
          $('#review #approval').val(caseDetails.Approval);
          $('#review #approvalRemarks').val(caseDetails.ApprovalRemarks);
          $('#reviewForm #packageChoice').val(caseDetails.BillToPackageID);
          if (caseDetails.ManDays == 0 || caseDetails.ManDays == ''){
            $('#reviewForm #chargeForm').hide();
          }
          if (caseDetails.Approval=='No' || caseDetails.Approval == ''){
            $('#reviewForm #availablePackage, #reviewForm .charge').hide();
          }else{
            $('#reviewForm #availablePackage, #reviewForm .charge').show();
          }
          if (caseDetails.BillToPackageID!=''){
            $('#reviewForm .charge').hide();
          }
          if ($('#reviewForm #packageChoice').val().length==0){
            $('#packageChoice').append('<option value="'+caseDetails[i].BillToPackageID+'">'+caseDetails[i].PackageDetail+'</option>');
            $('#reviewForm #packageChoice').val(caseDetails.BillToPackageID);
          }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

function GetCaseHistory(caseId){
  var caseHistoryTable = $('#log').find('table'),
      caseHistoryTbody = caseHistoryTable.find('tbody');
  var html = ''
  $.ajax({
    url: apiSrc+"BCMain/FL1.GetCaseHistory.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify({'CaseID':caseId}),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var caseHistory = data.d.RetData.Tbl.Rows;
          for (var i=0; i<caseHistory.length; i++ ){
            var ChangeDate = convertDateTime(caseHistory[i].ChangeDate, 'datetime');
            html += '<tr> <td>'+ChangeDate+'</td> <td>'+caseHistory[i].ChangeBy+'</td> <td>'+caseHistory[i].ChangesMade+'</td> </tr>';
          }
        }
        caseHistoryTbody.html(html);
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

//Review Case
function editCase(caseID){
  var Status, StatusRemarks, DateFrom, DateTo, AssignedTo, Notes, ManDays, Approval, ApprovalRemarks, Category;
  Status = $('#information #status').val();
  StatusRemarks = $('#information #statusRemarks').val();
  DateFrom = $('#information #dateFrom').val();
  DateTo = $('#information #dateTo').val();
  AssignedTo = $('#information #assignedTo').val();
  Notes = $('#reviewForm #notes').val();
  ManDays = $('#reviewForm #charges').val();
  Approval = $('#reviewForm #approval').val();
  ApprovalRemarks = $('#reviewForm #approvalRemarks').val();
  Category = $('#reviewForm #category').val();

  if (IsValidManDay(ManDays)==false){
    alert('Please fill day in whole/decimal .5 only!');
    return false;
  }

  var data = {'CaseID':caseID, 'Status':Status, 'StatusRemarks': StatusRemarks, 'DateFrom': DateFrom,'DateTo': DateTo,'AssignedTo': AssignedTo,'Notes': Notes,'ManDays': ManDays,'Approval': Approval,'ApprovalRemarks': ApprovalRemarks,'Category': Category};
  $.ajax({
    url: apiSrc+"BCMain/FL1.EditCase.json",
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
            $.when(GetAvailablePackage(caseID)).then(function () {
              GetCaseDetails(caseID);
              GetCaseHistory(caseID);
          	});
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

function chargeToPackage(caseID){
  var packageID;
  packageID = $('#reviewForm #packageChoice').val();

  if (packageID.length==0){
    alert('Please select package to charge!');
    return false;
  }
  editCase(caseID);
  var data = {'CaseID':caseID, 'packageID':packageID};
  $.ajax({
    url: apiSrc+"BCMain/FL1.ChargeToPackageID.json",
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
            $.when(GetAvailablePackage(caseID)).then(function () {
              GetCaseDetails(caseID);
              GetCaseHistory(caseID);
          	});
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

function checkAccess(){
  var data = {};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.CheckIsAdmin.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var access = data.d.RetData.Tbl.Rows[0];
          if (access.CanAccess==true){
            $("#reviewForm .charge, #submit").show();
          }else{
            $("#reviewForm .charge, #submit").hide();
            $("input").prop('readOnly', true);
            $("select").prop('disabled', true);
          }
        }
      }
    }
  });
}

function getStaffList(){
  $('#information #assignedTo').html('<option value="">-- Please Select --</option>');
  var html = '';
  var data = {};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.GetStaffList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var staffList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<staffList.length; i++ ){
            html+=('<option value="'+staffList[i].RoleID+'">'+staffList[i].StaffDetails+'</option>');
          }
        }
      }
      $('#information #assignedTo').html(html);
    }
  });
}

function IsValidDate(inputDate) {
  var re = /^(([0-9])|([0-2][0-9])|([3][0-1]))( )(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)( )\d{4}$/;
  return re.test(inputDate);
}

function IsValidManDay(ManDay) {
	var re = /^\d*(\.[05])?$/;
	return re.test(ManDay);
}

//convert date to dd/mm/yyyy
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
