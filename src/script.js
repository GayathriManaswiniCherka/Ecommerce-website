// var mainImg = document.getElementById("mainImg");
// var smallImg = document.getElementsByClassName("small-img");
// smallImg[0].onclick = function(){
//     mainImg.src = smallImg[0].src  
// }
// smallImg[1].onclick = function(){
//     mainImg.src = smallImg[1].src  
// }
// smallImg[2].onclick = function(){
//     mainImg.src = smallImg[2].src  
// }
// smallImg[3].onclick = function(){
//     mainImg.src = smallImg[3].src  
// }

import {initializeApp} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import{ getAuth , createUserWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore,collection,getDocs,query,limit,startAfter,orderBy,where,getDoc,doc,FieldPath,setDoc   } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyAg_GTiI3DqOwCzWF64prIMH7_vUfbezS8",
    authDomain: "lillav-20ed2.firebaseapp.com",
    projectId: "lillav-20ed2",
    storageBucket: "lillav-20ed2.appspot.com",
    messagingSenderId: "1026670511176",
    appId: "1:1026670511176:web:c588be948413a5197f047d"
  };
  initializeApp(firebaseConfig);

  const auth = getAuth();
  const db = getFirestore();
  console.log(db)
;

function updateNavbar(user) {
  const userDisplay = document.getElementById('userDisplay');
  if (user) {
      const displayName = user.displayName || user.email; // Use displayName if available, otherwise use email
      userDisplay.innerHTML = `<a>${displayName}</a>    <button id='logOut' class='normal'>Logout</button>`;
      const logoutBtn = document.getElementById('logOut');
    logoutBtn.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          alert(`${user.email} signed out`);
        })
        .catch((err) => {
          alert("Failed to sign out");
        });
    });
  } else {
      userDisplay.innerHTML = `<a href="/signup.html">Login/sign-up</a>`;
  }
}


// Listen for authentication state changes
auth.onAuthStateChanged(user => {
  updateNavbar(user);
});


let userId;
auth.onAuthStateChanged(user => {
  if (user) {
    userId = user.uid;
    // Load user's cart items
    displayCartItems(userId);
  } else {
    userId = null;
  }
});

const addProductToCart = (productId) => {
  if (userId) { // Check if userId is available
    addToCart(userId, productId); // Pass userId to addToCart function
  } else {
    console.error("User ID is not available yet.");
  }
};

