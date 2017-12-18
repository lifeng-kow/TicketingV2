import $ from 'jquery';
import Cookies from 'js-cookie';
import whatInput from 'what-input';

window.$ = $;
window.Cookies = Cookies;

import Foundation from 'foundation-sites';
// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
//import './lib/foundation-explicit-pieces';

$(document).foundation();

var pageName = "", appName = "";
var appCookie;
//document ready
$(function(){
  //get page name
  pageName = getPageName();
  appName = getAppName();
  
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
    var pageURL = window.location;
    if (typeof Cookies.getJSON('appCookie') !== 'undefined') {
      appCookie = Cookies.getJSON('appCookie');
    }
    appCookie.redirectPage = (pageURL != '') ? pageURL : 'index.html';
    Cookies.set('appCookie', appCookie);
    window.location.href = appName + 'login.html';
  }

  if(appCookie.loginID){
    GetBasicInformation(appCookie.personID);
  }

  $('#logOut').click(function() {
    $.ajax({
      url: appName+"Sec1.Logout.json",
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
      console.log( "Logout success" );
      if (typeof Cookies.getJSON('appCookie') !== 'undefined')
        Cookies.remove('appCookie');
      if (pageName != 'login') window.location.href = appName+'login.html';
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
    //console.log('hiude');
    return false;
  });
  $('.tabBoxButton').click(function(){
    var targetRef = $(this).data('target');
    if (  $('#'+targetRef).is(':visible')){
      $('#'+targetRef).hide();
      $(this).removeClass('tabBoxButtonOpen');
      console.log('hiude');
    }else{
      $('#'+targetRef).show();
      $(this).addClass('tabBoxButtonOpen');
      console.log('add');
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
    url: appName+"BCMain/iCtc1.GetPersonalInfo.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: {
      'data': JSON.stringify(data),
      'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data){
      if ((data) && (data.d.RetData.Tbl.Rows.length > 0)) {
        $('.profileName').html(data.d.RetData.Tbl.Rows[0].DisplayName);
        if (data.d.RetData.Tbl.Rows[0].EntityType == 'I'){
          $('#navPackages').show();
          $('#navReport').show();
          $('#navSettings').show();
          $('#packages').hide();
        }else{
          $('#caseFilter .orgCell').hide();
          $('#caseFilter #statusMyCase, #caseFilter .mycase').hide();
        }
      }
    },
    error: function(XMLHttpRequest, data, errorThrown){
      Cookies.remove('appCookie');
      document.location.reload();
    }
  })
}

function getAppName(){
  var targetURL = 'https://portal.taksys.com.sg/Support/';

  var _location = document.location.toString();
  var applicationNameIndex = _location.indexOf('/', _location.indexOf('://') + 3);
  var applicationName = _location.substring(0, applicationNameIndex) + '/';
  var webFolderIndex = _location.indexOf('/', _location.indexOf(applicationName) + applicationName.length);
  var webFolderFullPath = _location.substring(0, webFolderIndex);

  var appNameIndex = _location.indexOf('/', applicationNameIndex + 1);
  var appName = _location.substring(applicationNameIndex, appNameIndex) + '/';

  if (webFolderFullPath='http://localhost:8000/'){
    return targetURL;
  }else{
    return appName;
  }
}

function getPageName() {
  var pageName = $('body').attr('id').replace('page-','');
  return pageName;
}
