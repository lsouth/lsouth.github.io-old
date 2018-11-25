
var line_props = {
  width : 1000,
  height : 300,
  marginTop : 20,
  marginRight : 20,
  marginBottom : 20,
  marginLeft : 10
}

var LineGraph = {};
var line_elem = "#linegraph";

LineGraph.drawLines = function(svg, g, scales){
  $(".rating-line").remove();
  $(".rating-point").remove();
  $(".album-line").remove();
  var pointsG = g.append("g").attr("id","song-points-g");

  var points = pointsG.selectAll(".rating-point")
                  .data(pointList)
                  .enter()
                  .append("line")
                  .attr("class",function(d){
                    return ("rating-point point-" + d.id.toLowerCase().split(" ")[0] + " artist-" + d.artist.toLowerCase().split(" ")[0]);
                  })
                  .style("visibility", function(d){
                    return true;
                    //return d3.select("#" + d.artist.toLowerCase().split(" ")[0] +"-checkbox").attr("checked") ? "visible" : "hidden";
                  })
                  .attr("x1",function(d){
                    return scales.x(d.track);
                  })
                  .attr("x2",function(d){
                    return scales.x(d.track);
                  })
                  .attr("y1", function(d){
                    return scales.y(d.rating) + 5;
                  })
                  .attr("y2", function(d){
                    return scales.y(d.rating) - 5;
                  })
                  .style("stroke",function(d){
                    return albumColorScale(d.id);
                  })
                  .on("mouseover", function(d){
                    d3.selectAll(".rating-line").transition().style("stroke-width","1");
                    d3.selectAll(".rating-point").transition().style("stroke-width","0.5");
                    var lowerID = d.id.toLowerCase().split(" ")[0].replace(".","");
                    d3.selectAll(".point-" + lowerID).transition().style("stroke-width","3");
                    d3.select("#line-" + lowerID).transition().style("stroke-width","4");
                    d3.select("#circle-" + lowerID).transition().style("stroke-width","4").attr("r","5%").style("stroke",albumColorScale(d.id));
                  })
                  .on("mouseout", function(d){
                    d3.selectAll(".rating-line").transition().style("stroke-width","2");
                    d3.selectAll(".rating-point").transition().style("stroke-width","2");
                    var lowerID = d.id.toLowerCase().split(" ")[0];
                    d3.select("#circle-" + lowerID).transition().style("stroke-width","0").attr("r","3%");
                  });

  var albumLine = d3.line()
    .curve(d3.curveCardinal)
    .x(function(d){
        return scales.x(d.track);
    })
    .y(function(d){
        return scales.y(d.rating);
    });

  var albums = g.selectAll(".album-line")
                  .data(trackRatingsData)
                  .enter().append("g")
                  .attr("class","album-line");

  albums.append("path")
        .attr("class", function(d){return "artist-" + d.artist.toLowerCase().split(" ")[0] + " line rating-line"})
        .attr("id",function(d){return "line-" + d.id.toLowerCase().split(" ")[0]})
        .style("stroke-width","2")
        .style("visibility", function(d){
          return true;
          //return d3.select("#" + d.artist.toLowerCase().split(" ")[0] +"-checkbox").attr("checked") ? "visible" : "hidden";
        })
        .attr("d",function(d){
          return albumLine(d.values);
        })
        .style("stroke", function(d){return albumColorScale(d.id)})
        .on("mouseover", function(d){
          $("#review-link-card").text(d.id + " by " + d.artist);
          d3.selectAll(".rating-line").transition().style("stroke-width","1");
          d3.selectAll(".rating-point").transition().style("stroke-width","1");
          var lowerID = d.id.toLowerCase().split(" ")[0];
          d3.selectAll(".point-" + lowerID).transition().style("stroke-width","3")
          d3.select(this).transition().style("stroke-width","4");
          d3.select("#circle-" + lowerID).transition().style("stroke-width","4").attr("r","5%").style("stroke",albumColorScale(d.id));
        })
        .on("mouseout", function(d){
          d3.selectAll(".rating-line").transition().style("stroke-width","2");
          d3.selectAll(".rating-point").transition().style("stroke-width","2");
          var lowerID = d.id.toLowerCase().split(" ")[0];
          d3.select("#" + lowerID).transition().style("stroke-width","0").attr("r","3%");
          d3.select("#circle-" + lowerID).transition().style("stroke-width","2").attr("r","3%").style("stroke","none");
          $("#review-link-card").text("Select an album to learn more.");
        });

  var lines = document.querySelectorAll("rating-line");
  var i = lines.length;
  var svgDoc = document.querySelector("svg");
  while(i--){
    lines[i].addEventListener("mouseenter", function(e){
      svgDoc.appendChild(e.target);
    })
  }
}

