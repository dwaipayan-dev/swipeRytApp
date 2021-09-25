console.log("Hello");
$(document).ready(function () {
    let changed = 0
    let id = parseInt(document.getElementById("imageNo").innerText);
    let jwt = document.getElementById('jwt').innerText;
    console.log(id);
    $("img").swipeleft(function () {
        $(this).hide()
        //jquery post request to leftswipe and right swipe which would update db
        $.post("/swipedLeft?auth=" + jwt, {
            id: id
        }, (data)=>{
            console.log(data);
            
        }).then(()=>{
            changed = 1
            //alert("Rejected");
            //location assign to same url with different image id
            window.location.assign("/welcome/" + (id + 1));
        })
        

    });

    $("img").swiperight(function () {
        $(this).hide()
        //jquery post request to leftswipe and right swipe which would update db
        $.post("/swipedRight?auth=" + jwt, {
            id: id
        }, (data)=>{
            console.log(data);
            alert(data);
        }).then(()=>{
            changed = 1
            //location assign to same url with different image id
            window.location.assign("/welcome/"+(id+1));
        })
    });

    setInterval(()=>{
        if(changed === 0){
            window.location.assign("/welcome/"+(id+1));
        }
    }, 5000);
});
