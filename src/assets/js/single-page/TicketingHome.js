var access=false;

$(function(){

  $("#newUserForm #role").change(function(){
    console.log(1);
    if ($("#newUserForm #role").val()=='Customer'){
      $("#newUserForm #contactPoint").show();
    }else{
      $("#newUserForm #contactPoint").hide();
    }
  });

  $("#packageAddForm #assurancePlus").change(function(){
    if ($("#packageAddForm #assurancePlus").is(':checked')){
      $("#packageAddForm #assurancePlusNo").show();
    }else{
      $("#packageAddForm #assurancePlusNo").val("");
      $("#packageAddForm #assurancePlusNo").hide();
    }
  });

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
          $('#caseAddForm #organisation, #caseFilter #organisation, #packageAddForm #organisation').append('<option value="'+org.DefaultRoleID+'" selected>'+org.DisplayName+'</option>');
        }else if (data.d.RetData.Tbl.Rows.length > 0) {
          $('#caseAddForm #organisation, #caseFilter #organisation, #packageAddForm #organisation').append('<option value="">-- Please Select --</option>');
          var orgList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<orgList.length; i++ ){
            $('#caseAddForm #organisation, #caseFilter #organisation, #packageAddForm #organisation').append('<option value="'+orgList[i].DefaultRoleID+'">'+orgList[i].DisplayName+'</option>');
          }
        }
      }
    }
  });

  /*
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
    */

  getProductOwn();
  $.when(getOrgnaisation).then(function( x ) {
    getCasesList();
    getOrgProductList($('#caseAddForm #organisation').val());
  });

  $("#caseAddForm #organisation").change(function(){
    getOrgProductList($('#caseAddForm #organisation').val());
  });
  //Add New Case
  $('#caseAddForm #submit').click(function(){
    createNewCase();
  });
  $('#caseFilter .tabBoxButtonSubmit').click(function(){
    getCasesList();
  });
  $('#packageAddForm #submit').click(function(){
    addNewPackage();
  });
  $('#newUserForm #submit').click(function(){
    addNewUser();
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
    //caseThead.html('<tr><th colspan="2">Subject</th><th>Type</th><th>Created Date</th><th>Status</th></tr>');
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
            htmlString += '<tr id="'+ cases[i].FLID +'">';
            //color code
            /*if (cases[i].Status=='Open'){
              htmlString += '<td class="colorCodeActive"></td>';
            }else{
              htmlString += '<td class="colorCodeNonActive"></td>';
            }*/
            htmlString += '<td class="colorCodeActive"></td>';
            htmlString += '<td>'+cases[i].Subject+'</td>';
            htmlString += '<td>'+cases[i].Category+'</td>';
            htmlString += '<td>'+cases[i].DisplayName+'</td>';
            htmlString += '<td>'+createdDate+'</td>';
            htmlString += '<td><span class="statusNew">'+cases[i].Status+'</span></td> </tr>';
            /*if (access==false){
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
            }*/
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
  var Organization, ContactPerson, Email, Contact, Subject, Product, Category, Details;
  Organization = $('#caseAddForm #organisation').val();
  ContactPerson = $('#caseAddForm #name').val();
  Email = $('#caseAddForm #email').val();
  Contact = $('#caseAddForm #contact').val();
  Subject = $('#caseAddForm #title').val();
  Product = $('#caseAddForm #product').val();
  Category = $('#caseAddForm #category').val();
  Details = $('#caseAddForm #description').val();

  if (Organization.length==0 || ContactPerson.length==0 || Email.length==0 || Contact.length==0 || Subject.length==0 || Details.length==0){
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

  var data = {'Organization':Organization, 'ContactPerson':ContactPerson, 'Email':Email, 'ContactNo': Contact, 'Subject': Subject, 'Category':Category, 'Details':Details, 'Product':Product};
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
            getCasesList();
          } else {
            alert(data.d.RetData.Tbl.Rows[0].ReturnMsg);
          }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

function getProductOwn(){
  var productContainerTable = $('#packageContainer').find('table'),
      productThead = productContainerTable.find('thead'),
      productTbody = productContainerTable.find('tbody');

  productTbody.html('');

  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetProductOwn.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':'',
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var products = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<products.length; i++ ){
            var expiryDate=convertDateTime(products[i].ExpiryDate,'date');
            htmlString += '<tr id="'+ products[i].Product +'" data-open="caseAddForm">';
            htmlString += '<td>'+products[i].Product+'</td>';
            htmlString += '<td>'+products[i].PackageType+'</td>';
            htmlString += '<td>'+expiryDate+'</td>';
            htmlString += '<td>'+products[i].AssuranceNo+'</td>';
            htmlString += '<td>'+products[i].ManHoursUsed+'</td>';
            htmlString += '</tr>';
          }
        }
        productTbody.html(htmlString);
        $('.packageTable tbody tr').click(function(){
          var Product = $(this).attr('id');
          $('#caseAddForm #product').val(Product);
        });
      }
    }
  });
};

