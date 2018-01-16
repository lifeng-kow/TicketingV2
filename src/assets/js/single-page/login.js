var appCookie;
var loginComponent;
var loginCallOut;

$(function(){
  //get login details
  loginComponent = $('#loginComponent');
  loginCallOut = loginComponent.find('.formCallout');

  appCookie = Cookies.getJSON('appCookie');
  if (appCookie.loginID){
    window.location.href = 'Ticketing/TicketingHome.html';
  }
  checkRememberMe();

  $('#loginComponent').keyup(function(e){
    if(e.keyCode == 13){
        initLogin(apiSrc);
    }
  });
  $('#submit').click(function() {
    initLogin(apiSrc);
  });
});//onready

function initLogin(apiSrc) {
  var data = {
    'Username': $('#username').val(),
    'Password': $('#password').val(),
    'RememberMe':  $('#rememberMe').is(':checked')
  };

  $.ajax({
    url: apiSrc+"BCMain/Sec1.Login.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: {
      'data': JSON.stringify(data),
      'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    }
  })
  .done(function(data) {
      getLoginInfo(true);
  })
  .fail(function( jqXHR, textStatus ) {
    console.log( "Login fail" );
    console.log(jqXHR);
    console.log( "Request failed: " + textStatus );
    loginCallOut.addClass('alert').html('Login fail.').show();
  });
} //login

function getLoginInfo(callout) {
  $.when(
    $.ajax({
      url: apiSrc+"BCMain/Sec1.LoginInfo.json",
      method: "POST",
      dataType: "json",
      xhrFields: { withCredentials: true },
      data: {
        'data': {},
        'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
        'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
      }
    })
    .done(function(data) {
      console.log( "getLoginInfo success" );
      return true;
    })
    .fail(function( jqXHR, textStatus ) {
      console.log( "Get ID fail" );
      console.log(jqXHR);
      console.log( "Request failed: " + textStatus );
      return false;
    }),
    $.ajax({
      url: apiSrc+"iCtc1.GetOwnPersonID.json",
      method: "POST",
      dataType: "json",
      xhrFields: { withCredentials: true },
      data: {
        'data': {},
        'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
        'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
      }
    })
    .done(function(data) {
      console.log( "getOwnPersonID success" );
      return true;
    })
    .fail(function( jqXHR, textStatus ) {
      console.log( "Get ID fail" );
      console.log(jqXHR);
      console.log( "Request failed: " + textStatus );
      return false;
    })
  ).done(function(action1, action2) {
    // Handle both XHR objects
    var dataReturned1 = action1[0].d.RetData;
    var dataReturned2 = action2[0].d.RetData.Tbl.Rows[0];

    appCookie = Cookies.getJSON('appCookie');

    appCookie.username = dataReturned1.Username;
    appCookie.dispName = dataReturned1.DispName;
    appCookie.loginID = dataReturned1.LoginID;
    appCookie.personID = dataReturned2.PersonID;
    Cookies.set('appCookie', appCookie);

    if (appCookie.loginID || !appCookie.redirectPage || appCookie.redirectPage==undefined){
      window.location.href = 'Ticketing/TicketingHome.html';
    }else{
      window.location.href = appCookie.redirectPage;
    }
  }).fail(function( jqXHR, textStatus ) {
    console.log( "Login Info fail to get" );
    console.log(jqXHR);
    console.log( "Request failed: " + textStatus );
    if (callout) loginCallOut.addClass('alert').html('Login fail.').show();
  });;
} //getLoginInfo


  function checkRememberMe() {
      $.ajax({
        url: apiSrc+"Sec1.LoginViaRememberMe.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
          'data': JSON.stringify(''),
          'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
          'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
        }
      })
      .done(function(data) {
        getLoginInfo(false);
      })
      .fail(function( jqXHR, textStatus ) {
        console.log( "Login fail" );
        console.log(jqXHR);
        console.log( "Request failed: " + textStatus );
      });
    } //checkRememberMe