// Function to add product to cart
const addToCart = async (userId, productId) => { // Add userId parameter
  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);

    if (productDoc.exists()) {
      const productData = productDoc.data();
      const cartItem = {
        id: productId,
        url:productData.url,
        description:productData.description,
        title: productData.title,
        price: productData.price,
        quantity: 1
      };

      const cartRef = doc(db, 'cart', userId);
      await setDoc(cartRef, { [productId]: cartItem }, { merge: true }); // Merge with existing data if any

      console.log('Product added to cart', productId);
      // displayCartItems(userId);
    } else {
      console.log('Product does not exist');
    }
  } catch (error) {
    console.error('Error adding product to cart:', error);
  }
};
let totalPrice = 0;
// Function to display cart items
const displayCartItems = async (userId) => {
  if (window.location.pathname === '/cart.html') {
    try {
      const cartRef = doc(db, 'cart', userId);
      const cartDoc = await getDoc(cartRef);
      const cartContainer = document.getElementById('cart');
      cartContainer.innerHTML = ''; // Clear cart container before displaying items

      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        const cartItems = Object.values(cartData || {});

        // Create a table element
        const table = document.createElement('table');
        table.classList.add('cart-table');

        // Create table header
        const headerRow = table.insertRow();
        headerRow.innerHTML = `
          <thead>
            <tr>
              <th>Remove</th>
              <th>Product</th>
              <th>Details</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
        `;
        
        
        cartItems.forEach(itemData => {
          const row = table.insertRow();
          const totalPriceCell = row.insertCell(); 
          const subtotal = Number(itemData.price * itemData.quantity);
          console.log(subtotal);
          totalPrice += subtotal;

          console.log(totalPrice);
          row.innerHTML = `
            <tbody>
              <tr>
              <td><button class="remove-button" data-product-id="${itemData.id}"><i class="far fa-times-circle"></i></button></td>
                <td><img src="${itemData.url}" alt=""></td>
                <td>${itemData.description}</td>
                <td>${itemData.price}</td>
                <td><input type="number" class="quantity" value="${itemData.quantity}" min="1"></td>
                <td>${itemData.price * itemData.quantity}</td>
              </tr>
            </tbody>
          `;

          // Add event listener to quantity input field
          const quantityInput = row.querySelector('.quantity');
          quantityInput.addEventListener('input', async (event) => {
            const newQuantity = parseInt(event.target.value);
            // Update quantity and total price in database
            await updateCartItem(userId, itemData.id, { quantity: newQuantity });
            // Update total price cell in table
            totalPriceCell.textContent = itemData.price * newQuantity;
            location.reload();
          });

          const removeButton = row.querySelector('.remove-button');
        removeButton.addEventListener('click', () => {
          const productId = removeButton.getAttribute('data-product-id');
          // Remove row from table
          row.remove();
          // Remove item from database
          deleteCartItem(userId, productId);
        });
        });
        getTotalPrice(totalPrice);

        cartContainer.appendChild(table);
      } else {
        console.log('Cart is empty');
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }
};


const getTotalPrice = (totalPrice)=>{
  let subtotalprice = document.getElementById('subtotalprice');
let TotalPrice = document.getElementById('totalprice');
subtotalprice.innerHTML =`Rs.${totalPrice}`;
TotalPrice.innerHTML = `Rs.${totalPrice}`
}

const updateCartItem = async (userId, itemId, newData) => {
  try {
    const cartRef = doc(db, 'cart', userId);
    const cartDoc = await getDoc(cartRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      cartData[itemId] = { ...cartData[itemId], ...newData };

      
      await setDoc(cartRef, cartData);
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
  }
};
const deleteCartItem = async (userId, productId) => {
  try {
    const cartRef = doc(db, 'cart', userId);
    const cartDoc = await getDoc(cartRef);
    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      delete cartData[productId];
      await setDoc(cartRef, cartData);
      console.log('Item removed from cart:', productId);
    }
  } catch (error) {
    console.error('Error deleting item from cart:', error);
  }
};

const renderProductList = (products, containerId) => {
  const productListContainer = document.getElementById(containerId);
  productListContainer.innerHTML = '';

  products.forEach(product => {
      const { id, title, description, price, url } = product;

      const productElement = document.createElement('div');
      productElement.classList.add('pro');
      productElement.innerHTML = `
          <img src="${url}" alt="">
          <div class="des">
              <span>${title}</span>
              <h5>${description}</h5>
              <h4>Rs.${price}</h4>
          </div>
          <button><i class="fa-sharp fa-solid fa-bag-shopping"></i></button>
      `;
      
      productElement.querySelector('button').addEventListener('click', () => {
        addProductToCart(id);
      });

      productListContainer.appendChild(productElement);
  });
};

  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const fetchProducts = async (containerId) => {
    if (window.location.pathname !== '/cart.html') {
      try {
        const productsCollection = collection(db, 'products');
        const querySnapshot = await getDocs(productsCollection);
        const productDocs = querySnapshot.docs;

        const shuffledDocs = shuffleArray(productDocs);

        const selectedDocs = shuffledDocs.slice(0, 8);

        const selectedProducts = selectedDocs.map(doc => ({ id: doc.id, ...doc.data() }));

        renderProductList(selectedProducts, containerId);
    } catch (error) {
        console.error(`Error fetching products for ${containerId}:`, error);
    }
  }
    
};

  
  // Function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  window.onload = () => {
    fetchProducts('product-list');
    fetchProducts('product-list-2');
    fetchProducts('product-list-3');
    fetchProducts('product-list-4');
  };
  
  
  
  








