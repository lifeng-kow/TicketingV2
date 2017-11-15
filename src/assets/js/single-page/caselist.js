
$(function(){
  //get cookie
  var appCookie = Cookies.getJSON('appCookie');
  //get loginid
  var loginID = appCookie.loginID;

  GetBasicInformation(appCookie.personID);
  var caseContainer = $('#caseContainer');
  getCasesList(caseContainer,'','','','','','',loginID);

  $('#caseFilter .tabBoxButtonSubmit').click(function(){
    var System, Module, DateFrom, DateTo, MyCase;
    var Status = "";
    $.each($("input[name='status']:checked"), function(){
      //Status.push($(this).val());
      Status = Status +$(this).val() + ",";
    });
    Status = Status.slice(0, -1);
    System = $('#product').val();
    Module = $('#module').val();
    DateFrom = $('#dateCreatedFrom').val();
    DateTo = $('#dateCreatedTo').val();
    MyCase = $('#statusMyCase').val();
    getCasesList(caseContainer,System,Module,Status,DateFrom,DateTo,MyCase,loginID);
    return false;
  });
  $('#caseAddForm .newCaseSubmitButton').click(function(){
    var Organization, Product, System, Module, Title, Details, CCEmails;
    Organization = $('#caseAddForm #organisation').val();
    Product = $('#caseAddForm #product').val();
    System = $('#caseAddForm #system').val();
    Module = $('#caseAddForm #module').val();
    Title = $('#title').val();
    Details = $('#description').val();
    CCEmails = $('#cc').val();
    createNewCase(Organization, Product, System, Module, Title, Details, CCEmails, loginID);
  });
});


//get case list
function getCasesList(caseContainer, System, Module, Status, DateFrom, DateTo, MyCase, LoginID){
  var caseContainerTable = caseContainer.find('table');
  var caseTbody = caseContainerTable.find('tbody');
  var data = {'LoginID':LoginID,'System':System,'Module':Module,'Status':Status,'DateFrom':DateFrom,'DateTo':DateTo,'MyCase':MyCase};
  caseTbody.html('');
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.GetCasesList.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var cases = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<cases.length; i++ ){
            var date = convertDate(cases[i].CreatedDate);
            htmlString += '<tr id="'+ cases[i].FLID +'">';
            if (cases[i].CurStatus=='New' || cases[i].CurStatus=='Progressing' ){
              htmlString += '<td class="colorCodeActive"></td>';
            }else if (cases[i].CurStatus=='Reviewed' || cases[i].CurStatus=='Reviewed & Pending Quote'){
                htmlString += '<td class="colorCodePending"></td>';
            }else{
              htmlString += '<td class="colorCodeNonActive"></td>';
            }
            htmlString += '<td>'+cases[i].Title+'</td>';
            htmlString += '<td>'+cases[i].OrganizationName+'</td>';
            htmlString += '<td>'+cases[i].ManDays+'</td>';
            htmlString += '<td>'+cases[i].Module+'</td>';
            htmlString += '<td>'+date+'</td>';
            htmlString += '<td><span class="statusNew">'+cases[i].CurStatus+'</span></td>';
            htmlString += '</tr>';
          }
          caseTbody.html(htmlString);
          $('.caseTable tbody tr').click(function(){
            var caseId = $(this).attr('id');
            var caseUrl = '/case.html?caseID=' + caseId
            window.location.href = caseUrl;
          });
          //GetCaseDetails(caseTbody.find('tr'));
        }
      }
    }
  });
};

//Create new case
function createNewCase(Organization, Product, System, Module, Title, Details, CCEmails, LoginID){
  var data = {'Organization':Organization, 'Product':Product, 'System':System, 'Module': Module,
              'Title': Title, 'Details':Details, 'CCEmail':CCEmails, 'LoginID':LoginID};
  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/FL1.AddNewCase.json",
    method: "POST",
    dataType: "json",
    data: {'data':JSON.stringify(data),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'},
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            getCasesList($('#caseContainer'),'','','','','','',LoginID);
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    }
  });
};

function GetBasicInformation(personID) {
  var data = {'PersonID': personID}

  $.ajax({
    url: "https://portal.taksys.com.sg/Support/BCMain/iCtc1.GetPersonalInfo.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify(data),
      'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    }
  })
  .done(function(data) {
    if ((data) && (data.d.RetData.Tbl.Rows.length > 0)) {
      $('.profileName').html(data.d.RetData.Tbl.Rows[0].DisplayName);
    }
  });
}

//convert date to dd/mm/yyyy
function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
};
