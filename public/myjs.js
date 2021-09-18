$(document).ready(function () {
    $("p").click(function () {
        $(this).hide()
        //jquery post request to leftswipe and right swipe which would update db

        //location assign to same url with different image id
        window.location.assign("https://www.google.co.in/");
    });
});