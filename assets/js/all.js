"use strict";

// 產品頁面
// API
var api_path = 'calon';
var baseUrl = 'https://livejs-api.hexschool.io';
var product_path = "api/livejs/v1/customer/".concat(api_path, "/products");
var carts_path = "api/livejs/v1/customer/".concat(api_path, "/carts");
var customOrder_path = "api/livejs/v1/customer/".concat(api_path, "/orders"); // DOM

var categorySelector = document.querySelector('[name="categorySelector"]');
var productList = document.querySelector('ul[data-js="productList"]');
var cartList = document.querySelector('.cartList');
var sendOrderInfoBtn = document.querySelector('[data-js="sendOrderInfoBtn"'); // data

var productsData;
var cartsData; // event

categorySelector.addEventListener('change', productFilter);
productList.addEventListener('click', addCart);
cartList.addEventListener('click', deleteCartProduct);
sendOrderInfoBtn.addEventListener('click', sendOrderInfo);
cartList.addEventListener('change', changeQuantity);
init();

function init() {
  getProductsData();
}

;

function getProductsData() {
  axios.get("".concat(baseUrl, "/").concat(product_path)).then(function (res) {
    productsData = res.data.products;
    renderCategorySelector();
    getCartListData(); // 先跑購物車資料 後面渲染 productList 需要購物車資料
  })["catch"](function (err) {
    var errData = err.response.data;

    if (errData.status === false) {
      console.log(err.response.data.message);
    }

    ;
  }).then(function () {
    var loadingAnimation = document.querySelector('.productList-loading');
    loadingAnimation.setAttribute('data-loading', false);
  });
}

;

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
    var check = cartsData.carts.some(function (product) {
      return product.product.id == item.id;
    });
    var price = item.price.toLocaleString();
    var originPrice = item.origin_price.toLocaleString();
    listStr += "\n      <li>\n        <div class=\"bg-cover bg-center h-75 relative\" style=\"background-image: url('".concat(item.images, "');\">\n          <div class=\"absolute top-3 -right-1 bg-dark text-white py-2 px-6\">\u65B0\u54C1</div>\n        </div>\n        <button class=\"py-3 mb-2 ").concat(check ? 'bg-primary' : 'bg-dark', " ").concat(check ? '' : 'hover:bg-secondary', " text-white text-lg w-full\n        transition duration-500 ").concat(check ? 'cursor-default' : '', "\" data-js=\"addCartBtn\" data-id=\"").concat(item.id, "\" ").concat(check ? 'disabled' : '', ">\n          ").concat(check ? '已加入購物車' : '加入購物車', "\n        </button>\n        <div class=\"text-lg\">\n          <h5>").concat(item.title, "</h5>\n          <p class=\"line-through\">NT$").concat(originPrice, "</p>\n          <p class=\"text-3xl\">NT$").concat(price, "</p>\n        </div>\n      </li>\n    ");
  });
  productList.innerHTML = listStr;
}

;

function getCartListData() {
  axios.get("".concat(baseUrl, "/").concat(carts_path)).then(function (res) {
    cartsData = res.data;
    productFilter();
    var cartMsg = document.querySelector('p[data-js="cartMsg"]');
    var cartTable = document.querySelector('table[data-js="cartMsg"]');

    if (cartsData.carts.length === 0) {
      cartMsg.setAttribute('data-cartMsg', true);
      cartTable.setAttribute('data-cartMsg', false);
    } else {
      cartMsg.setAttribute('data-cartMsg', false);
      cartTable.setAttribute('data-cartMsg', true);
      renderCartList();
    }
  })["catch"](function (err) {
    var errData = err.response.data;

    if (errData.status === false) {
      console.log(err.response.data.message);
    }
  }).then(function () {
    var loadingAnimation = document.querySelector('.cart-loading');
    loadingAnimation.setAttribute('data-loading', false);
  });
}

;

