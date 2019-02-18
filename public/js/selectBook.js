var borderObject=null;

function selectBook(click_object) {
    if(borderObject != null){
        borderObject.children[0].style.border="0px";
    }

    borderObject = click_object;

    borderObject.children[0].style.border="3px solid red";
    //
    // var tempImg = borderObject.children[0].attr('src');
    // var tempTitle = borderObject.children[1].children[0].children[0].cloneNode(true);
    // var tempAuthor = borderObject.children[1].children[0].children[0].cloneNode(true);
    //
    // console.log(tempImg);
    // console.log(tempTitle);
    // console.log(tempAuthor);
    // $('#selectedbookimage').attr('src', tempImg);
}
