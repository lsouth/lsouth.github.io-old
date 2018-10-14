var props = {
  width: 800,
  height: 400,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  lineOffset: 400
}

function addDurations(time1, time2){
  var minutes1 = parseInt(time1.split(":")[0]);
  var seconds1 = parseInt(time1.split(":")[1]);
  var minutes2 = parseInt(time2.split(":")[0]);
  var seconds2 = parseInt(time2.split(":")[1]);
  var minutesTotal = minutes1 + minutes2;
  var secondsTotal = seconds1 + seconds2;
  if(secondsTotal > 59){
    minutesTotal++;
    secondsTotal -= 60;
  }
  return minutesTotal + ":" + secondsTotal
}

function drawVerticalLineVis(albumCSV, phrasesCSV, divID){
  var className = albumCSV.substr(0,albumCSV.length - 4);
  var time = d3.timeParse("%M:%S");
  props.width = $("#" + divID).width();
  var svg = d3.select("#" + className + "-div").append("svg").attr("id","svg-" + className).attr("width", props.width).attr("height",props.height);
  var g = d3.select("#svg-" + className).append("g").attr("id","g-"+className).attr("transform", "translate(" + props.width / 2 + "," + props.height / 2 + ")");

  d3.csv(albumCSV, function(csv_data){
    var yScale = d3.scaleTime().domain([time("0:00"),time(csv_data[csv_data.length - 1].cumulative_duration)]).range([-props.height / 2 + props.marginLeft, props.height / 2 - props.marginRight]);

    var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    d3.csv(phrasesCSV, function(phrases_data){
      g.selectAll("line")
        .data([null])
        .enter()
        .append("line")
        .attr("y1", -props.height / 2 + props.marginLeft)
        .attr("y2", props.height / 2 - props.marginRight)
        .attr("x1", 0)
        .attr("x2", 0)
        .style("stroke","black");

      g.selectAll(".line-" + className)
        .data(phrases_data)
        .enter()
        .append("line")
        .attr("x1",-20)
        .attr("x2",20)
        .attr("y1", function(d){
          var startDuration = csv_data[parseInt(d.track_num)-1].start;
          var scaled = yScale(time(addDurations(startDuration, d.start)));
          return scaled;
        })
        .attr("y2", function(d){
          return d3.select(this).attr("y1");
        })
        .style("stroke",function(d){return colorScale(d.category)})
        .on("mouseover", function(d){
          d3.select("#" + className + "-selection").text(d.phrase);
        })
    });
  });
}

