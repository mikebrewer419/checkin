const js = `function addEmbedIframeExternal(iframeObj,callbackfn) {
	updateCometChatUserDetails({
		layout: 'embedded',
		callbackEm: function() {
			var dynamicCDNUrl = '//fast.cometondemand.net/';
			var mutipleLayout   = '0';
			var cbfn='';
			var lang = (typeof chat_language != 'undefined')? chat_language : 'en';
			var rttlang = (typeof chat_rttlang != 'undefined')? chat_rttlang : '';

			if(typeof(callbackfn)!='undefined'){
				cbfn=callbackfn;
			}

			/*To show both layout on same page*/
			if(mutipleLayout == 0){
				cc_synergy_enabled = 1;
			}

			addScript('//fast.cometondemand.net/54561x_x782c3x_xcorex_xsdkx_xembedded.js?v=7.49.1');
			if(typeof(iframeObj.width)=="undefined"){
				iframeObj.width="100%";
			}
			if(typeof(iframeObj.height)=="undefined"){
				iframeObj.height="100%";
			}
			if(typeof(iframeObj.style)=="undefined"){
				iframeObj.style="";
			}
						var authToken = '';
			var basedata = getURLParameter('basedata',iframeObj.src);
			var guestdata = getURLParameter('guestdata',iframeObj.src);
			var httpReferer = location.host;
			var cookiePrefix = '54561cc_';

			if(basedata!=null && (basedata+"").toLowerCase()!="null" && basedata!=""){
				document.cookie='54561cc_data='+basedata;
			}else if(typeof(getCookie(cookiePrefix+'data'))!="undefined"){
				basedata = getCookie(cookiePrefix+'data');
			}
			if(typeof(chat_auth) != 'undefined') {
				authToken = chat_auth;
			}
			if(typeof(getCookie(cookiePrefix+'guest')) != "undefined"){
				guestdata = getCookie(cookiePrefix+'guest');
			}
			var container = document.getElementById("cometchat_embed_"+iframeObj.module+"_container");
			var queryStringSeparator='&';
			if(iframeObj.src.indexOf('?')<0){
				queryStringSeparator='?';
			}
			iframeObj.src+= queryStringSeparator+"basedata="+basedata+"&guestdata="+guestdata+"&authToken="+authToken+"&referer="+httpReferer+"&lang="+lang+"&rttlang="+rttlang;
			var iframe = document.createElement('iframe');
			iframe.style.cssText = iframeObj.style;
			iframe.src = iframeObj.src;
			iframe.width = iframeObj.width;
			iframe.height = iframeObj.height;
			// iframe.name = 'cometchat_'+iframeObj.module+'_iframe';
			// iframe.id = 'cometchat_'+iframeObj.module+'_iframe';
			// iframe.scrolling = 'no';
			// iframe.setAttribute('class','cometchat_'+iframeObj.module+'_iframe');
			// iframe.setAttribute('frameborder',0);
			// iframe.setAttribute('nwfaketop','');
      // iframe.setAttribute('allow','');
      document.body.appendChild(iframe);
			container.appendChild(iframe);
			if(typeof(jqcc('#cometchat_synergy_iframe')[0]) != 'undefined'){
				jqcc('#cometchat_synergy_iframe')[0].onload = function(){
					if (jqcc("#cometchat").length ==0) {
						if(jqcc('link[href*="'+dynamicCDNUrl+'cometchatcss.php"]').length<=0 && cbfn!='desktop') {
              // jqcc('head').append('<link type="text/css" rel="stylesheet" media="all" href="//fast.cometondemand.net/54561x_x782c3x_xx_xx_xembedded.css?v=7.49.1" />');
						}
					}
				}
			}
		}
	});
}`

export default js
