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

function search(term){

}

$("#about-me").append("<h3>About Me</h3> <p>My friends get tired of hearing me rant about music, so I figured I would do that here instead of subjecting them to it!</p>")

addTags();
addLatestPosts();
