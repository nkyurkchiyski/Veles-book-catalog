const DEFAULT_IMAGE = "./images/imgNA.jpg";
const DEFAULT_DESC = "No description available.";
const NOT_AVAILABLE = "N/A";

let index = 0;
let pageSize = 12;
let retrievedItems = [];

function retrieveBooksHome() {
    const searchTerm = $("#searchBar").val();
    const data = {
        query: {
            q: searchTerm
        },
        startIndex: index * pageSize,
        maxResults: pageSize
    };
    makeRequest(data, response => {
        $("#searchResult").text(searchTerm);
        loadBooks(response);
    })
}

function retrieveBooksCatalog() {
    index = 0;
    retrievedItems = [];
    const data = getSearchInfo();
    makeRequest(data, response => {
        renderSearchResultInfo(response);
        loadBooks(response);
    })
}

function renderSearchResultInfo(response) {
    $("#totalItems").removeClass("d-none");
    $("#searchResult").text(response.totalItems);
    $("#totalItemsCount").text(response.totalItems);
}

function loadMoreBooks() {
    index++;
    const data = getSearchInfo();
    makeRequest(data, response => loadBooks(response, false))
}

function getSearchInfo() {
    const author = $("#author").val();
    const title = $("#title").val();
    const publisher = $("#publisher").val();
    const subject = $("#subject").val();
    const isbn = $("#isbn").val();
    const printType = $("#printType").val();
    const sorting = $("#sorting").val();
    const data = {
        query: {
            q: "",
            intitle: title,
            inauthor: author,
            inpublisher: publisher,
            subject: subject,
            isbn: isbn
        },
        printType: printType,
        orderBy: sorting,
        startIndex: index * pageSize,
        maxResults: pageSize
    };
    return data;
}

function loadBooks(response, performCleanUp = true) {
    const viewTypeRadio = $("input[type='radio'][name='views']:checked");
    const viewType = viewTypeRadio.val() ? viewTypeRadio.val() : "Grid";

    loadBooksView(response, 'books', (element) => getBookTemplate(element, viewType), performCleanUp, viewType);

    const loadMoreButton = $("#loadMoreButton");
    if (loadMoreButton) {
        if (loadMoreButton.length && response.totalItems > (index + 1) * pageSize) {
            loadMoreButton.removeClass("d-none");
        } else {
            loadMoreButton.addClass("d-none");
        }
    }
}

function loadBooksView(response, entity, templateGetter, performCleanUp, viewType) {
    const view = $(`#${entity}${viewType}View`);
    if (performCleanUp) {
        clearViews(entity);
    }

    if (response && response.items) {
        const items = response.items;
        retrievedItems = retrievedItems.concat(items);
        renderBooks(items, view, templateGetter);
    }
    view.removeClass("d-none");
}

function renderBooks(items, view, templateGetter) {
    items.forEach(element => {
        const template = templateGetter(element.volumeInfo);
        view.append(template);
    });
}

function getGridEntryTemplate(element, titleParam, imgParam) {
    const template = getEntryTemplate(element, titleParam, imgParam, "gridEntryTemplate", 30);
    const description = isParamNullOrEmpty("description", element) ? DEFAULT_DESC : shortenString(element.description, 250);
    new bootstrap.Popover(template, { content: description });
    return template;
}

function getListEntryTemplate(element, titleParam, imgParam) {
    const template = getEntryTemplate(element, titleParam, imgParam, "listEntryTemplate", 150);
    const description = isParamNullOrEmpty("description", element) ? DEFAULT_DESC : shortenString(element.description, 600);
    template.find('.entry-content').text(description);
    return template;
}

function getEntryTemplate(element, titleParam, imgParam, templateId, maxLenText){
    const template = $($(`#${templateId}`).html());
    const title = shortenString(element[titleParam], maxLenText);
    template.find('.entry-title').text(title);

    if (element.authors) {
        template.find('.entry-subtitle').text(shortenString(element.authors[0], maxLenText)).removeClass("d-none");
    }

    const publishedDate = getValueOrDefault(element.publishedDate, x => x.split('-')[0], NOT_AVAILABLE);
    template.find('.entry-year').text(publishedDate);

    const rating = getValueOrDefault(element.averageRating, x => x, NOT_AVAILABLE);
    template.find('.entry-rating').text(rating);

    let image = getChildElement(element, imgParam);
    if (!image) {
        image = DEFAULT_IMAGE;
    }
    template.find('.entry-img').attr('src', image);
    return template;
}


function rerenderBooksView(viewType) {
    const entity = "books";
    if (!viewType) {
        return;
    }

    const view = $(`#${entity}${viewType}View`);
    clearViews(entity);

    if (retrievedItems) {
        renderBooks(retrievedItems, view, element => getBookTemplate(element, viewType));
    }
    view.removeClass("d-none");
}


function getBookTemplate(element, viewType) {
    return viewType == "Grid" ? getGridEntryTemplate(element, 'title', 'imageLinks.thumbnail')
        : getListEntryTemplate(element, 'title', 'imageLinks.thumbnail');
}


function clearViews(entity) {
    $(`#${entity}GridView`).empty().addClass("d-none");
    $(`#${entity}ListView`).empty().addClass("d-none");
}

function scrollToTheTop() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
}

function clearFilter() {
    $("#author").val("");
    $("#title").val("");
    $("#publisher").val("");
    $("#subject").val("");
    $("#isbn").val("");
    $("#printType").val("all");
    $("#sorting").val("relevance");
}