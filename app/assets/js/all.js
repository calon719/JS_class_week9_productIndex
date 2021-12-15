// 產品頁面
// API
const api_path = 'calon';
const baseUrl = 'https://livejs-api.hexschool.io';
const product_path = `api/livejs/v1/customer/${api_path}/products`;
const carts_path = `api/livejs/v1/customer/${api_path}/carts`;
const customOrder_path = `api/livejs/v1/customer/${api_path}/orders`;

// DOM
const categorySelector = document.querySelector('[name="categorySelector"]');
const cartList = document.querySelector('.cartList');
const deleteAllProductsBtn = document.querySelector('[data-js="deleteAllProductsBtn"]');
const loadingFullScreenDiv = document.querySelector('[data-js="loading-fullScreen"]');
const productList = document.querySelector('ul[data-js="productList"]');
const sendOrderInfoBtn = document.querySelector('[data-js="sendOrderInfoBtn"');

// data
let cartsData = [];
let productsData = [];

// event
categorySelector.addEventListener('change', productFilter);
cartList.addEventListener('click', deleteCartProduct);
cartList.addEventListener('change', changeQuantity);
deleteAllProductsBtn.addEventListener('click', deleteAllProducts);
productList.addEventListener('click', addCart);
sendOrderInfoBtn.addEventListener('click', sendOrderInfo);

init();

function init() {
  getProductsData();
};

function getProductsData() {
  axios.get(`${baseUrl}/${product_path}`).then(res => {
    productsData = res.data.products;
    renderCategorySelector();
    getCartListData();
  }).catch(err => {
    let errData = err.response.data;
    if (errData.status === false) {
      console.log(err.response.data.message);
    };
  }).then(() => {
    const loadingAnimation = document.querySelector('.productList-loading');
    loadingAnimation.setAttribute('data-loading', 'hidden');
  });
};

function renderCategorySelector() {
  let categoryAry = productsData.map(item => item.category);
  categoryAry = categoryAry.filter((item, index, ary) => ary.indexOf(item) == index);

  let optionStr = '<option value="全部" selected>全部</option>';
  categoryAry.forEach(item => { optionStr += `<option value="${item}">${item}</option>` });
  categorySelector.innerHTML = optionStr;
};

function renderProductList(data) {
  let listStr = '';
  data.forEach(item => {
    let check = cartsData.carts.some(product => product.product.id == item.id);
    let price = item.price.toLocaleString();
    let originPrice = item.origin_price.toLocaleString();
    listStr += `
      <li>
        <div class="bg-cover bg-center h-75 relative" style="background-image: url('${item.images}');">
          <div class="absolute top-3 -right-1 bg-dark text-white py-2 px-6">新品</div>
        </div>
        <button class="py-3 mb-2 ${check ? 'bg-primary' : 'bg-dark'} ${check ? '' : 'hover:bg-secondary'} text-white text-lg w-full
        transition duration-500 ${check ? 'cursor-default' : ''}" data-js="addCartBtn" data-id="${item.id}" ${check ? 'disabled' : ''}>
          ${check ? '已加入購物車' : '加入購物車'}
        </button>
        <div class="text-lg">
          <h5>${item.title}</h5>
          <p class="line-through">NT$${originPrice}</p>
          <p class="text-3xl">NT$${price}</p>
        </div>
      </li>
    `
  });
  productList.innerHTML = listStr;
};

function getCartListData() {
  axios.get(`${baseUrl}/${carts_path}`).then(res => {
    cartsData = res.data;
    productFilter(); // 需要用到購物車資料，所以要等拿到購物車資料再做產品列表渲染
    renderCartList();
  }).catch(err => {
    let errData = err.response.data;
    if (errData.status === false) {
      console.log(err.response.data.message);
    }
  }).then(() => {
    const loadingAnimation = document.querySelector('.cart-loading');
    loadingAnimation.setAttribute('data-loading', 'hidden');
  });
};

