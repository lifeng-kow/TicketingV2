var appCookie;

$(function(){

  appCookie = Cookies.getJSON('appCookie');
  if (appCookie.personID) {
     GetBasicInformation(appCookie.personID);
  }

  $('#passwordForm,#changeMyPwd').keyup(function(e){
    if(e.keyCode == 13){
      var NewUserName, Password;
      NewUserName = $('#newUserName').val();
      Password = $('#newPassword').val();
      if (checkPassword()){
        changeMyPwd(NewUserName, Password);
      }
    }
  });
  $('#passwordForm #passwordSubmit, #changeMyPwd #submit').click(function(){
    var NewUserName, Password;
    NewUserName = $('#newUserName').val();
    Password = $('#newPassword').val();
    if (checkPassword()){
      changeMyPwd(NewUserName, Password);
    }
  });
});//onready

function getOrgnisationInfo(PersonID){
  var data = {'PersonID':PersonID};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.GetOrganisationInfo.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var organisationInfo = data.d.RetData.Tbl.Rows[0];
          showOrgProfile();
          $('.orgName').html(organisationInfo.DisplayName);
          $('.idType').html(organisationInfo.EntityKeyType);
          $('.entityKey').html(organisationInfo.EntityKey);
          $('.orgContact').html(organisationInfo.Tel1);
          $('.orgEmail').html(organisationInfo.Email1);
          $('.orgAddress').html(organisationInfo.FullAddress);
          $('#name').val(organisationInfo.DisplayName);
          $('#entityKey').val(organisationInfo.EntityKey);
          $('#tel1').val(organisationInfo.Tel1);
          $('#email').val(organisationInfo.Email1);
          $('#country').val(organisationInfo.Country);
          $('#postalCode').val(organisationInfo.PostalCode);
          $('#city').val(organisationInfo.City);
          $('#state').val(organisationInfo.State);
          $('#blockNo').val(organisationInfo.AddrP1);
          $('#street').val(organisationInfo.AddrP3);
          $('#unit').val(organisationInfo.AddrP2);
          $('#building').val(organisationInfo.AddrP4);
        }
      }
    }
  });
};

function getPointofContact(PersonID){
  showOrgContact();
  var data = {'PersonID':PersonID};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.GetPointOfContactInfo.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: {'data':JSON.stringify(data),
          'WebPartKey':WebPartVal,
          'ReqGUID': getGUID()},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var pointOfContact = data.d.RetData.Tbl.Rows[0];
          $('.poc1Name').html(pointOfContact.POCName);
          $('.poc1Contact').html(pointOfContact.POCContact);
          $('.poc1Email').html(pointOfContact.POCEmail);
          $('.poc1Designation').html(pointOfContact.POCDesi);
          $('.poc1Department').html(pointOfContact.POCDept);
          $('.poc2Name').html(pointOfContact.POCName1);
          $('.poc2Contact').html(pointOfContact.POCContact1);
          $('.poc2Email').html(pointOfContact.POCEmail1);
          $('.poc2Designation').html(pointOfContact.POCDesi1);
          $('.poc2Department').html(pointOfContact.POCDept1);

          $('#poc1Name').val(pointOfContact.POCName);
          $('#poc1Contact').val(pointOfContact.POCContact);
          $('#poc1Email').val(pointOfContact.POCEmail);
          $('#poc1Designation').val(pointOfContact.POCDesi);
          $('#poc1Department').val(pointOfContact.POCDept);
          $('#poc2Name').val(pointOfContact.POCName1);
          $('#poc2Contact').val(pointOfContact.POCContact1);
          $('#poc2Email').val(pointOfContact.POCEmail1);
          $('#poc2Designation').val(pointOfContact.POCDesi1);
          $('#poc2Department').val(pointOfContact.POCDept1);
        }
      }
    }
  });
};

function changeMyPwd(Username, Password){
  var data = { "Username": Username, "Password": Password };
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.ChangeUsernamePassword.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: { 'data': JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      window.location = '/profile.html';
    },
    error: function(XMLHttpRequest, data, errorThrown){
      alert("Error: " + errorThrown);
    }
  })
}

function checkPassword() {
	var NewPassword = $('#newPassword').val(),
      ConfirmPassword = $('#newPasswordConfirm').val();
	if (NewPassword === '') {
		alert('New password is required.');
    return false;
	} else if (ConfirmPassword === ''){
    alert('Confirm password is required.');
    return false;
  }else if (NewPassword != ConfirmPassword) {
    alert('Two passwords do not match.');
    return false;
	}else{
    return true;
  }
}