function drawHorizontalLineVis(albumCSV, phrasesCSV, divID){
  var gnThemeColors = d3.scaleLinear().domain([1,10,20]).range(["#e00000","#ffbaba","#4c2626"]).interpolate(d3.interpolateHcl);
  var gnTitleColors;
  props.height = 120;
  var className = albumCSV.substr(0,albumCSV.length - 4);
  var time = d3.timeParse("%M:%S");
  props.width = $("#" + divID).width();
  var svg = d3.select("#" + className + "-div").append("svg").attr("id","svg-" + className).attr("width", props.width).attr("height",props.height);
  var g = d3.select("#svg-" + className).append("g").attr("id","g-"+className).attr("transform", "translate(" + props.width / 2 + "," + props.height / 2 + ")");

  d3.csv(albumCSV, function(csv_data){
    var xScale = d3.scaleTime().domain([time("0:00"),time(csv_data[csv_data.length - 1].cumulative_duration)]).range([-props.width / 2 + props.marginLeft, props.width / 2 - props.marginRight]);
    d3.csv(phrasesCSV, function(phrases_data){
      var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
      var categories = ["alone","grateful","misc","imtd","dttm","bed","thunder","sunday","pray",
                        "weight","goodmorning","favor","dream","light","goodbye","lies","stranger","htykm","home",
                        "els","amh","lgm","walk","clean","niu"];
                        var colors = ["#F64747","#5c97bf","#2a7ab0","#005051","#634806","#7E7E7E","#34515E","#D25852","#765AB0","#F62459","#436E43","#6B8E23","#4b5555"]
      var customColorScale = d3.scaleOrdinal().domain(categories).range(colors);
      g.selectAll("line")
        .data([null])
        .enter()
        .append("line")
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("x1", -props.width / 2 + props.marginLeft)
        .attr("x2", props.width / 2 - props.marginRight)
        .style("stroke","black");

      g.selectAll(".song-division")
          .data(csv_data)
          .enter()
          .append("line")
          .attr("class","song-division")
          .attr("x1",function(d){return xScale(time(d.start));})
          .attr("x2",function(d){return xScale(time(d.start));})
          .attr("y1",-2)
          .attr("y2",2)
          .style("stroke","black")

      g.selectAll(".line-" + className)
        .data(phrases_data)
        .enter()
        .append("line")
        .attr("class", function(d){return "line " + className + " " + d.category})
        .attr("x1",function(d){
          var startDuration = csv_data[parseInt(d.track_num)-1].start;
          var scaled = xScale(time(addDurations(startDuration, d.start)));
          return scaled;
        })
        .attr("x2",function(d){
          return d3.select(this).attr("x1");
        })
        .attr("y1", function(d){return d.speaker == "jack" || d.speaker == "ella" ? -40 : 5})
        .attr("y2", function(d){return d.speaker == "jack" || d.speaker == "ella" ? -5 : 40})
        .style("stroke",function(d){return colorScale(d.category)})
        .on("mouseover", function(d){
          d3.select("#" + className + "-selection").text(d.phrase);
        })
        .on("click", function(d){
          d3.selectAll(".line." + className).transition().attr("y1",function(d){return d.speaker == "jack" || d.speaker == "ella" ? -40 : 5}).attr("y2", function(d){return d.speaker == "jack" || d.speaker == "ella" ? -5 : 40});
          d3.selectAll("." + className + "." + d.category)
            .transition()
            .attr("y1", function(t){
              var current_y1 = d3.select(this).attr("y1");
              if(current_y1 == -40 || current_y1 == 5){
                return t.speaker == "jack" || t.speaker == "ella" ? -50 : 5
              }
              else{
                return t.speaker == "jack" || t.speaker == "ella" ? -40 : 5
              }
            })
            .attr("y2", function(t){
              var current_y2 = d3.select(this).attr("y2");
              if(current_y2 == 40 || current_y2 == -5){
                return t.speaker == "jack" || t.speaker == "ella" ? -5 : 50;
              }
              else{
                return t.speaker == "jack" || t.speaker == "ella" ? -5 : 40;
              }
            });
        })
    });
  });
}


