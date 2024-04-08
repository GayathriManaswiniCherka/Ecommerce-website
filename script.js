var mainImg = document.getElementById("mainImg");
var smallImg = document.getElementsByClassName("small-img");
smallImg[0].onclick = function(){
    mainImg.src = smallImg[0].src  
}
smallImg[1].onclick = function(){
    mainImg.src = smallImg[1].src  
}
smallImg[2].onclick = function(){
    mainImg.src = smallImg[2].src  
}
smallImg[3].onclick = function(){
    mainImg.src = smallImg[3].src  
}

// function add_to_cart(rbtn, img, name, price, quantity){
//    let cart = localStorage.getItem("cart")
//    if(cart==null){
//      let products = [];
//      let product = {prodrbtn : rbtn , prodImg : img, prodName : name, prodPrice : price, prodQty : 1}
//      products.push(product);
//      localStorage.setItem("cart",JSON.stringify(products))
//    }else{

//    }
// }
// const bar = document.getElementById('bar');
// const nav = document.getElementById('navbar');
// if (bar) {
//     bar.addEventListener('click',()=>{
//         nav.classList.add('active');
//     })
// }