function renderCartList() {
  // 沒有商品在購物車時，隱藏 table，有的時候渲染 cartList
  const cartMsg = document.querySelector('p[data-js="cartMsg"]');
  const cartTable = document.querySelector('table[data-js="cartMsg"]');
  if (cartsData.carts.length === 0) {
    cartMsg.setAttribute('data-cartMsg', 'show');
    cartTable.setAttribute('data-cartMsg', 'hidden');
  } else {
    cartMsg.setAttribute('data-cartMsg', 'hidden');
    cartTable.setAttribute('data-cartMsg', 'show');

    let listStr = '';
    cartsData.carts.forEach(item => {
      const price = item.product.price.toLocaleString();
      const totalPrice = (item.product.price * item.quantity).toLocaleString();
      listStr += `
      <tr class="border-b border-gray-300">
        <td class="flex items-center py-5">
          <img class="w-20 h-20 object-cover mr-4" src="${item.product.images}" alt="產品圖片">
          <h5>${item.product.title}</h5>
        </td>
        <td class="py-5">NT$${price}</td>
        <td class="py-5">
          <input class="w-12 border border-gray-300 rounded px-2 text-center" data-id="${item.id}" data-js="quantityInput" type="text" value="${item.quantity}">
        </td>
        <td class="py-5">NT$${totalPrice}</td>
        <td class="text-center py-5">
          <button class="material-icons hover:text-danger transition duration-500 p-2" href="#" data-js="deleteProductBtn" data-id="${item.id}">close</button>
        </td>
      </tr>
      `;
    });
    cartList.innerHTML = listStr;

    const cartTotal = document.querySelector('[data-js="cartTotal"]');
    const finalTotal = cartsData.finalTotal.toLocaleString();
    cartTotal.textContent = `NT$${finalTotal}`;
  };
};

function productFilter() {
  let category = categorySelector.value;
  if (category === '全部') {
    renderProductList(productsData);
  } else {
    let filteredAry = productsData.filter(item => item.category == category);
    renderProductList(filteredAry);
  };
};

function addCart(e) {
  if (e.target.nodeName !== 'BUTTON') { return };
  let btnProp = e.target.dataset.js;
  let id = e.target.dataset.id;
  let obj = {
    "data": {
      "productId": id,
      "quantity": 1
    }
  };
  loadingFullScreenDiv.setAttribute('data-loading', 'show');
  axios.post(`${baseUrl}/${carts_path}`, obj).then(res => {
    cartsData = res.data;
    renderCartList();
    productFilter(); // 不呼叫 renderProductList() 避免已篩選渲染的 product list 出錯
    popUpSuccessMsg(btnProp);
  }).catch(err => {
    let errData = err.response.data;
    if (errData.status === false) {
      console.log(err.response.data.message);
    };
  }).then(() => {
    loadingFullScreenDiv.setAttribute('data-loading', 'hidden');
  });
};

function deleteCartProduct(e) {
  const targetJS = e.target.dataset.js;
  if (targetJS !== 'deleteProductBtn') { return };

  let id = e.target.dataset.id;
  loadingFullScreenDiv.setAttribute('data-loading', 'show');
  axios.delete(`${baseUrl}/${carts_path}/${id}`).then(res => {
    cartsData = res.data;
    renderCartList();
    productFilter(); // 不呼叫 renderProductList() 避免已篩選渲染的 product list 出錯
  }).catch(err => {
    let errData = err.response.data;
    if (errData.status === false) {
      console.log(err.response.data.message);
    }
  }).then(() => {
    loadingFullScreenDiv.setAttribute('data-loading', 'hidden');
  });
};

function deleteAllProducts() {
  // double check
  const popUp = document.querySelector('[data-js="doubleCheckpopUp"]');
  popUp.setAttribute('data-popUp', 'show');
  popUp.addEventListener('click', e => {
    let btnProp = e.target.getAttribute('data-dblCheckBtn');
    if (btnProp === 'cancel' || Object.is(popUp, e.target)) { // 按取消或非訊息視窗時隱藏 double check div
      popUp.setAttribute('data-popUp', 'hidden');
    } else if (btnProp === 'delete') {
      axios.delete(`${baseUrl}/${carts_path}`).then(res => {
        cartsData = res.data;
        renderCartList();
        productFilter();
      }).catch(err => {
        let errData = err.response.data;
        if (errData.status === false) {
          console.log(err.response.data.message);
        };
      }).then(() => {
        popUp.setAttribute('data-popUp', 'hidden');
      });
    };
  });
};

