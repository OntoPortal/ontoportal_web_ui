var searchbox;

// Called when the "Go" button on the Jump To form is clicked
function jumpToValue(li){
  jQuery.blockUI({ message: '<h1><img src="/images/tree/spinner.gif" /> Loading Class...</h1>', showOverlay: false });

  if( li == null ){
    // User performs a search
    var search = confirm("Class could not be found.\n\nPress OK to go to the Search page or Cancel to continue browsing");

    if(search){
      jQuery("#search_keyword").val(jQuery("#search_box").val());
      jQuery("#search_form").submit();
      return
    }
  }

  // Appropriate value selected
  if( !!li.extra ){
    var sValue = jQuery("#jump_to_concept_id").val();

    // TODO_REV: Handle flat ontologies (replace `if (false)` with `if @ontology.flat?`)
    if (false) {
      History.pushState({p:"classes", conceptid:sValue, suid:"jump_to", flat:true, label:li.extra[4]}, jQuery.bioportal.ont_pages["classes"].page_name + " | " + org_site, "?p=classes&conceptid=" + sValue);
    } else {
      document.location="/ontologies/#{@ontology.acronym}/?p=classes&conceptid="+encodeURIComponent(sValue)+"&jump_to_nav=true";
      jQuery.blockUI({ message: '<h1><img src="/images/tree/spinner.gif" /> Loading Class...</h1>', showOverlay: false });
      return;
    }
  }
}

// Sets a hidden form value that records the concept id when a concept is chosen in the jump to
// This is a workaround because the default autocomplete search method cannot distinguish between two
// concepts that have the same preferred name but different ids.
function jumpToSelect(li){
  jQuery("#jump_to_concept_id").val(li.extra[0]);
  jumpToValue(li);
}

// Formats the Jump To search results
function formatItem(row) {
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
  var keywords = jQuery("#search_box").val().trim().replace(specials, "\\$&").split(' ').join('|');
  var regex = new RegExp( '(' + keywords + ')', 'gi' );
  var matchType = "";
  if (typeof row[2] !== "undefined" && row[2] !== "") {
    matchType = " <span style='font-size:9px;color:blue;'>(" + row[2] + ")</span>";
  }

  if (row[0].match(regex) == null) {
    var contents = row[6].split("\t");
    var synonym = contents[0] || "";
    synonym = synonym.split(";");
    if (synonym !== "") {
      var matchSynonym = jQuery.grep(synonym, function(e){
        return e.match(regex) != null;
      });
      row[0] = row[0] + " (synonym: " + matchSynonym.join(" ") + ")";
    }
  }
  // Cleanup obsolete class tag before markup for search keywords.
  if(row[0].indexOf("[obsolete]") != -1) {
    row[0] = row[0].replace("[obsolete]", "");
    obsolete_prefix = "<span class='obsolete_class' title='obsolete class'>";
    obsolete_suffix = "</span>";
  } else {
    obsolete_prefix = "";
    obsolete_suffix = "";
  }
  // Markup the search keywords.
  var row0_markup = row[0].replace(regex, "<b><span style='color:#006600;'>$1</span></b>");
  return obsolete_prefix + row0_markup + matchType + obsolete_suffix;
}

classes_init = function(){
  // Override the side of the bd_content div to avoid problems with
  // the window resizing, which can sometimes cause the right-hand content div to drop down
  var bd_content_width = jQuery("#ontology_content").width();
  jQuery("#bd_content").width(bd_content_width);

  // Split bar
  jQuery("#bd_content").splitter({
    sizeLeft: 400,
    resizeToWidth: true,
    cookie: "vsplitbar_position"
  });
}

// The tab system
jQuery(".tab").live("click", function(){
    var tabId = jQuery(this).children("a:first").attr("href").replace("#", "");
    showClassesTab(tabId);
});

function showClassesTab(tabId) {
  // Get the target content area
  var target = document.getElementById(tabId + "_content");

  if (target != null) {
    jQuery(".tab_container").addClass("not_visible");
    jQuery(target).removeClass("not_visible");
    jQuery(".tab").removeClass("selected");
    jQuery("#" + tabId + "_top").addClass("selected");
    jQuery(document).trigger("classes_tab_visible");
  }

  jQuery(document).trigger("visualize_tab_change", [{tabType: tabId}]);
}

