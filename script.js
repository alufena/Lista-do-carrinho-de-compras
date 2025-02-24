// Shopping List Item Manager. Implementa funcionalidade de adicionar itens dinamicamente a uma lista; com validação, feedback visual e limpeza

// Seleção de elementos DOM via ID. getElementById é mais performático que querySelector quando IDs estão disponíveis
const itemForm = document.getElementById('item-form') // poderia ter usado query selector, mas todos os elementos do html possuem id
const itemInput = document.getElementById('item-input')
const itemList = document.getElementById('item-list')
const clearBtn = document.getElementById('item-clear')
const itemFilter = document.getElementById('filter')
// const items = itemList.querySelectorAll('li') // pego através da itemList mais acima ('ul') e pego todos itens com querySelectorAll que usa nodelist, que funciona como um array e que aceita propriedade length
const formBtn = itemForm.querySelector('button') // Seleciona o botão dentro do formulário (`itemForm`) e armazena a referência em `formBtn`.
let isEditMode = false // let porque quer redefinir. Variável booleana que indica se estamos no modo de edição ou não.  

function displayItems() {
    const itemsFromStorage = getItemsFromStorage(); // Obtém os itens armazenados no Local Storage chamando a função reutilizável `getItemsFromStorage()`. Isso evita repetição de código e melhora a organização.
    itemsFromStorage.forEach(item => addItemDOM(item)) // Percorre o array de itens recuperados e adiciona cada um ao DOM. `forEach()` é um método de array que itera sobre cada item, chamando `addItemDOM(item)`. Essa abordagem permite que todos os itens armazenados sejam renderizados ao recarregar a página.
    checkUI(); // Sem essa verificação, a UI pode não refletir corretamente o estado da aplicação.
}

