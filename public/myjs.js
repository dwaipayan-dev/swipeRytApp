console.log("Hello");
$(document).ready(function () {
    $("img").swipeleft(function () {
        $(this).hide()
        //jquery post request to leftswipe and right swipe which would update db
        let id = parseInt(document.getElementById("imageNo").innerText);
        console.log(id);
        //location assign to same url with different image id
        window.location.assign("/welcome/"+(id+1));
    });
});

$(document).ready(function () {
    $("p").click(function () {
        $(this).hide()
        //jquery post request to leftswipe and right swipe which would update db

        //location assign to same url with different image id
        window.location.assign("/home");
    });
});