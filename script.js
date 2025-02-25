const itemForm = document.getElementById('item-form')
const itemInput = document.getElementById('item-input')
const itemList = document.getElementById('item-list')
const clearBtn = document.getElementById('item-clear')
const itemFilter = document.getElementById('filter')
const formBtn = itemForm.querySelector('button')
let isEditMode = false

function displayItems() {
    const itemsFromStorage = getItemsFromStorage();
    itemsFromStorage.forEach(item => addItemDOM(item))
    checkUI();
}

function onAddItemSubmit(e) {
    const newItem = itemInput.value;
    e.preventDefault()
    if (newItem === '') {
        alert('Please add an item')
        return
    }
    if (isEditMode) {
        const itemToEdit = itemList.querySelector('.edit-mode')
        removeItemFromStorage(itemToEdit.textContent)
        itemToEdit.classList.remove('edit-mode')
        itemToEdit.remove()
        isEditMode = false
    } else {
        if (checkIfItemExistis(newItem)) {
            alert('That item already exists')
            return
        }
    }
    addItemDOM(newItem);
    addItemToStorage(newItem)
    checkUI();
    itemInput.value = '';
}

function addItemDOM(item) {
    const li = document.createElement('li')
    li.appendChild(document.createTextNode(item))
    const button = createButton('remove-item btn-link text-red')
    console.log(button);
    console.log(li);
    li.appendChild(button);
    itemList.appendChild(li);
}

function createButton(classes) {
    const button = document.createElement('button')
    button.className = classes;
    const icon = createIcon('fa-solid fa-xmark');
    button.appendChild(icon)
    return button;
}

function createIcon(classes) {
    const icon = document.createElement('i')
    icon.className = classes
    return icon
}

function addItemToStorage(item) {
    const itemsFromStorage = getItemsFromStorage();
    itemsFromStorage.push(item)
    localStorage.setItem('items', JSON.stringify(itemsFromStorage))
}

function getItemsFromStorage() {
    let itemsFromStorage;
    if (localStorage.getItem('items') === null) {
        itemsFromStorage = []
    } else {
        itemsFromStorage = JSON.parse(localStorage.getItem('items'))
    }
    return itemsFromStorage
}

function onClickItem(e) {
    if (e.target.parentElement.classList.contains('remove-item')) {
        removeItem(e.target.parentElement.parentElement)
    } else {
        setItemToEdit(e.target)
    }
}

function checkIfItemExistis(item) {
    const itemsFromStorage = getItemsFromStorage()
    return itemsFromStorage.includes(item);
}

function setItemToEdit(item) {
    isEditMode = true;
    itemList.querySelectorAll('li').forEach(i => i.classList.remove('edit-mode'))
    item.classList.add('edit-mode')
    formBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Update Item'
    formBtn.style.backgroundColor = '#228b22'
    itemInput.value = item.textContent
}

function removeItem(item) {
    if (confirm('Are you sure?')) {
        item.remove();
        removeItemFromStorage(item.textContent);
        checkUI();
    }
}

function removeItemFromStorage(item) {
    let itemsFromStorage = getItemsFromStorage()
    console.log(itemsFromStorage);
    itemsFromStorage = itemsFromStorage.filter((i) => i !== item)
    localStorage.setItem('items', JSON.stringify(itemsFromStorage))
}

function clearItems() {
    console.log('Clear All clicado');

    while (itemList.firstChild) {
        itemList.removeChild(itemList.firstChild)
    }
    localStorage.removeItem('items')
    checkUI();
}

function filterItems(e) {
    const text = e.target.value.toLowerCase();
    const items = itemList.querySelectorAll('li')
    items.forEach((item) => {
        const itemName = item.firstChild.textContent.toLowerCase()
        if (itemName.indexOf(text) != -1) {

            item.style.display = 'flex'
        } else {

            item.style.display = 'none'
        }
    })
}

function checkUI() {
    itemInput.value = '';
    const items = itemList.querySelectorAll('li')
    console.log(items);
    if (items.length === 0) {
        clearBtn.style.display = 'none'
        itemFilter.style.display = 'none'
    } else {
        clearBtn.style.display = 'block'
        itemFilter.style.display = 'block'
    }
    formBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item'
    formBtn.style.backgroundColor = '#333'
    isEditMode = false
}

function init() {
    itemForm.addEventListener('submit', onAddItemSubmit)
    itemList.addEventListener('click', onClickItem)
    clearBtn.addEventListener('click', clearItems)
    itemFilter.addEventListener('input', filterItems)
    document.addEventListener('DOMContentLoaded', displayItems)
    checkUI();
}

init(); 
