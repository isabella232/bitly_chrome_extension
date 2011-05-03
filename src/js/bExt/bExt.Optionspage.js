// 
//  bExt.Optionspage.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-28.
//  Copyright 2011 the public domain. All rights reserved.
// 


(function( window, undefined) {
    
/*
    DOM Representation of the Settings / Options page (builtin chrome options page)
    
        Controls User Meta Data Settings and Configuration
        
*/

var settings={
    box : "#signedin_info_contents"
}

window.bExt.Optionspage = function( opts_els ) {
    settings=$.extend(true, {}, settings, opts_els );
    return this;
}

window.bExt.Optionspage.prototype={
    
    __lst : [],
    
    // make this appear as an array
    length : 0,
    splice : function(idx, howMany) {
        
    },
    
    build_meta : function( meta_params ) {
        var m=new bExt.OptionMeta( meta_params  );
        
        // javascript fun, this is a reference. Objects are PASS BY REFERENCE
        // we can always access them, it's NOT A copy unless we go to serious lengths to ensure it.
        this.__lst.push(m);
        return m;
    },
    
    assemble : function() {
        var $box=$(settings.box);
        
        // get users data, append Elements as needed
        
        $box.append( this.auto_copy() )
            .append( this.twitter() )
            .append( this.trends() )
            .append( this.hovercard_domains() )
            .append( this.context_menu() )
            .append( this.api_domains() );
            
        var lst = this.__lst;
        
        for(var i=0; i<this.__lst.length; i++) {
            if(lst[i].event_method !== null ) {
               $( "#" + lst[i].get("id") ).bind(lst[i].get("evt_type"), lst[i].event_method );
            }
        }
    },
    
    api_domains : function() {
        var frag_lst=[], meta_list=[], main_frag,
            prime_meta = this.build_meta({
                title : "API Domains",
                desc : "You can choose either the bit.ly API, the j.mp API or the bitly.com API. All work the same way, but j.mp is just a little shorter. This change only applies to new shortens."
            }),
            apis_lst=["bit.ly", "j.mp", "bitly.com"],
            user_selected_domain = bExt.info.get("domain") || "bit.ly";
        
        for(var i=0; i<apis_lst.length; i++) {
            // don't use complete object [new bExt.OptionMeta] here, overkill
            meta_list.push({
                value : apis_lst[i],
                enabled : ( apis_lst[i] === user_selected_domain ) ? true : false
            });
        }
        
        for(var i=0; i<meta_list.length; i++) {
            frag_lst.push( _single_radio_frag( meta_list[i] ) );
        }

        main_frag = single_check_frag( prime_meta.out() );

        // replace the checkbox & label with the radio's list
        main_frag.content.splice(main_frag.content.length-1,1);
        main_frag.content = main_frag.content.concat([{
            id : "api_choice_form",
            content : frag_lst
        }]);    
        return fastFrag.create( main_frag );
                
    },
    
    trends : function() {
        
        var frag, opts_page_meta = this.build_meta({
            title : "Trend Notifications",
            label : "Enable Notifications",
            desc : "Automatically notify me when my link starts to become popular, or trend. Notifications will be shown when a link reaches the threshold specified below during the past hour."
        });
        
        frag=single_check_frag( opts_page_meta.out() );
        var trend_frag_details = trends_structure();
        frag.content=frag.content.concat(trend_frag_details);
        return fastFrag.create( frag );
    },
    
    hovercard_domains : function() {
        
        var opts_page_meta = this.build_meta({
            title : "Auto Expand Links",
            label : "Show Link Preview",
            desc : "Shows a link preview, for bit.ly, on pages you visit. This change only applies to new page loads."
        }),
        meta_frag = single_check_frag( opts_page_meta.out()  )
        var domains_frag = hovercard_blist_domains( _nohovercard_domains( bExt.hovercard.blacklist() || [] ) );
        
        
        meta_frag.content=meta_frag.content.concat( domains_frag );
        return fastFrag.create( meta_frag );
    },
    
    auto_copy : function() {
        
        var opts_page_meta = this.build_meta({
            title : "Auto Copy Short Urls",
            enabled : bExt.info.get("auto_copy"),
            desc : "Automatically copy short urls to my clipboard when popup opens"
        });        
        
        
        // javascript fun, this is a reference. Objects are PASS BY REFERENCE
        opts_page_meta.event_method=bExt.option_evts.auto_copy;
        
        return build( opts_page_meta );       
    },
    
    context_menu : function() {
        var opts_page_meta = this.build_meta({
            title : "Context Menu Notifications",
            label : "Show Success Notification",
            desc : "On webpages I visit, show a confirmation message when a link has been shorten via the context menu (right click menu) for valid URLs"
        });    
        return build( opts_page_meta );            
    },
    
    twitter : function() {
        var opts_page_meta = this.build_meta({
            title : "Twitter Enhance",
            label : "Enhance Twitter",
            desc : "Display a shorten button on twitter.com when I enter a long URL"
        });  
        
        
        return build( opts_page_meta );
    },
    
    basic : function() {
        console.log("basic: window.bExt.Optionspage");
    }
}



/*
    Utilities  / Extra Methods
    
        not publicly exposed by default
*/
function build( opts_meta ) {
    var frag = single_check_frag( opts_meta.out() );
    return fastFrag.create( frag );    
}


function _nohovercard_domains( d_list  ) {
    var i=0, domain, disble_box="disabled", 
        structured_items=[];
    for( ; domain=d_list[i]; i++) {
        // note
        // if bit.ly / j.mp ever support hover card, change to checked, to encourage removal
        if(domain === "bit.ly" || domain === 'j.mp') { disble_box = true; }
        else { disble_box = false; }
        
        structured_items.push({
            type : "li",
            content : [{
                type : "input",
                id : 'no_expand_d_'+i,
                css : "no_expand_check",
                attributes: {
                    type : "checkbox",
                    value : domain,
                    name : "no_expand_domain",
                    disabled : disble_box
                }
            },{
                type : "label",
                content : domain,
                attributes : {
                    'for' : 'no_expand_d_'+i
                }
            },{
                css : "hr",
                content : {
                    type : "hr"
                }
            }]
        });
        
    }
    
    return structured_items;
}

function trends_structure() {
    return [{
        css : "smallInputContainer notificationInnerContainer",
        content : [{
            type : "form",
            id : "notifications_form",
            attrs : {
                action : "#",
                method : "get",
                "accept-charset" : "utf-8"
            },
            content : [{
                type : "label",
                content : "Default Click Threshold"
            }, {
                type : "input",
                attrs : {
                    type : "text",
                    value : 20
                }
            }, {
                type : "input",
                attrs : {
                    value : "Update",
                    type : "submit"
                }
            }]
        },{
            type : "p",
            content : "Note: Threshold can be any integer from 5-5,000"
        }]
    }];
}

function hovercard_blist_domains( structured_items ) {
    return [{
        id : "no_expand_domains_box",
        content : [{
            type : "h4",
            content : 'Except These Domains:'
        },{
            type : "ul",
            css : "no_expand_domains_list",
            content : structured_items
        },{
            id : "new_no_expand_domain"
        },{
            content : [{
                type : "a",
                id : "add_no_expand_domain_form",
                content : "Add domain host",
                attributes : {
                    href : "#"
                }
            },{
                text : " | "
            },{
                type : "a",
                content : "Remove selected",
                id : "remove_no_expand_domains",
                attributes : {
                    href : "#"
                }
            },{
                type : "p",
                css : "no_domains_note",
                content : "Note: subdomains must be specified, facebook.com will not match www.facebook.com"
            }]
        }]
    }]
}

function _single_radio_frag( meta ) {
    var radio_params = {
        type : "radio",                
        name : "api_choice",
        value : meta.value        
    }
    if(meta.enabled) {
        radio_params.checked=true;
    }
    return {
        css : "bentoOptions",
        content : [{
            type : "input",
            attrs : radio_params
        },{
            type : "label",
            content : "Use " + meta.value + " API"
        }]
    }
}

function single_check_frag( meta ) {
    /*
        window.bExt.OptionMeta
        meta = {
            title : "",
            desc : "",
            label : "",
            id : ""
        }
    */
    
    var input_params={
        name : meta.id,
        type : meta.type,
        value : ""        
    }
    if(meta.enabled) {
        input_params.checked=true;
    }
    
    return {
        css : "options_container",
        content : [{
            type : "h3",
            content : meta.title
        },{
            type : "p",
            content : meta.desc
        },{
            css : "field_type_" + meta.type,
            content : [{
                type : "input",
                id : meta.id,
                attrs : input_params
            },{
                type : "label",
                content : meta.label,
                attrs : {
                    'for' : meta.id
                }
            }]
        }]
    }
}


window.bExt.option_evts = {
    
    auto_copy : function( e ) {
        var chkd = $(e.target).attr("checked");
        console.log(chkd, "chkd");
        bExt.info.set("auto_copy", chkd);
    }
    
}
})(window);



