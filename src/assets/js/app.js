import $ from 'jquery';
import Cookies from 'js-cookie';
import whatInput from 'what-input';
import Master from './lib/master';

window.$ = $;
window.Cookies = Cookies;


import Foundation from 'foundation-sites';
// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
//import './lib/foundation-explicit-pieces';

$(document).foundation();

var appCookie, igwasCookie;
window.WebPartVal='';

//document ready
$(function(){

  window.Master = new Master();
  //get page name
  pageName = $('body').attr('id').replace('page-','');

  igwasCookie = Cookies.getJSON('IGWAS');
  if (igwasCookie){
    WebPartVal = getCookie(igwasCookie, 'WebPartKey');
  }else{
    WebPartVal = '021cb7cca70748ff89795e3ad544d5eb';
  }

  //set login cookie
  if (typeof Cookies.getJSON('appCookie') === 'undefined') {
    appCookie = Cookies.set('appCookie', {
    },
    { expires: 1 });
  }
  else {
    appCookie = Cookies.getJSON('appCookie');
  }

  if (!appCookie.username && pageName.toLowerCase() != 'login') {
    var pageURL = window.location.href;
    if (typeof Cookies.getJSON('appCookie') !== 'undefined') {
      appCookie = Cookies.getJSON('appCookie');
    }
    appCookie.redirectPage = (pageURL != '') ? pageURL : appRootPath+'index.html';
    Cookies.set('appCookie', appCookie);
    window.location.href = appRootPath +'login.html';
  }

  if(appCookie.loginID){
    GetBasicInformation(appCookie.personID);
  }

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
            if (RoleName=='Clients'){
              $('#caseFilter .orgCell, #mainMenu .packageMenu').hide();
            }else{
              $('#caseFilter .orgCell').show();
            }
          }
        }
      }
    });

  $('#mainMenuLeft #logOut, #logOut').click(function() {
    $.ajax({
      url: apiSrc+"Sec1.Logout.json",
      method: "POST",
      dataType: "json",
      xhrFields: { withCredentials: true },
      data: {
        'data': {},
        'WebPartKey': WebPartVal,
        'ReqGUID': getGUID()
      }
    })
    .done(function(data) {
      console.log( "Logout success" );
      if (typeof Cookies.getJSON('appCookie') !== 'undefined')
        Cookies.remove('appCookie');
      if (pageName != 'login') window.location.href = appRootPath + 'login.html';
    })
    .fail(function( jqXHR, textStatus ) {
      console.log( "Logout fail" );
      console.log(jqXHR);
      console.log( "Request failed: " + textStatus );
    });

    return false;
  });//logout

  $('.tabBoxButtonClose,.tabBoxButtonSubmit').click(function(){
    var targetRef = $(this).parents('.tabBoxContent');
    $(targetRef).hide();
    var targetRefId = targetRef.prop('id');

    $('.tabBoxButton').filter(
        function() {
          return $(this).data('target')==targetRefId;
        }).removeClass('tabBoxButtonOpen');
    return false;
  });

  $('.tabBoxButton').click(function(){
    var targetRef = $(this).data('target');
    if (  $('#'+targetRef).is(':visible')){
      $('#'+targetRef).hide();
      $(this).removeClass('tabBoxButtonOpen');
    }else{
      $('#'+targetRef).show();
      $(this).addClass('tabBoxButtonOpen');
    }
    return false;
  });

  $('.items').on('click', '.add', function () {
      var imageId = $(this).data("id");
      list.add(JSON.stringify(imageId));
      var exists = list.exists(JSON.stringify(imageId))
  });

  //toggleTitle
  var toggleTitleButton = $('<button class="toggleTitleButton"></button>');
  $('.toggleTitle').append(toggleTitleButton);
  $('.toggleTitle').find('.toggleTitleButton').click(function() {
    var toggleObj = $(this);
    var toggleBox = toggleObj.parents('.toggleBox');
    var toggleContent = toggleBox.find('.toggleContent');
    if (toggleObj.hasClass('toggleOpen')) {
      toggleObj.removeClass('toggleOpen');
      toggleContent.slideDown();
    }
    else {
      toggleObj.addClass('toggleOpen');
      toggleContent.slideUp();
    }
  });

  //editLinkForm
  $('.editLinkForm').each(function() {
    var $this = $(this);
    var target = $this.data('content');
    var content = $('#'+target+'Content');
    var form = $('#'+target+'Form');
    var defaultText = (typeof $this.data('text') !== 'undefined' && $this.data('text').length) ? '['+$this.data('text')+']' : '[edit]' ;

    $this.html(defaultText);
    content.show();
    form.hide();

    $this.click(function() {
      var $this = $(this);
      var target = $this.data('content');
      var content = $('#'+target+'Content');
      var form = $('#'+target+'Form');

      if(form.is(':visible')) {
        $this.html(defaultText);
        content.show();
        form.hide();
        $('html, body').animate({
          scrollTop: content.offset().top
        }, 500);
      }
      else {
        $this.html('[cancel]');
        content.hide();
        form.show();
        $('html, body').animate({
          scrollTop: form.offset().top
        }, 500);
      }
    });
  });//editLinkForm

  //set normal hyperlink to open new window if its external domain
  $('a').click(function() {
    var href = $(this).attr('href');
    var host = window.host;
    if( location.hostname === this.hostname || !this.hostname.length ) {
      window.location.href = href;
    }
    else
      window.open(href,'','');

    return false;
  });
});//onready

function GetBasicInformation(personID) {
  var data = {'PersonID': personID};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.GetPersonalInfo.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {
      'data': JSON.stringify(data),
      'WebPartKey': WebPartVal,
      'ReqGUID': getGUID()
    },
    success: function(data){
      if ((data) && (data.d.RetData.Tbl.Rows.length > 0)) {
        $('.profileName').html(data.d.RetData.Tbl.Rows[0].DisplayName);
      }
    },
    error: function(XMLHttpRequest, data, errorThrown){
      Cookies.remove('appCookie');
      document.location.reload();
    }
  })
}

function getCookie(cookie, cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(cookie);
    var ca = decodedCookie.split('&');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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