function renderAlbumArc(albumCSV, phrasesCSV, parentDiv, albumTitle){
  var className = albumCSV.substr(0,albumCSV.length - 4);
  /*console.log(className)
  $("#" + className + "-div").remove();
  console.log(parentDiv)
  d3.select("#" + parentDiv)
      .append("div")
      .attr("class","col-md-4")
      .attr("id", className + "-div")
      .append("h4")
      .attr("class", className + " text-center")
      .text(albumTitle + ": a visualization");
  d3.select("#" + className + "-div")
      .append("div")
      .attr("id", className + "-vis");
  d3.select("#" + className + "-div")
          .append("h4")
          .attr("id", className + "-selection")
          .attr("class", className + " text-center")
          .style("padding-top","none")
          .text("Hover over a line to see lyrics.");
          */
  props.width = $("#" + className + "-vis").width();
  var svg = d3.select("#" + className + "-vis").append("svg").attr("id","svg-" + className).attr("width", props.width).attr("height",props.height);
  var time = d3.timeParse("%M:%S");
  var lineForm = false;
  d3.csv(albumCSV, function(csv_data){
    console.log(csv_data)

    var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    d3.csv(phrasesCSV, function(phrases_data){
      var pieScale = d3.scaleTime().domain([time("00:00"),time(csv_data[csv_data.length - 1].end)]).range([0, 100]);
      var xScale = d3.scaleTime().domain([time("00:00"),time(csv_data[csv_data.length - 1].end)]).range([(-props.width / 2)+20, (props.width / 2)-20]);
      var categoryScale = d3.scaleBand().domain(phrases_data.map(function(d){return d.category})).range([-200, 200]).paddingOuter(0.5);
      var speakerScale = d3.scaleBand().domain(phrases_data.map(function(d){return d.speaker})).range([-100, 100]).paddingOuter(0.5);
      var speakerColor = d3.scaleOrdinal().domain(["jack","camilla","lena","evan"]).range(["#959595","#EE4222","#175ed1","#363636"]);
      csv_data.forEach(function(d){
        d.values = [{x: d.start, y: 0},{x: d.end, y: 0}];
      });
      console.log(csv_data)
      var pieGenerator = d3.pie().value(function(d){return pieScale(time(d.duration))}).sort(null).startAngle(0.05 * Math.PI).endAngle(1.95*Math.PI);
      var arcData = pieGenerator(csv_data);
      var arcGenerator = d3.arc().innerRadius((props.width / 2) - 20).outerRadius((props.width / 2) - 15);
      var g = d3.select("#svg-" + className).append("g").attr("id","g-"+className).attr("transform", "translate(" + props.width / 2 + "," + props.height / 2 + ")");
      //g.append("circle").attr("cx","0").attr("cy","0").attr("r","10").text("View lyrics page");
      //g.append("text").attr("text-anchor","middle").attr("dx","0").attr("dy","-5").on("click",function(){window.location = "/album-stuff/" + className + "-lyrics.html"}).text("View lyrics page");

      var lineGenerator = d3.line().x(function(d){return xScale(time(d.x))}).y(function(d){return d.y;});

      d3.select('#g-' + className)
        .selectAll('.song-line-' + className)
        .data(arcData)
        .enter()
        .append('path')
        .attr('d', function(d){return lineForm ? lineGenerator(d.data.values) : arcGenerator(d)})
        .attr("class","song-line-" + className + " " + className)
        .style("fill", function(d){return "black"})
        .style("stroke",function(d){return lineForm ? "black" : "white"})
        .style("stroke-width", "1")
        .on("mouseover", function(d){
          d3.select("#" + className + "-selection").text(d.data.track_title).style("visibility","visible");
        })
        .on("mouseout", function(d){
          d3.select("#" + className + "-selection").text("");
        })
        .on("click", function(d){
          console.log(lineForm);
            if(lineForm){
              d3.selectAll(".song-line-" + className)
                .transition()
                .duration(100)
                .delay(function(d,i){return 100 * i})
                .attr("d", arcGenerator)
                .style("fill", "black")
                .style("stroke-width","1")
                .style("stroke","white");
              g.selectAll(".song-division")
                .remove();
              lineForm = false;
              d3.selectAll(".phrase-" + className)
                  .transition()
                  .duration(100)
                  .delay(100)
                  .attr("x1",function(d){
                      var startDuration = csv_data[parseInt(d.track_num)-1].start;
                      var scaled = circleScale(xScale(time(addDurations(startDuration, d.start))));
                      return radiusScale(d.category) * Math.cos(scaled);
                  })
                  .attr("x2", function(d){
                    var startDuration = csv_data[parseInt(d.track_num)-1].start;
                    var scaled = circleScale(xScale(time(addDurations(startDuration, d.start))));
                    return (radiusScale(d.category) - 10) * Math.cos(scaled);
                  })
                  .attr("y1", function(d){
                      var startDuration = csv_data[parseInt(d.track_num)-1].start;
                      var scaled = circleScale(xScale(time(addDurations(startDuration, d.start))));
                      return radiusScale(d.category) * Math.sin(scaled);
                    })
                  .attr("y2",function(d){
                    var startDuration = csv_data[parseInt(d.track_num)-1].start;
                    var scaled = circleScale(xScale(time(addDurations(startDuration, d.start))));
                    return (radiusScale(d.category) - 10) * Math.sin(scaled);
                  })
            }
            else{
              d3.selectAll(".song-line-" + className)
                .transition()
                .attr("d", function(d){return lineGenerator(d.data.values)})
                .style("stroke", "black")
                .style("stroke-width", "3");
                g.selectAll(".song-division")
                      .data(csv_data)
                      .enter()
                      .append("line")
                      .attr("class","song-division")
                      .attr("x1",function(d){return xScale(time(d.start));})
                      .attr("x2",function(d){return xScale(time(d.start));})
                      .attr("y1",-5)
                      .attr("y2",5)
                      .style("stroke","black");
              d3.selectAll(".phrase-" + className)
                  .transition()
                  .attr("x1", function(d){
                    var startDuration = csv_data[parseInt(d.track_num)-1].start;
                    return xScale(time(addDurations(startDuration, d.start)));
                  })
                  .attr("x2", function(d){
                    var startDuration = csv_data[parseInt(d.track_num)-1].start;
                    return xScale(time(addDurations(startDuration, d.start)));
                  })
                  .attr("y1",-100)
                  .attr("y2",-100)
                  .transition()
                  .delay(300)
                  .duration(500)
                  .attr("y1", function(d){
                      return categoryScale(d.category) - 10;
                  })
                  .attr("y2", function(d){
                      return categoryScale(d.category) + 10;
                  });

              lineForm = true;
            }
        });

          var circleScale = d3.scaleLinear().domain([-props.width / 2, props.width / 2]).range([2 * Math.PI / 3 - 0.35,7 * Math.PI / 3 + 0.35]);
          var radiusPointEstimate = -1 * (props.width * 0.4);
          var radiusScale = d3.scaleBand().domain(phrases_data.map(function(d){return d.category})).range([radiusPointEstimate - 20,radiusPointEstimate + 40]);
          g.append("g").attr("id","circle-g")
              .selectAll(".phrase-marker")
              .data(phrases_data)
              .enter()
              .append("line")
              .attr("class",function(d){return "phrase-marker " + "phrase-" + className + " circle-" + d.category;})
              .attr("x1",function(d){
                if(lineForm){
                  var startDuration = csv_data[parseInt(d.track_num)-1].start;
                  return xScale(time(addDurations(startDuration, d.start)));
                }
                else{
                  var startDuration = csv_data[parseInt(d.track_num)-1].start;
                  var scaled = circleScale(xScale(time(addDurations(startDuration, d.start))));
                  return radiusScale(d.category) * Math.cos(scaled);
                }
              })
              .attr("x2", function(d){
                if(lineForm){
                  var startDuration = csv_data[parseInt(d.track_num)-1].start;
                  return xScale(time(addDurations(startDuration, d.start)));
                }
                else{
                  var startDuration = csv_data[parseInt(d.track_num)-1].start;
                  var scaled = circleScale(xScale(time(addDurations(startDuration, d.start))));
                  return (radiusScale(d.category) - 10) * Math.cos(scaled);
                }
              })
              .attr("y1", function(d){
                if(lineForm){
                  return categoryScale(d.category) - 10;
                }
                else{
                  var startDuration = csv_data[parseInt(d.track_num)-1].start;
                  var scaled = circleScale(xScale(time(addDurations(startDuration, d.start))));
                  return radiusScale(d.category) * Math.sin(scaled);
                }
              })
              .attr("y2",function(d){
                if(lineForm){
                  return categoryScale(d.category) + 10;
                }
                else{
                  var startDuration = csv_data[parseInt(d.track_num)-1].start;
                  var scaled = circleScale(xScale(time(addDurations(startDuration, d.start))));
                  return (radiusScale(d.category) - 10) * Math.sin(scaled);
                }
              })
              .style("visibility", function(d){return d.phrase == " " ? "hidden" : "visibile"})
              .style("stroke", function(d){return colorScale(d.category)})
              .style("stroke-width","2")
              .on("mouseover", function(d){
                if(d.phrase != " "){
                  d3.select("#" + className + "-selection").text(d.phrase).style("visibility","visible");
                }
              });

            var categories = phrases_data.map(function(d){return d.category;}).filter(function(d,i,self){
              return self.indexOf(d) == i;
            })
            d3.select("#checkbox-div").selectAll(".checkbox")
              .data(categories)
              .enter()
                .append("label")
                .attr("class","checkbox-inline gonenow")
                .text(function(d){return d;})
                  .append("input")
                  .attr("type","checkbox")
                  .attr("id", function(d){return "checkbox-" + d;})
                  .attr("checked","checked")
                  .on("change", function(d){
                      if(d3.select(this).attr("checked") == "checked"){
                        d3.selectAll(".circle-" + d).attr("visibility","hidden")
                        d3.select(this).attr("checked","unchecked");
                      }
                      else{
                        d3.selectAll(".circle-" + d).attr("visibility","visible")
                        d3.select(this).attr("checked","checked");
                      }
                  });
            d3.select("#speaker-toggle").on("click", function(){
                d3.selectAll(".phrase-marker")
                    .transition()
                    .attr("y1", function(d){
                      if(d.speaker != "jack"){
                        return -100;
                      }
                      else{
                        return categoryScale(d.category) - 10;
                      }
                    })
                    .attr("y2", function(d){
                      if(d.speaker != "jack"){
                        return -90;
                      }
                      else{
                        return categoryScale(d.category) + 10;
                      }
                    });
            })
      })
  });
}

function renderAlbumVisualization(albumCSV, phrasesCSV, startDiv){
  var svg = d3.select("#" + startDiv).append("svg").attr("width", props.width).attr("height",props.height);
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
        d3.json(phrasesCSV, function(json_data){
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
                  d3.select(this).style("stroke-width","1");
                  d3.select("#selection").text("");
                });
        });
  });
}
