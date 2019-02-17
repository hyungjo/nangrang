var borderObject=null;

function selectBook(click_object) {
    if(borderObject != null){
        borderObject.children[0].style.border="0px";
    }

    borderObject = click_object; 
    
    borderObject.children[0].style.border="3px solid red";
}