function renderCartList() {
  var str = '';
  cartsData.carts.forEach(function (item) {
    var price = item.product.price.toLocaleString();
    var totalPrice = (item.product.price * item.quantity).toLocaleString();
    str += "\n    <tr class=\"border-b border-gray-300\">\n      <td class=\"flex items-center py-5\">\n        <img class=\"w-20 h-20 object-cover mr-4\" src=\"".concat(item.product.images, "\" alt=\"\u7522\u54C1\u5716\u7247\">\n        <h5>").concat(item.product.title, "</h5>\n      </td>\n      <td class=\"py-5\">NT$").concat(price, "</td>\n      <td class=\"py-5\">\n        <input class=\"w-12 border border-gray-300 rounded px-2 text-center\" data-id=\"").concat(item.id, "\" data-js=\"quantityInput\" type=\"text\" value=\"").concat(item.quantity, "\">\n      </td>\n      <td class=\"py-5\">NT$").concat(totalPrice, "</td>\n      <td class=\"text-center py-5\">\n        <button class=\"material-icons hover:text-danger transition duration-500 p-2\" href=\"#\" data-js=\"deleteProductBtn\" data-id=\"").concat(item.id, "\">close</button>\n      </td>\n    </tr>\n    ");
  });
  var finalTotal = cartsData.finalTotal.toLocaleString();
  str += "\n    <tr>\n      <td class=\"py-5\">\n        <button class=\"border rounded py-2 px-5 hover:bg-dark hover:text-white transition duration-500\" data-js=\"deleteAllProductsBtn\">\u522A\u9664\u6240\u6709\u54C1\u9805</button>\n      </td>\n      <td class=\"py-5\"></td>\n      <td class=\"py-5\"></td>\n      <td class=\"py-5\">\u7E3D\u91D1\u984D</td>\n      <td class=\"py-5 text-3xl\">NT$".concat(finalTotal, "</td>\n    </tr>\n    ");
  cartList.innerHTML = str;
}

;

