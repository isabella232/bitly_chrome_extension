(function() {
    function dispatch_callback(jo) {  }
    function init() {
        //var links = $("a[href]");
        //console.log("links", links);
        var body, h = document.location && document.location.host, 
            d_hosts=["bit.ly", "bitly.org", "j.mp", "bitly.net", "bitly.tv", "blog.bit.ly", "bitly.pro", "bitly.com"];
        if( d_hosts.indexOf( h ) >=0 || /[^.]{2,}\.bitly\.net$/.test(h) || /[^.]{2,}\.bitly\.org$/.test(h)  ) {
            var promos = document.getElementsByClassName("ext_bitly_chrome_promo_delay"), elem, mark=document.createElement("span");
            for(var i=0; i<promos.length; i++) {
                elem=promos[i];
                elem.parentNode.removeChild(elem);
            }
            mark.className="has_bitly_chrome_ext_installed";
            mark.setAttribute("style", "display:none;")
            document.body.appendChild( mark  );
        } else if(h) {
            // todo
            // deprecate sending the host domain -- already available via the sendMessage object
            chrome.extension.sendRequest({'action' : 'page_loaded', 'domain_host' : h || "" }, dispatch_callback);
        }
    }
    init();
})();

