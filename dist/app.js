//////////////////////////////////////////////////////////////////////////
// BUDGET CONTROLLER
//////////////////////////////////////////////////////////////////////////
var budgetController = (function () {
  let Expenses = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expenses.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expenses.prototype.getPercentage = function () {
    return this.percentage;
  };

  let Incomes = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach((element) => (sum += element.value));
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, description, value) {
      let ID, newItem;
      // Generate ID: 1, 2, 3, 4
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Generate object
      if (type === 'exp') {
        newItem = new Expenses(ID, description, value);
      } else if (type === 'inc') {
        newItem = new Incomes(ID, description, value);
      }
      // Push into our data structure
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, ID) {
      // [1 2 4 6]
      let IDArray, index;
      // Creating array of ids
      IDArray = data.allItems[type].map((element) => element.id);
      // Getting index of deleted item
      index = IDArray.indexOf(ID);
      // Deleting
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    test: function () {
      console.log(data.allItems);
    },

    calculateBudget: function () {
      // Calculate totals of income and expanses
      calculateTotal('inc');
      calculateTotal('exp');

      // Calculate total budget
      data.budget = data.totals['inc'] - data.totals['exp'];

      // Calculate the percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      let allPerc = data.allItems.exp.map((current) => current.getPercentage());
      return allPerc;
    },
    getBudget: function () {
      return {
        exp: data.totals.exp,
        inc: data.totals.inc,
        budget: data.budget,
        percentage: data.percentage,
      };
    },
  };
})();

//////////////////////////////////////////////////////////////////////////
// UI CONTROLLER
//////////////////////////////////////////////////////////////////////////

var UIController = (function () {
  // DOM STRINGS LIST
  let DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    budgetTitle: '.budget__title--month',
  };

  var formatNumber = function (num, type) {
    let numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3);
    }

    return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    displayMonth: function () {
      let date, month, year, monthList;
      date = new Date();

      year = date.getFullYear();
      monthList = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      month = monthList[date.getMonth()];

      document.querySelector(DOMStrings.budgetTitle).textContent =
        month + ' ' + year;
    },

    getDomStrings: function () {
      return DOMStrings;
    },
    addListItem: function (obj, type) {
      let html, newHtml, element;

      if (type === 'inc') {
        element = document.querySelector(DOMStrings.incomeContainer);

        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = document.querySelector(DOMStrings.expensesContainer);

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      newHtml = newHtml.replace('%id%', obj.id);
      // Insert the HTML into the DOM
      element.insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (id) {
      let elem = document.getElementById(id);

      elem.parentNode.removeChild(elem);
    },

    clearFields: function () {
      let clearInput = document.querySelectorAll(
        DOMStrings.inputDescription + ', ' + DOMStrings.inputValue
      );

      clearInputArr = Array.from(clearInput);
      clearInputArr.forEach((element) => {
        element.value = '';
        document.querySelector(DOMStrings.inputDescription).focus();
      });
    },
    updateUI: function (obj) {
      let type;
      obj.budget >= 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.inc,
        'inc'
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.exp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    },
    displayPercentages: function (percentages) {
      let fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      let nodeListForEach = function (arr, callback) {
        for (let i = 0; i < arr.length; i++) {
          callback(arr[i], i);
        }
      };

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    changeType: function () {
      let inputs = document.querySelectorAll(
        DOMStrings.inputType +
          ',' +
          DOMStrings.inputDescription +
          ',' +
          DOMStrings.inputValue
      );
      inputs.forEach((elem) => elem.classList.toggle('red-focus'));
      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },
  };
})();

//////////////////////////////////////////////////////////////////////////
// GLOBAL APP CONTROLLER
//////////////////////////////////////////////////////////////////////////

var controller = (function (budgetCtrl, UICtrl) {
  var setUpEventListeners = function () {
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changeType);
  };

  let updateBudget = function () {
    // 1. Calculate the Budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    let budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    UICtrl.updateUI(budget);
  };

  let updatePercentage = function () {
    // 1. Calculate Percentage
    budgetCtrl.calculatePercentage();
    // 2. Return percentages
    let percentages = budgetCtrl.getPercentages();
    // 3. Update the UI
    UICtrl.displayPercentages(percentages);
  };

  var ctrlDeleteItem = function (event) {
    let itemID, splitID, ID, type;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseFloat(splitID[1]);
      // Delete the item from the Data structure
      budgetCtrl.deleteItem(type, ID);
      // Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // Update the budget
      updateBudget();

      // update percentage
      updatePercentage();
    }
  };

  let DOM = UICtrl.getDomStrings();
  var ctrlAddItem = function () {
    let newItem;
    // 1. Get the field input data
    let input = UICtrl.getInput();
    if (input.description !== '' && input.value > 0 && !isNaN(input.value)) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4. Clear fields
      UICtrl.clearFields();
      // 5. Calculate the budget
      updateBudget();
      // Update percentage
      updatePercentage();
      return newItem;
    }
  };

  return {
    init: function () {
      setUpEventListeners();
      UICtrl.updateUI({
        exp: 0,
        inc: 0,
        budget: 0,
        percentage: 0,
      });
      UICtrl.displayMonth();
    },
  };
})(budgetController, UIController);

controller.init();