function getOrgProductList(Organization){
  $('#caseAddForm #product').html('');
  $('#caseAddForm #product').append('<option value="">-- Please Select --</option>');
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
            $('#caseAddForm #product').append('<option value="'+productList[i].Product+'">'+productList[i].Product+'</option>');
          }
        }
      }
    }
  });
}

function addNewPackage(){
  var RoleID, PackageType, Product, StartDate, ExpiryDate, AssurancePlus, NoAssPlus, Remarks;
  RoleID = $('#packageAddForm #organisation').val();
  Product = $('#packageAddForm #product').val();
  PackageType =  $('#packageAddForm #type').val();
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
            alert('Package added successfully!');
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
}

function addNewUser(){
  var firstName, lastName, entityKey, mobile, email, country, postalCode, city, state, block, street, unit, building, role, poc1Name, poc1Contact, poc1Email, poc1Designation, poc1Department, poc2Name, poc2Contact, poc2Email, poc2Designation, poc2Department;
  firstName = $('#newUserForm #firstName').val();
  lastName = $('#newUserForm #lastName').val();
  entityKey = $('#newUserForm #entityKey').val();
  mobile =  $('#newUserForm #contact').val();
  email = $('#newUserForm #email').val();
  country = $('#newUserForm #country').val();
  postalCode = $('#newUserForm #postalCode').val();
  city = $('#newUserForm #city').val();
  state = $('#newUserForm #state').val();
  block = $('#newUserForm #blockNo').val();
  street = $('#newUserForm #street').val();
  unit = $('#newUserForm #unitNo').val();
  building = $('#newUserForm #building').val();
  role = $('#newUserForm #role').val();
  poc1Name = $('#newUserForm #poc1Name').val();
  poc1Contact = $('#newUserForm #poc1Contact').val();
  poc1Email = $('#newUserForm #poc1Email').val();
  poc1Designation = $('#newUserForm #poc1Designation').val();
  poc1Department = $('#newUserForm #poc1Department').val();
  poc2Name = $('#newUserForm #poc2Name').val();
  poc2Contact = $('#newUserForm #poc2Contact').val();
  poc2Email = $('#newUserForm #poc2Email').val();
  poc2Designation = $('#newUserForm #poc2Designation').val();
  poc2Department = $('#newUserForm #poc2Department').val();

  if (firstName == '' || lastName == '' || entityKey == '' || mobile == '' || email == '' || role == ''){
    alert('Please fill in all mandatory fields!');
    return false;
  }
  if (!IsValidContact(mobile)){
    alert('Contact No is not in correct format, please check!');
    return false;
  }if (!IsValidEmail(email)){
    alert('Email is not in correct format, please check!');
    return false;
  }

  var data = {'firstName':firstName, 'lastName':lastName, 'entityKey':entityKey, 'mobile':mobile, 'email':email, 'country':country, 'postalCode':postalCode, 'city':city, 'state':state, 'block':block, 'street':street, 'unit':unit, 'building':building, 'role':role, 'poc1Name':poc1Name, 'poc1Contact':poc1Contact, 'poc1Email':poc1Email, 'poc1Designation':poc1Designation, 'poc1Department':poc1Department, 'poc2Name':poc2Name, 'poc2Contact':poc2Contact, 'poc2Email':poc2Email, 'poc2Designation':poc2Designation, 'poc2Department':poc2Department};

  $.ajax({
    url: apiSrc+"BCMain/Ctc1.AddNewUser1.json",
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
            alert('New user added successfully!');
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
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

function getGUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};
