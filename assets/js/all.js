"use strict";

// 產品頁面
// API
var api_path = 'calon';
var baseUrl = 'https://livejs-api.hexschool.io';
var product_path = "api/livejs/v1/customer/".concat(api_path, "/products");
var carts_path = "api/livejs/v1/customer/".concat(api_path, "/carts");
var customOrder_path = "api/livejs/v1/customer/".concat(api_path, "/orders"); // DOM

var categorySelector = document.querySelector('[name="categorySelector"]');
var productList = document.querySelector('.productList');
var cartList = document.querySelector('.cartList');
var sendOrderInfoBtn = document.querySelector('[data-js="sendOrderInfoBtn"'); // data

var productsData;
var cartsData; // event

categorySelector.addEventListener('change', productFilter);
productList.addEventListener('click', addCart);
cartList.addEventListener('click', deleteCartProduct);
sendOrderInfoBtn.addEventListener('click', sendOrderInfo);
init();

function init() {
  getProductsData();
  getCartListData();
}

;

function getProductsData() {
  axios.get("".concat(baseUrl, "/").concat(product_path)).then(function (res) {
    productsData = res.data.products;
    renderProductList(productsData);
    renderCategorySelector();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (errData.status === false) {
      console.log(err.response.data.message);
    }
  });
}

function renderCategorySelector() {
  var categoryAry = [];
  productsData.forEach(function (item) {
    categoryAry.push(item.category);
  });
  categoryAry = categoryAry.filter(function (item, index, ary) {
    return ary.indexOf(item) == index;
  });
  var optionStr = '<option value="全部" selected>全部</option>';
  categoryAry.forEach(function (item) {
    optionStr += "<option value=\"".concat(item, "\">").concat(item, "</option>");
  });
  categorySelector.innerHTML = optionStr;
}

;

function renderProductList(data) {
  var listStr = '';
  data.forEach(function (item) {
    var price = item.price.toLocaleString();
    var originPrice = item.origin_price.toLocaleString();
    listStr += "\n      <li>\n        <div class=\"bg-cover h-75 relative\" style=\"background: url('".concat(item.images, "');\">\n          <div class=\"absolute top-3 -right-1 bg-dark text-white py-2 px-6\">\u65B0\u54C1</div>\n        </div>\n        <button class=\"py-3 mb-2 bg-dark hover:bg-secondary text-white text-lg w-full transition duration-500\" data-id=\"").concat(item.id, "\">\u52A0\u5165\u8CFC\u7269\u8ECA</button>\n        <div class=\"text-lg\">\n          <h5>").concat(item.title, "</h5>\n          <p class=\"line-through\">NT$").concat(originPrice, "</p>\n          <p class=\"text-3xl\">NT$").concat(price, "</p>\n        </div>\n      </li>\n    ");
  });
  productList.innerHTML = listStr;
}

;

function getCartListData() {
  axios.get("".concat(baseUrl, "/").concat(carts_path)).then(function (res) {
    cartsData = res.data;
    renderCartList();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (errData.status === false) {
      console.log(err.response.data.message);
    }

    ;
  });
}

;

function renderCartList() {
  var str = '';
  cartsData.carts.forEach(function (item) {
    var price = item.product.price.toLocaleString();
    var totalPrice = (item.product.price * item.quantity).toLocaleString();
    str += "\n    <tr class=\"border-b border-gray-300\">\n    <td class=\"flex items-center py-5\">\n    <img class=\"w-20 h-20 object-cover mr-4\" src=\"".concat(item.product.images, "\" alt=\"\u7522\u54C1\u5716\u7247\">\n    <h5>").concat(item.product.title, "</h5>\n    </td>\n    <td class=\"py-5\">NT$").concat(price, "</td>\n    <td class=\"py-5\">\n    <input class=\"w-12 border border-gray-300 rounded px-2 text-center\" data-js=\"quantityInput\" type=\"text\" value=\"").concat(item.quantity, "\">\n    </td>\n    <td class=\"py-5\">NT$").concat(totalPrice, "</td>\n    <td class=\"text-center py-5\">\n    <button class=\"material-icons hover:text-danger transition duration-500 p-2\" href=\"#\" data-js=\"deleteProductBtn\" data-id=\"").concat(item.id, "\">close</button>\n    </td>\n    </tr>\n    ");
  });
  var finalTotal = cartsData.finalTotal.toLocaleString();
  str += "\n    <tr>\n      <td class=\"py-5\">\n        <button class=\"border rounded py-2 px-5 hover:bg-dark hover:text-white transition duration-500\" data-js=\"deleteAllProductsBtn\">\u522A\u9664\u6240\u6709\u54C1\u9805</button>\n      </td>\n      <td class=\"py-5\"></td>\n      <td class=\"py-5\"></td>\n      <td class=\"py-5\">\u7E3D\u91D1\u984D</td>\n      <td class=\"py-5 text-3xl\">NT$".concat(finalTotal, "</td>\n    </tr>\n    ");
  cartList.innerHTML = str;
}

;

function productFilter(e) {
  var category = e.target.value;
  var filteredAry = [];

  if (category === '全部') {
    renderProductList(productsData);
  } else {
    productsData.forEach(function (item) {
      if (item.category == category) {
        filteredAry.push(item);
      }

      ;
    });
    renderProductList(filteredAry);
  }

  ;
}

;

function addCart(e) {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }

  ;
  var id = e.target.dataset.id;
  var obj = {
    "data": {
      "productId": id,
      "quantity": 1
    }
  };
  axios.post("".concat(baseUrl, "/").concat(carts_path), obj).then(function (res) {
    getCartListData();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (errData.status === false) {
      console.log(err.response.data.message);
    }
  });
}

;

function deleteCartProduct(e) {
  if (e.target.dataset.js !== 'deleteProductBtn' && e.target.dataset.js !== 'deleteAllProductsBtn') {
    return;
  } else if (e.target.dataset.js === 'deleteAllProductsBtn') {
    axios["delete"]("".concat(baseUrl, "/").concat(carts_path)).then(function (res) {
      getCartListData();
    })["catch"](function (err) {
      var errData = err.response.data;

      if (errData.status === false) {
        console.log(err.response.data.message);
      }
    });
  } else {
    var id = e.target.dataset.id;
    axios["delete"]("".concat(baseUrl, "/").concat(carts_path, "/").concat(id)).then(function (res) {
      getCartListData();
    })["catch"](function (err) {
      var errData = err.response.data;

      if (errData.status === false) {
        console.log(err.response.data.message);
      }
    });
  }

  ;
}

;

function sendOrderInfo() {
  var spanAry = document.querySelectorAll("span[data-msg]");
  spanAry.forEach(function (el) {
    el.setAttribute('class', 'invisible text-danger');
  });
  var form = document.querySelector('[data-js="orderForm"]');
  var constraints = {
    customerName: {
      presence: {
        message: '^請輸入您的姓名'
      }
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
  var errors = validate(form, constraints);

  if (errors) {
    var keys = Object.keys(errors);
    keys.forEach(function (key) {
      var el = document.querySelector("[data-msg=".concat(key, "]"));
      el.innerHTML = "<i class=\"fas fa-exclamation-circle mr-1\"></i>".concat(errors[key][0]);
      el.classList.toggle('invisible');
    });
  } else {
    var obj = {
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
    axios.post("".concat(baseUrl, "/").concat(customOrder_path), obj).then(function (res) {
      console.log(res);
    })["catch"](function (err) {
      var errData = err.response.data;

      if (errData.status === false) {
        console.log(err.response.data.message);
      }
    });
  }

  ;
}

;
//# sourceMappingURL=all.js.map
