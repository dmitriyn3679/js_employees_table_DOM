'use strict';

const root = document.querySelector('body');
const table = document.querySelector('table');
const tHead = document.querySelector('thead > tr');
const tBody = document.querySelector('tbody');
const tdList = root.querySelectorAll('td');

// When I want edit my table cell, my input have own width, and table stretches.
// Here I set fixed width for my cells,
// and in css 100% relative width for my input.
tdList.forEach(td => {
  td.style.width = `${parseFloat(getComputedStyle(td).width)}px`;
});

// sort table;
const getNumber = num => {
  return num.replace(/[\D]+/g, '');
};

const getColumnID = el => {
  for (let i = 0; i < tHead.cells.length; i++) {
    if (tHead.cells[i] === el) {
      return i;
    }
  }
};

const parseTable = columnID => {
  const data = [];

  for (const row of tBody.children) {
    data.push(row.cells[columnID].textContent);
  }

  return data;
};

const sortData = (data, sortType) => {
  const arrEl = getNumber(data[0]);

  const callBacks = {
    'ASC': {
      forString: (a, b) => a.localeCompare(b),
      forNum: (a, b) => getNumber(a) - getNumber(b),
    },
    'DESC': {
      forString: (a, b) => b.localeCompare(a),
      forNum: (a, b) => getNumber(b) - getNumber(a),
    },
  };

  if (arrEl !== '') {
    return data.sort(callBacks[sortType].forNum);
  }

  return data.sort(callBacks[sortType].forString);
};

const replaceColumn = (columnID, data) => {
  for (let i = 0; i < tBody.children.length; i++) {
    const row = tBody.children[i];

    row.cells[columnID].textContent = data[i];
  }
};

tHead.addEventListener('click', e => {
  const sortType = e.target.dataset.sort;
  const columnID = getColumnID(e.target);
  const data = parseTable(columnID);

  switch (sortType) {
    case undefined:
      e.target.dataset.sort = 'ASC';
      break;

    case 'ASC':
      e.target.dataset.sort = 'DESC';
      break;

    case 'DESC':
      e.target.dataset.sort = 'ASC';
      break;
  }

  sortData(data, e.target.dataset.sort);
  replaceColumn(columnID, data);
});

// select row;

tBody.addEventListener('click', e => {
  if (e.target.parentNode.tagName !== 'TR') {
    return;
  }

  const selected = tBody.querySelector('.active');

  if (selected) {
    selected.classList.remove('active');
  }
  e.target.parentNode.classList.add('active');
});

// form;

const formEl = `
  <form class="new-employee-form">
    <label>
      Name: 
    <input 
      data-qa="name" 
      name="name" 
      type="text" 
      required
    >
    </label>
    <label>
      Position:
      <input
        data-qa="position" 
        name="position" 
        type="text"
      >
    </label>
    <label>
      Office:
      <select data-qa="office" name="office">
        <option value="Tokyo">Tokyo</option>
        <option value="Singapore">Singapore</option>
        <option value="Singapore">Singapore</option>
        <option value="London">London</option>
        <option value="New York">New York</option>
        <option value="Edinburgh">Edinburgh</option>
        <option value="San Francisco">San Francisco</option>
    </select>
    </label>
    <label>
      Age:
      <input
        data-qa="age" 
        name="age" 
        type="number"
      >
    </label>
    <label>
      Salary: 
      <input 
        data-qa="salary" 
        name="salary" 
        type="number"
      >
    </label>
    <button>Save to table</button>
  </form>
`;

const formValidator = (data) => {
  const nameLength = data.name.length;
  const age = data.age;

  return nameLength > 4 && (age >= 18 && age <= 90);
};

const addNotification = type => {
  let notification;

  switch (type) {
    case 'success':
      notification = `<div 
                data-qa="notification" 
                class="notification ${type}"
              >
                <p class="title">
                  The employee was successfully added. 
                </p>
              </div>
             `;
      break;
    case 'error':
      notification = `<div 
                data-qa="notification" 
                class="notification ${type}"
              >
                <p class="title">
                  Invalid data.
                  Сheck the following:
                  * Name value has not less than 4 letters
                  * Age is not less than 18 or more than 90
                </p>
              </div>
             `;
      break;
  }
  root.insertAdjacentHTML('afterbegin', notification);

  setTimeout(() => {
    const message = root.querySelector('.notification');

    message.remove();
  }, 3000);
};

const makeSalaryValue = num => {
  const correctNum = num.toFixed(3);

  return `$${correctNum.toString().replace('.', ',')}`;
};

table.insertAdjacentHTML('afterend', formEl);

const form = document.querySelector('form');

form.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(form);
  const tableData = Object.fromEntries(formData.entries());

  if (!formValidator(tableData)) {
    addNotification('error');

    return;
  }

  const newRow = `
    <tr>
      ${Object.keys(tableData).map(key => {
    if (key === 'salary') {
      return `<td>${makeSalaryValue(+tableData[key])}</td>`;
    }

    return `<td>${tableData[key]}</td>`;
  }).join('')}
    </tr>
  `;

  tBody.insertAdjacentHTML('beforeend', newRow);
  addNotification('success');
  form.reset();
});

// editing of table cells;

tBody.addEventListener('dblclick', bodyEvent => {
  const initialValue = bodyEvent.target.textContent;

  bodyEvent.target.innerHTML = `<input
                                  type="text" 
                                  class="cell-input" 
                                  value="${initialValue}"
                                  >`;

  const inputCell = tBody.querySelector('.cell-input');

  inputCell.selectionStart = inputCell.value.length;
  inputCell.focus();

  inputCell.addEventListener('blur', inputMouseEvent => {
    const inputText = inputMouseEvent.target.value || initialValue;

    inputMouseEvent.target.outerHTML = `<td>${inputText}</td>`;
  });

  inputCell.addEventListener('keydown', inputKeyEvent => {
    if (inputKeyEvent.key !== 'Enter') {
      return;
    }

    const inputText = inputKeyEvent.target.value || initialValue;

    inputKeyEvent.target.outerHTML = `<td>${inputText}</td>`;
  });
});
