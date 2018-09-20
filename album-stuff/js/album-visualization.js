var props = {
  width: 600,
  height: 500,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  lineOffset: 400
}

function renderAlbumArc(albumCSV, peopleJSON, startDiv){
  var className = albumCSV.substr(0,albumCSV.length - 4);
  props.width = $("#" + className + "-div").width();
  var svg = d3.select("#" + className + "-div").append("svg").attr("id","svg-" + className).attr("width", props.width).attr("height",props.height);
  var time = d3.timeParse("%M:%S");

  d3.csv(albumCSV, function(csv_data){
    var pieScale = d3.scaleTime().domain([time("00:00"),time("40:58")]).range([0, 100]);
    var xScale = d3.scaleTime().domain([time("00:00"),time("40:58")]).range([-200, 200]);

    csv_data.forEach(function(d){
      d.values = [{x: d.start, y: 200},{x: d.end, y:200}];
    });

    var pieGenerator = d3.pie().value(function(d){return pieScale(time(d.duration))}).sort(null).startAngle(0.05 * Math.PI).endAngle(1.95*Math.PI);
    var arcData = pieGenerator(csv_data);
    var arcGenerator = d3.arc().innerRadius(180).outerRadius(200);
    var g = d3.select("#svg-" + className).append("g").attr("id","g-"+className).attr("transform", "translate(" + props.width / 2 + "," + props.height / 2 + ")");


    var lineGenerator = d3.line().x(function(d){return xScale(time(d.x))}).y(function(d){return d.y;});
    console.log(arcData);
    var lineForm = false;
    d3.select('#g-' + className)
      .selectAll('.song-line-' + className)
      .data(arcData)
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr("class","song-line-" + className + " " + className)
      .style("fill", function(d){return d.data.color})
      .style("stroke","white")
      .style("stroke-width",lineForm ? "10" : "4")
      .on("mouseover", function(d){
        d3.select(this).style("stroke-width", lineForm ? "12" : "1");
        d3.select("#" + className + "-selection").text(d.data.track_title);
      })
      .on("mouseout", function(d){
        d3.select(this).style("stroke-width",lineForm ? "10" : "4");
        d3.select("#" + className + "-selection").text("");
      })
      .on("click", function(d){
        if(lineForm){
          d3.selectAll(".song-line-" + className).transition()
            .duration(500)
            .delay(function(d,i){return 100 * i})
            .attr("d", arcGenerator)
            .style("fill", function(d){return d.data.color})
            .style("stroke-width","4")
            .style("stroke","white");
          lineForm = false;
        }
        else{
          d3.selectAll(".song-line-" + className).transition()
            .duration(500)
            .delay(function(d,i){return 100 * i})
            .attr("d", function(d){return lineGenerator(d.data.values)})
            .style("stroke", function(d){return d.data.color})
            .style("stroke-width", "10")
            lineForm = true;
        }
      })

  /*d3.select('g')
  	.selectAll('text')
  	.data(arcData)
  	.enter()
  	.append('text')
  	.each(function(d) {
  		var centroid = arcGenerator.centroid(d);
  		d3.select(this)
        .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
  			.text(d.data.track_title);
  	});*/

  });
}

function renderAlbumVisualization(albumCSV, peopleJSON){
  var svg = d3.select("#chart-div").append("svg").attr("width", props.width).attr("height",props.height);
  var time = d3.timeParse("%M:%S");

  d3.csv(albumCSV, function(csv_data){
    var xScale = d3.scaleTime().domain([time("00:00"),time("40:58")]).range([0, props.width]);

    var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    console.log(csv_data)
    /*svg.selectAll(".song-line")
        .data(csv_data)
        .enter()
        .append("line")
        .attr("x1",function(d){console.log(d.track_title);return xScale(time(d.start))})
        .attr("x2", function(d){return xScale(time(d.end))})
        .attr("y1", props.lineOffset)
        .attr("y2", props.lineOffset)
        .style("stroke",function(d){return d.color})
        .style("stroke-width","5")
        .on("mouseover", function(d){
          d3.select("#selection").text(d.track_title);
          d3.select(this).transition().style("stroke-width","8");
        })
        .on("mouseout", function(d){
          d3.select("#selection").text("")
          d3.select(this).transition().style("stroke-width","5");
        });
*/
        d3.json(peopleJSON, function(json_data){
          var g = svg.selectAll(".image-container").data([null]);
          g = g.enter().append("g").attr("class","image-container").merge(g);


          var images = g.selectAll(".image")
                          .data(json_data)
                          .enter()
                          .append("pattern")
                          .attr("id", function(d){return "image" + d.id})
                          .attr("class","svg-image")
                          .attr("x",0)
                          .attr("y",0)
                          .attr("height", 1)
                          .attr("width", 1)
                          .append("image")
                            .attr("x","-80")
                            .attr("y","0")
                            .attr("height", "30%")
                            .attr("width","30%")
                            .attr("href", function(d){return d.img});

            var producers = json_data.filter(function(d){return d.producer_credits.length != 0;});
            var idScale = d3.scaleBand().domain(producers.map(function(d){return d.id})).range([0,props.width]).paddingOuter([0.5])

            var people = g.selectAll("circle")
                            .data(producers)
                            .enter()
                            .append("g");

            people.append("circle")
                              .attr("class","point person")
                              .attr("cx", function(d){return idScale(d.id)})
                              .attr("cy", 150)
                              .attr("r", "8%")
                              .style("stroke-width","4")
                              .style("fill",function(d){return "url(#image" + d.id + ")"});

            people.append("text")
                    .attr("text-anchor","middle")
                    .attr("dy","15%")
                    .attr("dx",function(d){return idScale(d.id)})
                    .text(function(d){return d.name});

            var pathGenerator = d3.line().x(function(d){return d.x;}).y(function(d){return d.y;}).curve(d3.curveBasis);

            var connections = [];
            json_data.forEach(function(d){
              d.producer_credits.forEach(function(song){
                //console.log(idScale(d.id) + ", " + xScale(time(csv_data[song - 1].start)))
                var x1 = idScale(d.id);
                var x2 = (xScale(time(csv_data[song - 1].start)) + xScale(time(csv_data[song - 1].end))) / 2;
                connections.push([{x: x1, y: 208,track_title: csv_data[song - 1].track_title, color: csv_data[song - 1].color}, {x: x2, y: props.lineOffset}]);
              })
            })

            var personColorScale = d3.scaleOrdinal(d3.schemeCategory10);
            g.selectAll(".connection")
                .data(connections)
                .enter()
                .append("path")
                .attr("class","connection")
                .attr("d", pathGenerator)
                .style("stroke", function(d){return d[0].color})
                .style("stroke-width","1")
                .style("fill","none")
                .on("mouseover", function(d){
                  d3.select(this).style("stroke-width","3");
                  d3.select("#selection").text(d[0].track_title);
                })
                .on("mouseout", function(d){
                  console.log("!")
                  d3.select(this).style("stroke-width","1");
                  d3.select("#selection").text("");
                });
        });
  });
}
