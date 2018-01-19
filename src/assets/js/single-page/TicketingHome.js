var access=false;

$(function(){
  var checkAccess =
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

  //GetDropdownList('#caseAddForm #module, #caseFilter #module', 'module');
  $.when(checkAccess).then(function( x ) {
    getOrgnaisationList();
    getCurrentPackageList();
    getCasesList();
  });

  //Add New Case
  $('#caseAddForm .newCaseSubmitButton').click(function(){
    createNewCase();
  });
  $('#caseFilter .tabBoxButtonSubmit').click(function(){
    getCasesList();
  });

});

//get case list
function getCasesList(){
  var caseContainerTable = $('#caseContainer').find('table'),
      caseThead = caseContainerTable.find('thead'),
      caseTbody = caseContainerTable.find('tbody');

  var Organization, Status, DateFrom, DateTo;
  Organization = $('#caseFilter #organisation').val();
  Status = $('#caseFilter #status').val();
  DateFrom = $('#caseFilter #dateCreatedFrom').val();
  DateTo = $('#caseFilter #dateCreatedTo').val();

  var data = {'Organization':Organization, 'Status':Status, 'DateFrom':DateFrom, 'DateTo': DateTo};
  if (access==false){
    caseThead.html('<tr><th colspan="2">Title</th><th>Type</th><th>Created Date</th><th>Status</th></tr>');
  }
  caseTbody.html('');
  $.ajax({
    url: apiSrc+"BCMain/FL1.GetCasesList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var cases = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<cases.length; i++ ){
            var createdDate = convertDateTime(cases[i].CreatedDate,'date');
            if (access==false){
              htmlString += '<tr id="'+ cases[i].CaseID +'">';
              //color code
              if (cases[i].Status=='Open'){
                htmlString += '<td class="colorCodeActive"></td>';
              }else{
                htmlString += '<td class="colorCodeNonActive"></td>';
              }
              htmlString += '<td>'+cases[i].Title+'</td> <td>'+cases[i].Category+'</td> <td>'+createdDate+'</td> <td><span class="statusNew">'+cases[i].Status+'</span></td> </tr>';
            }else{
              htmlString += '<tr id="'+ cases[i].CaseID +'">';
              //color code
              if (cases[i].Status=='Open'){
                htmlString += '<td class="colorCodeActive"></td>';
              }else{
                htmlString += '<td class="colorCodeNonActive"></td>';
              }
              htmlString += '<td>'+cases[i].Title+'</td> <td>'+cases[i].Category+'</td> <td>'+cases[i].DisplayName+'</td> <td>'+createdDate+'</td> <td><span class="statusNew">'+cases[i].Status+'</span></td> </tr>';
            }
          }
          caseTbody.html(htmlString);
          $('.caseTable tbody tr').click(function(){
            var caseId = $(this).attr('id'),
                caseUrl = './case.html?caseID=' + caseId
            window.location.href = caseUrl;
          });
        }
      }
    }
  });
};

//Create new case
function createNewCase(){
  var Organization, Name, Email, Contact, Title, Details, Category;
  Organization = $('#caseAddForm #organisation').val();
  Name = $('#caseAddForm #name').val();
  Email = $('#caseAddForm #email').val();
  Contact = $('#caseAddForm #contact').val();
  Title = $('#caseAddForm #title').val();
  Details = $('#caseAddForm #description').val();
  Category = $('#caseAddForm #category').val();

  if (Organization.length==0 || Name.length==0 || Email.length==0 || Contact.length==0 || Title.length==0 || Details.length==0){
    alert('Please fill in all mandatory fields!');
    return false;
  }
  if (IsValidEmail(Email)==false){
    alert('Invalid email!');
    return false;
  }
  if (IsValidContact(Contact)==false){
    alert('Invalid contact!');
    return false;
  }

  var data = {'Organization':Organization, 'Name':Name, 'Email':Email, 'Contact': Contact, 'Title': Title, 'Details':Details, 'Category':Category};
  $.ajax({
    url: apiSrc+"BCMain/FL1.AddNewCase.json",
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
            console.log('123')
            getCasesList();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};




function getCurrentPackageList(){
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetCurrentPackages.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':'',
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var packages = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<packages.length; i++ ){
            var date = convertDateTime(packages[i].ExpiryDate,'date');
            htmlString += '<div class="medium-6 large-4 cell clearfix"> <a href="./packageDetails.html?packageID='+packages[i].PackageID+'"> <div class="card"> <div class="grid-x card-divider"> <div class="cell auto"> <h3">'+packages[i].Product+'</h3>'
            htmlString +=	'</div>'
            if (packages[i].ManDaysLeft > 0) {
              htmlString += '<div class="manDays cell small-5"> <div class="grid-y" style="height: 60px;"> <div class="cell small-9"><b>'+packages[i].ManDaysLeft+'</b>/<span class="totalDays">'+packages[i].ManDaysBought+'</span></div> <small class="cell small-3">Man-day(s)</small> </div> </div>'
            }
            htmlString += '</div><!--card-divider--> <div class="card-section"> <div class="packageType">'+packages[i].PackageType+'</div> <div class="expiring">Expiring: <i>'+date+'</i></div> </div> </div> </a> </div>'
          }
          $('.packageGrid').append(htmlString);
        }
      }
    }
  });
};

function getOrgnaisationList(){
  var data = {};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.getOrgnaisationList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length == 1) {
          var org = data.d.RetData.Tbl.Rows[0];
          $('#caseAddForm #organisation, #caseFilter #organisation').append('<option value="'+org.DefaultRoleID+'" selected>'+org.DisplayName+'</option>');
        }else if (data.d.RetData.Tbl.Rows.length > 0) {
          $('#caseAddForm #organisation, #caseFilter #organisation').append('<option value="">-- Please Select --</option>');
          var orgList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<orgList.length; i++ ){
            $('#caseAddForm #organisation, #caseFilter #organisation').append('<option value="'+orgList[i].DefaultRoleID+'">'+orgList[i].DisplayName+'</option>');
          }
        }
      }
    }
  });
}

function IsValidContact(contactno) {
	var re = /^[6389]\d{7}$/;
	return re.test(contactno);
}

function IsValidEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
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

//generate drop down optioms
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
