// 產品頁面
// API
const api_path = 'calon';
const baseUrl = 'https://livejs-api.hexschool.io';
const product_path = `api/livejs/v1/customer/${api_path}/products`;
const carts_path = `api/livejs/v1/customer/${api_path}/carts`;
const customOrder_path = `api/livejs/v1/customer/${api_path}/orders`;

// DOM
const categorySelector = document.querySelector('[name="categorySelector"]');
const productList = document.querySelector('.productList');
const cartList = document.querySelector('.cartList');
const sendOrderInfoBtn = document.querySelector('[data-js="sendOrderInfoBtn"');

// data
let productsData;
let cartsData;

// event
categorySelector.addEventListener('change', productFilter);
productList.addEventListener('click', addCart);
cartList.addEventListener('click', deleteCartProduct);
sendOrderInfoBtn.addEventListener('click', sendOrderInfo);

init();

function init() {
  getProductsData();
  getCartListData();
};

function getProductsData() {
  axios.get(`${baseUrl}/${product_path}`).then(function (res) {
    productsData = res.data.products;
    renderProductList(productsData);
    renderCategorySelector();
  }).catch(function (err) {
    let errData = err.response.data;
    if (errData.status === false) {
      console.log(err.response.data.message);
    }
  })
}

function renderCategorySelector() {
  let categoryAry = [];

  productsData.forEach(function (item) {
    categoryAry.push(item.category);
  });
  categoryAry = categoryAry.filter(function (item, index, ary) {
    return ary.indexOf(item) == index;
  });

  let optionStr = '<option value="全部" selected>全部</option>';

  categoryAry.forEach(function (item) {
    optionStr += `<option value="${item}">${item}</option>`;
  });
  categorySelector.innerHTML = optionStr;
};

function renderProductList(data) {
  let listStr = '';
  data.forEach(function (item) {
    let price = item.price.toLocaleString();
    let originPrice = item.origin_price.toLocaleString();
    listStr += `
      <li>
        <div class="bg-cover h-75 relative" style="background: url('${item.images}');">
          <div class="absolute top-3 -right-1 bg-dark text-white py-2 px-6">新品</div>
        </div>
        <button class="py-3 mb-2 bg-dark hover:bg-secondary text-white text-lg w-full transition duration-500" data-id="${item.id}">加入購物車</button>
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
  axios.get(`${baseUrl}/${carts_path}`).then(function (res) {
    cartsData = res.data;
    renderCartList();
  }).catch(function (err) {
    let errData = err.response.data;
    if (errData.status === false) {
      console.log(err.response.data.message);
    };
  });
};

function renderCartList() {
  let str = '';
  cartsData.carts.forEach(function (item) {
    let price = item.product.price.toLocaleString();
    let totalPrice = (item.product.price * item.quantity).toLocaleString();
    str += `
    <tr class="border-b border-gray-300">
    <td class="flex items-center py-5">
    <img class="w-20 h-20 object-cover mr-4" src="${item.product.images}" alt="產品圖片">
    <h5>${item.product.title}</h5>
    </td>
    <td class="py-5">NT$${price}</td>
    <td class="py-5">
    <input class="w-12 border border-gray-300 rounded px-2 text-center" data-js="quantityInput" type="text" value="${item.quantity}">
    </td>
    <td class="py-5">NT$${totalPrice}</td>
    <td class="text-center py-5">
    <button class="material-icons hover:text-danger transition duration-500 p-2" href="#" data-js="deleteProductBtn" data-id="${item.id}">close</button>
    </td>
    </tr>
    `;
  });
  let finalTotal = cartsData.finalTotal.toLocaleString();
  str += `
    <tr>
      <td class="py-5">
        <button class="border rounded py-2 px-5 hover:bg-dark hover:text-white transition duration-500" data-js="deleteAllProductsBtn">刪除所有品項</button>
      </td>
      <td class="py-5"></td>
      <td class="py-5"></td>
      <td class="py-5">總金額</td>
      <td class="py-5 text-3xl">NT$${finalTotal}</td>
    </tr>
    `;
  cartList.innerHTML = str;
};

function productFilter(e) {
  let category = e.target.value;
  let filteredAry = [];
  if (category === '全部') {
    renderProductList(productsData);
  } else {
    productsData.forEach(function (item) {
      if (item.category == category) {
        filteredAry.push(item);
      };
    });
    renderProductList(filteredAry);
  };
};

function addCart(e) {
  if (e.target.nodeName !== 'BUTTON') { return };
  let id = e.target.dataset.id;
  let obj = {
    "data": {
      "productId": id,
      "quantity": 1
    }
  };
  axios.post(`${baseUrl}/${carts_path}`, obj).then(function (res) {
    getCartListData();
  }).catch(function (err) {
    let errData = err.response.data;
    if (errData.status === false) {
      console.log(err.response.data.message);
    }
  });
};

function deleteCartProduct(e) {
  if (e.target.dataset.js !== 'deleteProductBtn' && e.target.dataset.js !== 'deleteAllProductsBtn') {
    return;
  } else if (e.target.dataset.js === 'deleteAllProductsBtn') {
    axios.delete(`${baseUrl}/${carts_path}`).then(function (res) {
      getCartListData();
    }).catch(function (err) {
      let errData = err.response.data;
      if (errData.status === false) {
        console.log(err.response.data.message);
      }
    })
  } else {
    let id = e.target.dataset.id;
    axios.delete(`${baseUrl}/${carts_path}/${id}`).then(function (res) {
      getCartListData();
    }).catch(function (err) {
      let errData = err.response.data;
      if (errData.status === false) {
        console.log(err.response.data.message);
      }
    });
  };
};

function sendOrderInfo() {
  let spanAry = document.querySelectorAll(`span[data-msg]`);

  spanAry.forEach(function (el) {
    el.setAttribute('class', 'invisible text-danger')
  });

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
        message: '^聯絡電話格式不正確'
      },
      length: {
        minimum: 9,
        message: '^聯絡電話格式不正確'
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

  let errors = validate(form, constraints);
  if (errors) {
    let keys = Object.keys(errors);
    keys.forEach(function (key) {
      let el = document.querySelector(`[data-msg=${key}]`);
      el.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${errors[key][0]}`;
      el.classList.toggle('invisible');
    });
  } else {
    let obj = {
      "data": {
        "user": {
          "name": document.querySelector('#customerName').value.trim(),
          "tel": document.querySelector('#customerTel').value.trim(),
          "email": document.querySelector('#customerEmail').value.trim(),
          "address": document.querySelector('#customerAdd').value.trim(),
          "payment": document.querySelector('#paymentMethod').value.trim()
        }
      }
    };

    axios.post(`${baseUrl}/${customOrder_path}`, obj).then(function (res) {
      console.log(res);
    }).catch(function (err) {
      let errData = err.response.data;
      if (errData.status === false) {
        console.log(err.response.data.message);
      }
    })
  };
};



