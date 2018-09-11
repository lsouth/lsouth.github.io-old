function renderBarChart(albumID){
    var colorCode = "";
    d3.csv('timeline.csv',function(d){
      d.forEach(function(t){
        if(t.title == albumID){
          colorCode = t.color;
        }
      })
      readAlbumData(albumID, colorCode);
    });
  }

 function readAlbumData(albumID, colorCode){
   d3.csv("albums.csv", function(data){
     albumData = [];
     data.forEach(function(d){
       if(d["Album"] === albumID){
         albumData.push(d);
       }
     });
     var margin = {top: 20, right: 20, bottom: 20, left: 20};

     var fullWidth = 500;
     var fullHeight = 200;
     var width = fullWidth - margin.right - margin.left;
     var height = fullHeight - margin.top - margin.bottom;

     var xValues = [];
     for(i = 0; i < albumData.length; i++){
       xValues.push(i);
     }

     var xScale = d3.scaleBand() //scaleBand is used for categorical data.
                     .domain(xValues)
                     .range([0, width])
                     .paddingInner(0.1);

     var yScale = d3.scaleLinear()
                     .domain([0,4])
                     .range([height, 0])
                     .nice();

     var albums = ['Gone Now', 'Strange Desire','Melodrama','Masseduction','Some Nights','Aim and Ignite','reputation','St Vincent','Steel Train'];
     var colors = ['#e53b19',  '#047bd6',       '#6c46c4',  '#ff3877',     '#ffd396',    '#e2db04',       '#737773',   '#fceaf8',   '#b1d8d8'];
     var color = d3.scaleOrdinal().domain(albums).range(colors);
/*
     var tip = d3.tip()
                 .attr('class','d3-tip')
                 .direction('s')
                 .html(function(d){
                   return d["Track Title"] + "<br> Rating: " + d["rating_rel"];
                 });
*/
     var xAxis = d3.axisBottom(xScale);
     var yAxis = d3.axisLeft(yScale).ticks(4);

     svg = d3.select("#album-vis").append('svg').attr('width',fullWidth).attr('height', fullHeight);
     //svg.append('g').attr('transform', 'translate(0,' + height + ')').call(xAxis);
     svg.append('g').attr('transform', 'translate(20,10)').call(yAxis);
     //svg.call(tip);

     svg.selectAll('rect')
         .data(albumData)
         .enter()
         .append("rect")
         .attr('x',function(d,i){
           return 30 + xScale(i);
         })
         .attr('y', function(d){
           if(d["rating_rel"] == 0){
             return yScale(d["rating_rel"]) + 5;
           }
           return yScale(d["rating_rel"]) + 10;
         })
         .attr('height', function(d){
           if(d["rating_rel"] == 0){
             return height - yScale(d["rating_rel"]) + 5;
           }
           return height - yScale(d["rating_rel"]);
         })
         .attr('width', xScale.bandwidth())
         .style('fill',colorCode)
         //.on('mouseover', tip.show)
         //.on('mouseout',tip.hide);
   });

 }

function addTags(){
  $("#tag-list").append("<h4>Tags</h4>");
  var $taglist = $("<ul/>")
                  .attr("class","list-inline");
  var tags = ["Taylor Swift", "Lorde","fun.","St Vincent","Bleachers","The Mountain Goats"];
  for (var i in tags){
    $taglist.append("<li class=\"list-inline-item\"><a href=\"#\">" + tags[i] + "</a></li>")
  }
  $("#tag-list").append($taglist);
}

function addLatestPosts(){
  $("#latest-posts").append("<h4>Latest Posts</h4>");
  var $postlist = $("<ul/>").attr("class","list-group").attr("style","font-size: 12pt;");

  $postlist.append("<li class=\"list-group-item\"><a href=\"reputation.html\">Album Review: Reputation by Taylor Swift</a></li>");
  $postlist.append("<li class=\"list-group-item\"><a href=\"melodrama.html\">Album Review: Melodrama by Lorde</a></li>");
  $postlist.append("<li class=\"list-group-item\"><a href=\"masseduction.html\">Album Review: MASSEDUCTION by St Vincent</a></li>");
  $postlist.append("<li class=\"list-group-item\"><a href=\"gone-now.html\">Album Review: Gone Now by Bleachers</a></li>");
  $("#latest-posts").append($postlist);
}

function addTrackListing(albumID){
  $("#tracks").append("<h4>Track Listing:</h4>");
  d3.csv('albums.csv', function(d){
    d.forEach(function(t){
      if(t.Album == albumID){
        var html_string = "<b>" + t["Track Number"] + ". " + t["Track Title"] + "</b><br>"
        $("#tracks").append(html_string);
        if(t.comments != ""){
          $("#tracks").append(t.comments);
        }
      }
    })
  })
}

$("#about-me").append("<h3>About Me</h3> <p>My friends get tired of hearing me rant about music, so I figured I would do that here instead of subjecting them to it!</p>")

function renderPage(albumID){
  addTags();
  addLatestPosts();
  renderBarChart(albumID);
  addTrackListing(albumID);
}