function onAddItemSubmit(e) {
    const newItem = itemInput.value; // Captura texto do input
    e.preventDefault() // um form necessariamente precisa de um prevent default no seu event object (boa prática); assim, consegue ter maior controle do que se quer fazer. preventDefault também é crítico para SPAs e manipulação DOM
    if (newItem === '') { // validação do evento. "itemInput.value" foi uma ação substituída por variável dessa condicional. Checa se input está vazio;
        alert('Please add an item') // alert aceita caixas estilizadas; Feedback visual para usuário
        return // Early return pattern
    }
    if (isEditMode) { // checagem por "edit mode". importante para evitar os itens duplicados
        const itemToEdit = itemList.querySelector('.edit-mode') // pega o item editado, remove do localStorage, remove da UI (DOM) e então adiciona o novo item. não é possível editar um item diretamente no local storage, só dá para remover o antigo e por um novo. relembrando que itemList é uma "ul". "edit-mode" precisa do ponto (.) antes do nome da classe porque, no querySelector, estamos buscando um elemento com uma classe CSS específica
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
    // console.log('Sucess'); // Confirmação de validação passada
    addItemDOM(newItem); // cria um item como elemento DOM
    addItemToStorage(newItem) // adiciona o item ao local storage
    checkUI(); // não funcionava, pois na estrutura da função que checa "items.length" tem a sua variável definida no global scope e quando a página foi iniciada, não tinham itens. para funcionar: cada vez que for adicionado um item, tem que selecioná-lo dentro da função ao invés do global scope
    itemInput.value = ''; // limpa o valor que foi escrito no input. Reset do campo input. Melhora UX para próxima entrada
}

function addItemDOM(item) {
    const li = document.createElement('li') // cria um item da lista, ou seja, Cria elemento <li> vazio
    li.appendChild(document.createTextNode(item)) // cria-se um item de lista com texto, mas ainda faltam o botão e o ícone. Adiciona texto do input como nó de texto. Mais seguro que innerHTML
    const button = createButton('remove-item btn-link text-red') // o botão, incluindo seu ícone, podem ser feitos de diversas maneiras. poderiam estar nessa função OU em funções diferentes. mas aqui está apenas o "invocamento", ou seja, Criação e anexação do botão de remoção
    console.log(button); // por enquanto, o botão e o ícone estão dentro e não fora
    console.log(li); // Visualiza estrutura do <li>
    li.appendChild(button); // Anexa botão ao <li>
    itemList.appendChild(li); // adiciona li no DOM, mas se carregar a página, sumirá. para persistir uma saída é necessario enfiar os dados em um local storage
}

function createButton(classes) {
    const button = document.createElement('button')
    button.className = classes; // Aplica classes CSS passadas
    const icon = createIcon('fa-solid fa-xmark');
    button.appendChild(icon) // Anexa ícone ao botão
    return button; // Retorna botão completo
}

function createIcon(classes) {
    const icon = document.createElement('i') // Cria elemento para ícone
    icon.className = classes // Aplica classes Font Awesome
    return icon // Retorna ícone configurado
}

function addItemToStorage(item) {
    const itemsFromStorage = getItemsFromStorage(); // Recupera o array de itens armazenados, reutilizando a função `getItemsFromStorage()`. Isso evita repetição de código que verificaria a existência da chave 'items' no Local Storage.
    itemsFromStorage.push(item) // adiciona novo item ao array. Isso mantém os itens anteriores e insere o novo ao final do array.
    localStorage.setItem('items', JSON.stringify(itemsFromStorage)) // converte para "json string" e define como local storage. JSON stringify sobrescreve os dados anteriores, mas como estamos sempre recuperando e atualizando, os itens antigos não são perdidos. Local Storage não suporta objetos nativamente, apenas strings.
}

function getItemsFromStorage() {
    let itemsFromStorage; // Declara a variável que armazenará os itens recuperados do Local Storage.
    if (localStorage.getItem('items') === null) { // checagem do array de itens no local storage
        itemsFromStorage = [] // se não há itens, a variável é definida para um array vazio
    } else {
        itemsFromStorage = JSON.parse(localStorage.getItem('items')) // se há itens no storage, adiciona-se itens para esse array. JSON parse transforma o array em string. Se não fosse usado `JSON.parse()`, a recuperação retornaria uma string, tornando impossível manipular os itens corretamente.
    }
    return itemsFromStorage // Retorna o array de itens, seja ele vazio (se não havia dados armazenados) ou preenchido (se já existiam itens). Isso permite que outras funções reutilizem essa lógica sem precisar duplicá-la.
}

function onClickItem(e) { // usado para ter certeza ao remover quando se clica no "x". essa função assume papel de "handler" o qual dependendo no que está clicando, inicia uma função separada. Dependendo do que for clicado, ela chama uma função específica (remoção ou edição).  
    if (e.target.parentElement.classList.contains('remove-item')) { // Delegação de eventos: Verifica se o elemento clicado (`e.target`) tem um pai com a classe 'remove-item'. Isso significa que o clique ocorreu em um botão de remoção (ou dentro dele, como no ícone). `classList.contains()` é usado para checar se um elemento tem uma classe específica.
        removeItem(e.target.parentElement.parentElement) // `e.target.parentElement` é o botão de remoção (<button>). `e.target.parentElement.parentElement` é o <li> que contém o botão e o texto do item. A função `removeItem()` é chamada para remover esse <li> da lista.
    } else {
        setItemToEdit(e.target) // Se o clique não foi no botão de remoção, ativa o modo de edição chamando `setItemToEdit()`.  
    }
}

function checkIfItemExistis(item) {
    const itemsFromStorage = getItemsFromStorage()
    return itemsFromStorage.includes(item); // já que retorna T ou F, pode retornar apenas essa linha. linha que substituiu todo o seguinte código: if (itemsFromStorage.includes(item)) { return true } else { return false } } // itemsFromStorage é um array
}

function setItemToEdit(item) { // Ativa o modo de edição para o item selecionado. 
    isEditMode = true; // Marca que estamos editando um item. Isso pode ser usado em outras partes do código para mudar o comportamento do formulário.  
    itemList.querySelectorAll('li').forEach(i => i.classList.remove('edit-mode')) // foca no item selecionado ter o estilo e o anterior perder tal estilo. Remove a classe 'edit-mode' de todos os itens `<li>`. Isso garante que apenas UM item esteja em modo de edição por vez.  
    item.classList.add('edit-mode') // Adiciona a classe 'edit-mode' ao item clicado, destacando-o visualmente.  
    formBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Update Item' // Muda o conteúdo do botão do formulário para indicar que agora estamos atualizando um item, e não adicionando um novo. `innerHTML` é usado aqui porque precisamos adicionar um ícone dentro do botão.  
    formBtn.style.backgroundColor = '#228b22' // Altera a cor do botão para verde para indicar visualmente que estamos no modo de edição.  
    itemInput.value = item.textContent // input é value e não text. Preenche o campo de entrada (`itemInput`) com o texto do item clicado. Usamos `.value` porque `input` armazena valores, e não `.textContent`.  
}

function removeItem(item) {
    // console.log(e.target.parentElement.classList); // dispara quando se clica na área dos itens. poderia usar também parentNode no lugar de parentElement. o botão é pai do ícone que é clicado; classList ajudou a encontrar a classe desejável e correta
    // if (e.target.parentElement.classList.contains('remove-item')) { // método contains ajuda nessa lógica if (se contém) por passar a classe do botão. contains é um método de DOMTokenList que checa existência de classe
    //e.target.remove() // esta ação removia apenas o botão; event delegation ajuda especificar melhor o que se quer remover
    // console.log('Item excluído'); // clicar no x vermelho indica que foi clicado, no restante (na UL) nada acontece
    if (confirm('Are you sure?')) { // "função confirm" é do "window object". poderia ser window.confirm no lugar da função
        item.remove(); // remove o item do DOM
        // e.target.parentElement.parentElement.remove() // e.target é o ícone <i>, o 1º parentElement é o botão <button> e o 2º parentElement é o item da lista <li>. técnica de atravessar o DOM para se conseguir o que almeja. assim, clicar no x vermelho removerá toda parte da estrutura do item. event delegation. Método moderno, mais limpo que removeChild
        removeItemFromStorage(item.textContent);
        checkUI(); // "filter items" e "clear all" persistiriam caso não fosse essa função invocada aqui
    }
    // }
}

function removeItemFromStorage(item) {
    let itemsFromStorage = getItemsFromStorage() // Recupera os itens armazenados no Local Storage chamando a função `getItemsFromStorage()`. Como `getItemsFromStorage()` sempre retorna um array (mesmo que vazio), evitamos possíveis erros ao manipular os dados. Motivo do uso de `let` e não `const`: `itemsFromStorage` precisa ser reatribuída com o novo array filtrado. `const` impede reatribuição, então `let` é necessário para permitir essa modificação.
    console.log(itemsFromStorage); // depuração
    itemsFromStorage = itemsFromStorage.filter((i) => i !== item) // filtra o item para ser removido. Cria um novo array contendo todos os itens, exceto aquele que deve ser removido. `filter()` percorre cada elemento (`i`) do array e só mantém aqueles diferentes de `item`. Se `item` for encontrado no array, ele será excluído do resultado final.  
    localStorage.setItem('items', JSON.stringify(itemsFromStorage)) // redefine para localstorage. Atualiza o Local Storage com o novo array após a remoção do item. `JSON.stringify()` converte o array atualizado em string JSON antes de armazená-lo. O Local Storage apenas aceita strings, então essa conversão é obrigatória. Importante: Como `setItem()` sobrescreve a chave existente, o novo array substitui o antigo.  
}

function clearItems() { // Remove elementos um por um, permitindo: 1. Garbage collection adequado; 2. Disparo de eventos de remoção; 3. Limpeza de event listeners
    console.log('Clear All clicado');
    // itemList.innerHTML = ''; // uma das diversas maneiras de limpar os itens, mas tratado como ineficaz, porque a abordagem while é mais segura que innerHTML = ''
    while (itemList.firstChild) { // enquanto a lista de item, (UL), tiver um "first child", o loop continua
        itemList.removeChild(itemList.firstChild) // Remove primeiro filho da lista
    }
    localStorage.removeItem('items') // limpa os itens do localStorage. poderia usar "localStorage.clear" no lugar
    checkUI(); // "clear all" persiste aqui caso não fosse a função checkUI invocada aqui
}

function filterItems(e) { // há outras maneiras de filtrar itens
    const text = e.target.value.toLowerCase(); // manter tudo "lower case", com o o método toLowerCase, ajuda a comparar (filtrar) os itens já adicionados, que serão forçados a estar também em "lower case"
    // console.log(text);
    const items = itemList.querySelectorAll('li') // acesso aos itens da lista já que não estão no global scope
    items.forEach((item) => { // uso do forEach é por ser querySelectorAll e ter nodelist (similar ao array), caso fosse getElementById seria HTMLCollection (precisaria converter para array)
        const itemName = item.firstChild.textContent.toLowerCase() // retira todas as tags, retornando apenas o texto (que é o 1º child)
        if (itemName.indexOf(text) != -1) { // -1 significa inexistente. foi passado "text" para o método "indexOf", assim, tudo que for digitado pode combinar com o que está escrito, ou não. indexOf(text) procura a substring 'text' dentro de itemName
            // console.log(true);
            item.style.display = 'flex' // display block não ajudaria aqui, pois os li estão como display flex por padrão, por isso deve-se por o flex para se exibir o conteúdo caso encontrado. Ou seja, se encontrou correspondência, torna o item visível; style.display manipula diretamente o CSS do elemento; 'flex' é usado pois o layout original dos itens usa flexbox
        } else {
            // console.log(false);
            item.style.display = 'none'
        }
        // console.log(itemName);
    });
}

function checkUI() { // esta função deve estar necessariamente aqui, nessa posição do script inteiro. esta função está mais para resetUI
    itemInput.value = ''; // limpa o input de "Enter Item" quando ocorre checkUI
    const items = itemList.querySelectorAll('li') // agora contabiliza cada item adicionado em uma nodeList
    console.log(items); // com a função "items" no global scope sempre retornará 0, mesmo que adicionem itens. colocado acima, resolve isso e mais
    if (items.length === 0) { // aproveita o nodelist de sua variável (const) declarada no topo do script, assim permitindo a propriedade length
        clearBtn.style.display = 'none' // pode-se usar aqui ou numa classe vinda do CSS
        itemFilter.style.display = 'none'
    } else { // permite que o itens adicionados voltem
        clearBtn.style.display = 'block' // poderiam estar no CSS. Torna o elemento visível e o faz se comportar como um elemento de bloco no layout da página. Faz com que os elemenbtos reapareçam quando houver itens na lista.
        itemFilter.style.display = 'block'
    }
    formBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item' // vanilla js (à falta de framework) torna essa necessidade de por as coisas no lugar de volta
    formBtn.style.backgroundColor = '#333'
    isEditMode = false
}

// Inicialização do app
function init() { // qualquer coisa necessária para acontecer após a página carregar pode ser inserida nessa função
    itemForm.addEventListener('submit', onAddItemSubmit) // event listeners podem ser passadas a um IFFE e função inicializadora. o motivo disso é a "refatoração" do código mais tarde, ou seja, renomear funções para melhor legibilidade e clareza do código. Monitora submissões do form
    itemList.addEventListener('click', onClickItem) // Delegation: um listener para todos os itens. Mais eficiente que listener por item
    clearBtn.addEventListener('click', clearItems) // Handler para limpar lista inteira
    itemFilter.addEventListener('input', filterItems) // evento input também captura teclagem
    document.addEventListener('DOMContentLoaded', displayItems) // Adiciona um evento ao documento. Esse evento será disparado quando ocorrer determinada ação. Evento 'DOMContentLoaded': Dispara quando o HTML foi completamente carregado e analisado pelo navegador. displayItems (sem parênteses): A função displayItems é passada como referência, ou seja, será chamada automaticamente quando o evento for disparado.

    checkUI(); // invocação da função; dessa maneira, será executada após a página carregar. para tal, comentou o código hardcoded (no html) dos itens da lista para que surtisse efeito. está no global scope e só executa quando a página carrega, ou seja, não vai acionar quando adicionar um item novo na lista
    // vanilla JS precisa contabilizar tudo: "se tirar algo do lugar, tem que por de volta. nada se faz sozinho". frameworks como react ajudam nessa tarefa com mecanismos e etc. react usa um DOM virtual
}

init(); // a abordagem da função (acima) e o invocamento (ao lado) evita de ter event listeners e a função crucial checkUI no global scope. Evita a criação de múltiplos listeners soltos no código. Mantém a inicialização organizada dentro de uma única função.