function GetBasicInformation(personID) {
  var data = {'PersonID': personID};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.GetPersonalInfo.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: { 'data': JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetData.Tbl.Rows.length > 0)) {
        var personalInfo = data.d.RetData.Tbl.Rows[0];
        if (personalInfo.EntityType == 'O'){
          getOrgnisationInfo(appCookie.personID);
          getPointofContact(appCookie.personID);
        }else{
          showIndProfile();
          $('.indName').html(personalInfo.DisplayName);
          $('.indTel').html(personalInfo.Tel1);
          $('.indMobile').html(personalInfo.Mobile);
          $('.indEmail').html(personalInfo.Email1);
          $('.indAddress').html(personalInfo.FullAddress);
          $('#name').val(personalInfo.DisplayName);
          $('#tel1').val(personalInfo.Tel1);
          $('#mobile').val(personalInfo.Mobile);
          $('#email').val(personalInfo.Email1);
          $('#country').val(personalInfo.Country);
          $('#postalCode').val(personalInfo.PostalCode);
          $('#city').val(personalInfo.City);
          $('#state').val(personalInfo.State);
          $('#blockNo').val(personalInfo.AddrP1);
          $('#street').val(personalInfo.AddrP3);
          $('#unit').val(personalInfo.AddrP2);
          $('#building').val(personalInfo.AddrP4);
        }
      }
    },
    error: function(XMLHttpRequest, data, errorThrown){
      alert("Error: " + errorThrown);
    }
  }).fail(function( jqXHR, textStatus ) {
    console.log( "Login fail" );
    console.log(jqXHR);
    console.log( "Request failed: " + textStatus );
  });
}

function updateIndBasic(PersonID){
  var name, tel1, mobile, email, country, postalCode, city, state, blockNo, street, unit, building;
  name = $('#name').val();
  tel1 = $('#tel1').val();
  mobile = $('#mobile').val();
  email = $('#email').val();
  country = $('#country').val();
  postalCode = $('#postalCode').val();
  city = $('#city').val();
  state = $('#state').val();
  blockNo = $('#blockNo').val();
  street = $('#street').val();
  unit = $('#unit').val();
  building = $('#building').val();

  if (IsValidContact(tel1)==false || IsValidContact(mobile)==false){
    alert('Invalid contact!');
    return false;
  }if (IsValidEmail(email)==false){
    alert('Invalid email!');
    return false;
  }

  var data = { "PID": PersonID, "name": name, "tel1": tel1, "mobile": mobile, "email": email, "country": country, "postalCode": postalCode, "city": city, "state": state, "blockNo": blockNo, "street": street, "unit": unit, "building": building };
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.UpdateIndBasic.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: { 'data': JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            location.reload();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(XMLHttpRequest, data, errorThrown){
      alert("Error: " + errorThrown);
    }
  })
}

function updateOrgBasic(PersonID){
  var name, entityKey, tel1, email, country, postalCode, city, state, blockNo, street, unit, building;
  name = $('#name').val();
  entityKey = $('#entityKey').val();
  tel1 = $('#tel1').val();
  email = $('#email').val();
  country = $('#country').val();
  postalCode = $('#postalCode').val();
  city = $('#city').val();
  state = $('#state').val();
  blockNo = $('#blockNo').val();
  street = $('#street').val();
  unit = $('#unit').val();
  building = $('#building').val();

  if (IsValidContact(tel1)==false){
    alert('Invalid contact!');
    return false;
  }if (IsValidEmail(email)==false){
    alert('Invalid email!');
    return false;
  }

  var data = { "PID": PersonID, "name": name, "entityKey": entityKey, "tel1": tel1, "email": email, "country": country, "postalCode": postalCode, "city": city, "state": state, "blockNo": blockNo, "street": street, "unit": unit, "building": building };
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.UpdateOrgBasic.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: { 'data': JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      console.log(data);
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            location.reload();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(XMLHttpRequest, data, errorThrown){
      alert("Error: " + errorThrown);
    }
  })
}