function sendOrderInfo(e) {
  // 錯誤訊息初始化
  let spanAry = document.querySelectorAll(`span[data-msg]`);
  spanAry.forEach(el => {
    el.style.visibility = 'hidden';
  });

  // 表單驗證
  const form = document.querySelector('[data-js="orderForm"]');
  let constraints = {
    customerName: {
      presence: {
        message: '^請輸入您的姓名'
      },
    },
    customerTel: {
      presence: {
        message: '^請輸入您的聯絡電話'
      },
      format: {
        pattern: '[0-9]+',
        flags: 'i',
        message: '^請勿輸入數字以外的文字'
      },
      length: {
        minimum: 9,
        message: '^號碼不可以少於 9 碼，室內電話請輸入區號'
      }
    },
    customerEmail: {
      presence: {
        message: '^請輸入您的 Email'
      },
      email: {
        message: '^Email 格式不正確'
      }
    },
    customerAdd: {
      presence: {
        message: '^請輸入您的寄送地址'
      }
    }
  };

  let errors = validate(form, constraints); // 錯誤回傳 object  正確回傳 undefined
  if (errors) {
    let keys = Object.keys(errors);
    keys.forEach(key => {
      let el = document.querySelector(`[data-msg=${key}]`);
      el.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${errors[key][0]}`;
      el.style.visibility = 'visible';
    });
  } else {
    let nameValue = document.querySelector('#customerName').value;
    let telValue = document.querySelector('#customerTel').value;
    let emailValue = document.querySelector('#customerEmail').value;
    let addressValue = document.querySelector('#customerAdd').value;
    let paymentValue = document.querySelector('#paymentMethod').value;

    let obj = {
      "data": {
        "user": {
          "name": nameValue.trim(),
          "tel": telValue.trim(),
          "email": emailValue.trim(),
          "address": addressValue.trim(),
          "payment": paymentValue.trim()
        }
      }
    };

    let btnProp = e.target.dataset.js;

    loadingFullScreenDiv.setAttribute('data-loading', 'show');
    axios.post(`${baseUrl}/${customOrder_path}`, obj).then(res => {
      getCartListData();
      popUpSuccessMsg(btnProp);
      const orderInputs = document.querySelectorAll('[data-js="orderInput"]');
      orderInputs.forEach(function (item) {
        item.value = '';
      });
    }).catch(err => {
      let errData = err.response.data;
      if (errData.status === false) {
        console.log(err.response.data.message);
        popUpSuccessMsg(btnProp);
      };
    }).then(() => {
      loadingFullScreenDiv.setAttribute('data-loading', 'hidden');
    });
  };
};

function changeQuantity(e) {
  let value = e.target.value;
  let id = e.target.dataset.id;
  let product = cartsData.carts.filter(item => item.id == id)[0];
  let quantityNotChanged = product.quantity == value; // 判斷數量有沒有改變
  let isNum = value.match(/[1-9]/); // 除了數字以外的字會回傳陣列

  if (e.target.dataset.js !== 'quantityInput' || quantityNotChanged || !isNum || value < 0) { return };
  let obj = {
    "data": {
      "id": id,
      "quantity": Number(value)
    }
  };

  loadingFullScreenDiv.setAttribute('data-loading', 'show');
  axios.patch(`${baseUrl}/${carts_path}`, obj).then(res => {
    cartsData = res.data;
    renderCartList();
  }).catch(err => {
    let errData = err.response.data;
    if (errData.status === false) {
      console.log(err.response.data.message);
    };
  }).then(() => {
    loadingFullScreenDiv.setAttribute('data-loading', 'hidden');
  });
};

// 加入購物車、訂單資料送出提示視窗
function popUpSuccessMsg(btnProp) {
  const popUpMsg = document.querySelector('[data-js="popUpMsg"]');
  if (btnProp === 'sendOrderInfoBtn') {
    if (cartsData.carts.length === 0) {
      popUpMsg.innerHTML = `<i class="fas fa-times-circle fa-4x text-danger mb-4"></i> <p class="text-2xl">購物車內沒有東西</p>`;
    } else {
      popUpMsg.innerHTML = `<i class="fas fa-check-circle fa-4x text-success mb-4"></i> <p class="text-2xl">訂單成功送出</p>`;
    };
  } else if (btnProp === 'addCartBtn') {
    popUpMsg.innerHTML = `<i class="fas fa-check-circle fa-4x text-success mb-4"></i> <p class="text-2xl">成功加入購物車</p>`;
  };

  const popUp = document.querySelector('[data-js="popUpBlock"]');
  let styleOpacity = parseFloat(popUp.style.opacity);
  popUp.setAttribute('data-popUp', 'show');
  let fadeInBlock = window.setInterval(() => {
    // div 逐漸浮出
    if (styleOpacity < 10) {
      styleOpacity += 0.5;
      popUp.style.opacity = styleOpacity;
    } else {
      window.clearInterval(fadeInBlock); // 停止浮出

      // div 逐漸消失
      let fadeOutBlock = window.setInterval(() => {
        if (styleOpacity > 0) {
          styleOpacity -= 0.5;
          popUp.style.opacity = styleOpacity;
        } else {
          popUp.setAttribute('data-popUp', 'hidden');
          window.clearInterval(fadeOutBlock);
        };
      }, 50);
    };
  }, 30);
};