// Only show BioMixer when tab is clicked
jQuery(document).live("visualize_tab_change", function(event, data){
  if (data.tabType == "visualization") {
    jQuery("#biomixer_iframe").attr("src", jQuery("#biomixer_iframe").data("src"));
  }
});

function callTab(tab_name, url) {
    if (getCache(getConcept() + tab_name) != null) {
          document.getElementById(tab_name + "_content").innerHTML=getCache(getConcept() + tab_name);
    } else {
      jQuery("#" + tab_name + "_content").html('<h1><img src="/images/tree/spinner.gif" /> Loading Resources...</h1>');
      jQuery.get(url.replace("@ontology@",getOntology()).replace("@concept@",encodeURIComponent(getConcept())),function(data){
        jQuery("#" + tab_name + "_content").html(data);
        jQuery("#" + tab_name + "_content").append(
          jQuery("<input type='hidden'/>")
            .attr("id", "resource_index_classes")
            .val([jQuery(document.body).data("ont_id")+"/"+encodeURIComponent(getConcept())])
        );
        setCache(getConcept() + tab_name,data);
        jQuery.unblockUI();
        tb_init('a.thickbox, area.thickbox, input.thickbox');
      });
    }
}

search_box_init = function(){
  jQuery("#search_box").bioportal_autocomplete("/search/json_search/#{@ontology.acronym}", {
    extraParams: { objecttypes: "class" },
    width: "400px",
    selectFirst: true,
    lineSeparator: "~!~",
    matchSubset: 0,
    minChars: 1,
    maxItemsToShow: 25,
    onFindValue: jumpToValue,
    onItemSelect: jumpToSelect,
    formatItem: formatItem
  });
  searchbox = jQuery("#search_box")[0].autocompleter;
}

jQuery(document).ready(function() {
  classes_init();
  search_box_init();
});

jQuery(document).ready(function(){
  // TODO_REV: Handle views (replace `if (false)` with `@ontology.isView == 'true'`)
  if (false) {
    // Set up a hovertip on the qsearch input element
    jQuery("#resource_index_top").attr("style", "color: grey;");
    jQuery("#resource_index_top").attr("title", "Resource Index isn't available for Views");
    jQuery("#resource_index_top").tooltip({
        position: "bottom center",
        tip: '.tooltip',
        opacity: 0.7
    });
  }

  // TODO_REV: Handle search index notice when ontology isn't indexed
  /*
    if !@ontology.in_search_index?
      if !@ontology.latest?
      // This shows a tooltip on the disabled for elements when ontology isn't the newest (ie missing from index)
      jQuery("#qsearch").children().filter(":input").each(function(){
        jQuery(this).attr("readonly", true);
      });
      jQuery("#qsearch").attr("style", "color: grey;");

      if @ontology.latest?
        message = "This ontology has recently been updated and new classes may not yet be available through \"Jump To\""
      else
        message = "\"Jump To\" only works with the most recently indexed version of this ontology"

      // Set up a hovertip on the qsearch input element
      jQuery("#qsearch :input").attr("title", message);
      jQuery("#qsearch :input").tooltip({
          position: "top center",
          offset: [-5, 0],
          tip: '.tooltip',
          opacity: 0.9
      });
    }
  */
});

// Tab auto-select based on parameter "t"
jQuery(document).ready(function(){
  var url, urlFragment, paramsList, params = {}, splitParam, content;
  url = document.URL;

  if (url.indexOf("?") > 0) {
    urlFragment = url.split("?");
    paramsList = urlFragment[1].split("&");

    for (param in paramsList) {
      splitParam = paramsList[param].split("=");

      if (splitParam.length > 1)
        params[splitParam[0]] = splitParam[1].split("#")[0];
    }

    if (params !== "undefined" && "t" in params) {
      showClassesTab(params["t"]);
    }
  }
});

// Javascript for the permalink box
jQuery(document).ready(function(){
  jQuery("#close_permalink").live("click", function(){
    jQuery("#purl_link_container").hide();
  });

  jQuery("#class_permalink").live("click", function(e){
    e.preventDefault();
    jQuery("#purl_link_container").show();
  });

  jQuery("#purl_input").live("focus", function(){
    this.select();
  });
});