function updateContactPoint(PersonID){
  var poc1Name, poc1Contact, poc1Email, poc1Designation, poc1Department, poc2Name, poc2Contact, poc2Email, poc2Designation, poc2Department;
  poc1Name = $('#poc1Name').val();
  poc1Contact = $('#poc1Contact').val();
  poc1Email = $('#poc1Email').val();
  poc1Designation = $('#poc1Designation').val();
  poc1Department = $('#poc1Department').val();
  poc2Name = $('#poc2Name').val();
  poc2Contact = $('#poc2Contact').val();
  poc2Email = $('#poc2Email').val();
  poc2Designation = $('#poc2Designation').val();
  poc2Department = $('#poc2Department').val();

  if (IsValidContact(poc1Contact)==false || IsValidContact(poc2Contact)==false){
    alert('Invalid contact!');
    return false;
  }if (IsValidEmail(poc1Email)==false || IsValidEmail(poc2Email)==false){
    alert('Invalid email!');
    return false;
  }

  var data = { "PID": PersonID, "poc1Name": poc1Name, "poc1Contact": poc1Contact, "poc1Email": poc1Email, "poc1Designation": poc1Designation, "poc1Department": poc1Department, "poc2Name": poc2Name, "poc2Contact": poc2Contact, "poc2Email": poc2Email, "poc2Designation": poc2Designation, "poc2Department": poc2Department };
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.UpdateContactPoint.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: { 'data': JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            location.reload();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(XMLHttpRequest, data, errorThrown){
      alert("Error: " + errorThrown);
    }
  })
}

function showOrgProfile(){
  var orgProfile = '';
  orgProfile = '<div class="toggleContent"><div id="basicContent" class="grid-container form">'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <div class="labelText"> Name </div> <div class="text orgName"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <div class="labelText"> UEN No </div> <div class="text entityKey"> </div> </div>'+
  '<div class="cell small-12 medium-6"> <div class="labelText"> ID Type </div> <div class="text idType"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <div class="labelText"> Contact No </div> <div class="text orgContact"> </div> </div>'+
  '<div class="cell small-12 medium-6"><div class="labelText"> Email </div> <div class="text orgEmail"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <div class="labelText"> Address </div> <div class="text orgAddress"> </div> </div> </div> </div>'+
  '<form id="basicForm" class="grid-container">'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <label for="name"> Name </label> <input type="text" id="name"/> </div>'+
  '<div class="cell small-12 medium-6"> <label for="tel1"> UEN No </label> <input type="text" id="entityKey"/> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <label for="tel1"> Contact No </label> <input type="text" id="tel1"/> </div>'+
  '<div class="cell small-12 medium-6"> <label for="email"> Email </label> <input type="text" id="email"/> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-3"> <label for="address"> Country </label> <input type="text" id="country"/> </div>'+
  '<div class="cell small-12 medium-3"> <label for="address"> Postal Code </label> <input type="text" id="postalCode"/> </div>'+
  '<div class="cell small-12 medium-3"> <label for="address"> City </label> <input type="text" id="city"/> </div>'+
  '<div class="cell small-12 medium-3"> <label for="address"> State </label> <input type="text" id="state"/> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-3"> <label for="address"> Block / House No. </label> <input type="text" id="blockNo"/> </div>'+
  '<div class="cell small-12 medium-6"> <label for="address"> Street </label> <input type="text" id="street"/> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-3"> <label for="address"> Uit(#00-0000) </label> <input type="text" id="unit"/> </div>'+
  '<div class="cell small-12 medium-6"> <label for="address"> Building </label> <input type="text" id="building"/> </div> </div>'+
  '<footer class="grid-x grid-padding-x"> <button type="button" id="basicSubmit" data-close class="btn cell small-12 medium-offset-4 medium-4">Submit</button> </footer> </form> </div>';

  $('#profileData').append(orgProfile);
  $('#basicForm').hide();
  $('#basicSubmit').click(function(){
    console.log(appCookie.personID);
    updateOrgBasic(appCookie.personID);
  });
}