function productFilter() {
  var category = categorySelector.value;

  if (category === '全部') {
    renderProductList(productsData);
  } else {
    var filteredAry = productsData.filter(function (item) {
      return item.category == category;
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
  var btnProp = e.target.dataset.js;
  var id = e.target.dataset.id;
  var obj = {
    "data": {
      "productId": id,
      "quantity": 1
    }
  };
  axios.post("".concat(baseUrl, "/").concat(carts_path), obj).then(function (res) {
    getCartListData();
    productFilter(); // 不呼叫 renderProductList() 避免已篩選渲染的 product list 出錯

    popUpSuccessMsg(btnProp);
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
    // 刪除購物車全部商品
    var popUp = document.querySelector('[data-js="doubleCheckpopUp"]');
    popUp.setAttribute('data-popUp', true);
    popUp.addEventListener('click', function (e) {
      var btnProp = e.target.getAttribute('data-dblCheckBtn'); // double check

      if (btnProp === 'cancel' || Object.is(popUp, e.target)) {
        // 按取消或非訊息視窗時隱藏 double check div
        popUp.setAttribute('data-popUp', false);
      } else if (btnProp === 'delete') {
        axios["delete"]("".concat(baseUrl, "/").concat(carts_path)).then(function (res) {
          getCartListData();
        })["catch"](function (err) {
          var errData = err.response.data;

          if (errData.status === false) {
            console.log(err.response.data.message);
          }

          ;
        }).then(function () {
          popUp.setAttribute('data-popUp', false);
        });
      }

      ;
    });
  } else {
    // 刪除購物車單一商品
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

function sendOrderInfo(e) {
  // 錯誤訊息初始化
  var spanAry = document.querySelectorAll("span[data-msg]");
  spanAry.forEach(function (el) {
    el.setAttribute('class', 'invisible text-danger');
  }); // 表單驗證

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
  var errors = validate(form, constraints); // 錯誤回傳 object  正確回傳 undefined

  if (errors) {
    var keys = Object.keys(errors);
    keys.forEach(function (key) {
      var el = document.querySelector("[data-msg=".concat(key, "]"));
      el.innerHTML = "<i class=\"fas fa-exclamation-circle mr-1\"></i>".concat(errors[key][0]);
      el.classList.toggle('invisible');
    });
  } else {
    var nameValue = document.querySelector('#customerName').value;
    var telValue = document.querySelector('#customerTel').value;
    var emailValue = document.querySelector('#customerEmail').value;
    var addressValue = document.querySelector('#customerAdd').value;
    var paymentValue = document.querySelector('#paymentMethod').value;
    var obj = {
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
    var btnProp = e.target.dataset.js;
    axios.post("".concat(baseUrl, "/").concat(customOrder_path), obj).then(function (res) {
      getCartListData();
      popUpSuccessMsg(btnProp);
      var orderInputs = document.querySelectorAll('[data-js="orderInput"]');
      orderInputs.forEach(function (item) {
        item.value = '';
      });
    })["catch"](function (err) {
      var errData = err.response.data;

      if (errData.status === false) {
        console.log(err.response.data.message);
        popUpSuccessMsg(btnProp);
      }

      ;
    });
  }

  ;
}

;

function changeQuantity(e) {
  var value = e.target.value;
  var id = e.target.dataset.id;
  var product = cartsData.carts.filter(function (item) {
    return item.id == id;
  });
  var quantityNotChanged = product[0].quantity == value; // 判斷數量有沒有改變
  // 最後一個判斷條件 不可以帶有小數點

  if (e.target.dataset.js !== 'quantityInput' || isNaN(value) || quantityNotChanged || value - Math.round(value) !== 0) {
    return;
  }

  ;
  var obj = {
    "data": {
      "id": id,
      "quantity": Number(value)
    }
  };
  axios.patch("".concat(baseUrl, "/").concat(carts_path), obj).then(function (res) {
    getCartListData();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (errData.status === false) {
      console.log(err.response.data.message);
    }

    ;
  });
}

; // 加入購物車、訂單資料成功送出提示視窗

function popUpSuccessMsg(btnProp) {
  var popUpMsg = document.querySelector('[data-js="popUpMsg"]');

  if (btnProp === 'sendOrderInfoBtn') {
    if (cartsData.carts.length === 0) {
      popUpMsg.innerHTML = "<i class=\"fas fa-times-circle fa-4x text-danger mb-4\"></i> <p class=\"text-2xl\">\u8CFC\u7269\u8ECA\u5167\u6C92\u6709\u6771\u897F</p>";
    } else {
      popUpMsg.innerHTML = "<i class=\"fas fa-check-circle fa-4x text-success mb-4\"></i> <p class=\"text-2xl\">\u8A02\u55AE\u6210\u529F\u9001\u51FA</p>";
    }

    ;
  } else if (btnProp === 'addCartBtn') {
    popUpMsg.innerHTML = "<i class=\"fas fa-check-circle fa-4x text-success mb-4\"></i> <p class=\"text-2xl\">\u6210\u529F\u52A0\u5165\u8CFC\u7269\u8ECA</p>";
  }

  ;
  var popUp = document.querySelector('[data-js="popUpBlock"]');
  var styleOpacity = parseFloat(popUp.style.opacity);
  popUp.setAttribute('data-popUp', true);
  var fadeInBlock = window.setInterval(function () {
    // div 逐漸浮出
    if (styleOpacity < 10) {
      styleOpacity += 0.5;
      popUp.style.opacity = styleOpacity;
    } else {
      window.clearInterval(fadeInBlock); // 停止浮出
      // div 逐漸消失

      var fadeOutBlock = window.setInterval(function () {
        if (styleOpacity > 0) {
          styleOpacity -= 0.5;
          popUp.style.opacity = styleOpacity;
        } else {
          popUp.setAttribute('data-popUp', false);
          window.clearInterval(fadeOutBlock);
        }

        ;
      }, 50);
    }

    ;
  }, 30);
}

;
//# sourceMappingURL=all.js.map