// separate but equal, prep to put in own file

(function( window, undefined) {
/*
    Representation of each 'setting' UI Controls Parent
    
        Such that, a Title, desc, and event method are assigned
*/

window.bExt.OptionMeta = function( meta_obj  ) {
    this.__m=$.extend( {}, this.__m, meta_obj );
    this.set_label();
    this.set_id();

    return this;
}

window.bExt.OptionMeta.prototype = {
    
    // add this to set event for this object
    'event_method' : null,        
    
    set_id : function() {
        if(!this.__m.id && this.__m.title !== this.__m.label ) {
            this.__m.id=(this.__m.title + "_" + this.__m.label).replace(/[^a-z0-9]/gi, "_").toLowerCase();
        } else {
            this.__m.id=(this.__m.title).replace(/[^a-z0-9]/gi, "_").toLowerCase();
        }
    },
    set_label : function() {
        if(!this.__m.label) {
            this.__m.label=this.__m.title;
        }
    },
    
    get : function( name ) {
        return this.__m[ name ];
    },
    
    set : function( name, value ) {
        return this.__m[name]=value;
    },
    
    out : function() {
        return this.__m;
    },
    __m : {
        evt_type : "change",
        id : null,
        title : null,
        label : null,
        enabled : null,
        type : "checkbox",
        desc : null,
        value : ""
    }
}
    
})(window);