function showIndProfile(){
  var indProfile = '';
  indProfile = '<div class="toggleContent"><div id="basicContent" class="grid-container form">'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <div class="labelText"> Name </div> <div class="text indName"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-4"> <div class="labelText"> Contact No (O) </div> <div class="text indTel"> </div> </div>'+
  '<div class="cell small-12 medium-4"> <div class="labelText"> Contact No (M) </div> <div class="text indMobile"> </div> </div>'+
  '<div class="cell small-12 medium-4"> <div class="labelText"> Email </div> <div class="text indEmail"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <div class="labelText"> Address </div> <div class="text indAddress"> </div> </div> </div> </div>'+
  '<form id="basicForm" class="grid-container">'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <label for="name"> Name </label> <input type="text" id="name"/> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-4"> <label for="tel1"> Contact No (O) </label> <input type="text" id="tel1"/> </div>'+
  '<div class="cell small-12 medium-4"> <label for="mobile"> Contact No (M) </label> <input type="text" id="mobile"/> </div>'+
  '<div class="cell small-12 medium-4"> <label for="email"> Email </label> <input type="text" id="email"/> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-3"> <label for="address"> Country </label> <input type="text" id="country"/> </div>'+
  '<div class="cell small-12 medium-3"> <label for="address"> Postal Code </label> <input type="text" id="postalCode"/> </div>'+
  '<div class="cell small-12 medium-3"> <label for="address"> City </label> <input type="text" id="city"/> </div>'+
  '<div class="cell small-12 medium-3"> <label for="address"> State </label> <input type="text" id="state"/> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-3"> <label for="address"> Block / House No. </label> <input type="text" id="blockNo"/> </div>'+
  '<div class="cell small-12 medium-6"> <label for="address"> Street </label> <input type="text" id="street"/> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-3"> <label for="address"> Uit(#00-0000) </label> <input type="text" id="unit"/> </div>'+
  '<div class="cell small-12 medium-6"> <label for="address"> Building </label> <input type="text" id="building"/> </div> </div>'+
  '<footer class="grid-x grid-padding-x"> <button type="button" id="basicSubmit" data-close class="btn cell small-12 medium-offset-4 medium-4">Submit</button> </footer> </form> </div>';

  $('#profileData').append(indProfile);
  $('#basicForm').hide();
  $('#contactPointData').hide();
  $('#basicSubmit').click(function(){
    updateIndBasic(appCookie.personID);
  });
}

function showOrgContact(){
  var contactPoint = '';
  contactPoint='<div class="toggleContent"><div id="contactPointContent" class="grid-container form">'+
  '<h3>Point of Contact 1</h3>'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <div class="labelText"> Name </div> <div class="text poc1Name"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <div class="labelText"> Contact No </div> <div class="text poc1Contact"> </div> </div>'+
  '<div class="cell small-12 medium-6"> <div class="labelText"> Email </div> <div class="text poc1Email"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <div class="labelText"> Designation </div> <div class="text poc1Designation"> </div> </div>'+
  '<div class="cell small-12 medium-6"> <div class="labelText"> Department </div> <div class="text poc1Department"> </div> </div> </div>'+
  '<h3>Point of Contact 2</h3>'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <div class="labelText"> Name </div> <div class="text poc2Name"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <div class="labelText"> Contact No </div> <div class="text poc2Contact"> </div> </div>'+
  '<div class="cell small-12 medium-6"> <div class="labelText"> Email </div> <div class="text poc2Email"> </div> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <div class="labelText"> Designation </div> <div class="text poc2Designation"> </div> </div>'+
  '<div class="cell small-12 medium-6"> <div class="labelText"> Department </div> <div class="text poc2Department"> </div> </div> </div> </div>'+
  '<form id="contactPointForm" class="grid-container">'+
  '<h3>Point of Contact 1</h3>'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <label for="poc1Name"> Name </label> <input type="text" id="poc1Name" /> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <label for="poc1Contact"> Contact No  </label> <input type="text" name="poc1Contact" id="poc1Contact" /> </div>'+
  '<div class="cell small-12 medium-6"> <label for="poc1Email"> Email </label> <input type="text" id="poc1Email" /> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <label for="poc1Designation"> Designation </label> <input type="text" id="poc1Designation" /> </div>'+
  '<div class="cell small-12 medium-6"> <label for="poc1Department"> Department </label> <input type="text" id="poc1Department" /> </div> </div>'+
  '<h3>Point of Contact 2</h3>'+
  '<div class="grid-x grid-padding-x"> <div class="cell"> <label for="poc2Name"> Name </label> <input type="text" id="poc2Name" /> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <label for="poc2Contact"> Contact No  </label> <input type="text" id="poc2Contact" /> </div>'+
  '<div class="cell small-12 medium-6"> <label for="poc2Email"> Email </label> <input type="text" id="poc2Email" /> </div> </div>'+
  '<div class="grid-x grid-padding-x"> <div class="cell small-12 medium-6"> <label for="poc2Designation"> Designation </label> <input type="text" id="poc2Designation" /> </div>'+
  '<div class="cell small-12 medium-6"> <label for="poc2Department"> Department </label> <input type="text" id="poc2Department" /> </div> </div>'+
  '<footer class="grid-x grid-padding-x"> <button type="button" id="pocSubmit" data-close class="btn cell small-12 medium-offset-4 medium-4"> Submit </button> </footer> </form> </div>';

  $('#contactPointData').append(contactPoint);
  $('#contactPointForm').hide();
  $('#pocSubmit').click(function(){
    updateContactPoint(appCookie.personID);
  });
}

function getGUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};

function IsValidContact(contactno) {
	var re = /^[6389]\d{7}$/;
	return re.test(contactno);
}

function IsValidEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}