LineGraph.create = function(line_elem, line_props){
  line_props.width = $(line_elem).width();

  var svg = d3.select(line_elem).selectAll("#line-svg").data([null]);
  svg = svg.enter().append("svg")
                    .attr("id","line-svg")
                    .attr("width", line_props.width)
                    .attr("height", line_props.height)
                    .merge(svg);

  var g = svg.selectAll("line-graph-g").data([null]);
  g = g.enter()
        .append("g")
        .attr("class","line-graph-g")
        .merge(g)
        .attr("transform","translate(" + line_props.marginLeft + ",0)");

  g.exit().remove();
  svg.exit().remove();

  var scales = {
    x : d3.scaleLinear().domain([0,1]).range([0 + line_props.marginLeft,line_props.width - line_props.marginRight]),
    y : d3.scaleLinear().domain([0,10]).range([line_props.height - line_props.marginTop,0 + line_props.marginBottom]),
    z : d3.scaleOrdinal(d3.schemeCategory20)
  }

  g.append("g")
    .attr("class","axis")
    .attr("transform","translate(" + line_props.marginLeft +",0)")
    .call(d3.axisLeft(scales.y))

  var albumNames = [];
  for(i in line_props.data){
    var name = line_props.data[i]["album_title"];
    if(!albumNames.includes(name) && name !== undefined && name != "skip" && line_props.data[i]["track_num_scaled"] != "N/A"){
      albumNames.push(name);
    }
  }

  pointList = [];
  trackRatingsData = [];
  for(i in albumNames){
    var name = albumNames[i];
    albumTracks = line_props.data.filter(function(d){return d.album_title == name});
    trackRatingsData.push({
      id : name,
      artist : albumTracks[0].artist,
      values : albumTracks.map(function(d){
        return {rating : d.rating_abs, track : d.track_num_scaled};
      })
    })

    pointList = line_props.data.map(function(d){
      return {artist: d.artist, id: d.album_title, rating : d.rating_abs, track : d.track_num_scaled};
    });
  }

  var artists = line_props.data.map(function(d) {return d.artist;}).filter(function(d,i,self){return self.indexOf(d) == i;})
  d3.select("#artist-selection")
      .selectAll(".artist-checkbox")
      .data(artists.filter(function(d){return d != "skip"}))
      .enter()
      .append("label")
      .style("font-size","10pt")
      .append("input")
      .attr("type", "checkbox")
      .attr("checked","checked")
      .attr("class","form-check-input artist-checkbox")
      .attr("id",function(d){return d.toLowerCase().split(" ")[0] + "-checkbox";})
      .on("click", function(d){
        if(d3.select(this).attr("checked")){
          d3.selectAll(".artist-" + d.toLowerCase().split(" ")[0]).style("visibility","hidden");
          d3.select(this).attr("checked",null);
        }
        else{
          d3.selectAll(".artist-" + d.toLowerCase().split(" ")[0]).style("visibility","visible");
          d3.select(this).attr("checked","checked");
        }
        //d3.select(d.toLowerCase().split(" ")[0] + "-checkbox").style("visibility","hidden").attr("checked",);
      });

  d3.selectAll("label")
      .data(artists.filter(function(d){return d != "skip"}))
      .attr("class","form-check-label")
      .append("text")
      .text(function(d){return d;});

  LineGraph.drawLines(svg, g, scales);
}


LineGraph.redraw = function(){
  $(".rating-line").remove();
  $(".form-check-label").remove();
  $(".artist-checkbox").remove();
  $(".rating-point").remove();
  $(".album-line").remove();
  $(".axis").remove();
  $(".line-graph-g").remove();
  d3.csv("albums.csv", function(data){
    line_props.data = data;
    LineGraph.create(line_elem, line_props);
  });
}

var albumColorScale = null;

$(document).ready(function(){
  var colors = [];
  var albumNames = [];
  d3.csv("timeline.csv", function(d){
    d.forEach(function(line){
      colors.push(line.color);
      albumNames.push(line.title);
    });
    albumColorScale = d3.scaleOrdinal().domain(albumNames).range(colors);
    LineGraph.redraw();
    window.addEventListener("resize", function(){LineGraph.redraw();});
  });
  // redraw graph when window is resized.

});
