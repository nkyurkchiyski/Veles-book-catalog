const url = "https://www.googleapis.com/books/v1/volumes";
const apiKey = "AIzaSyDxGX8wSwcZgCo5CnsQvooRDj4riJ7p3-Q"
const emptyQuery = "?q=";
const defaultQuery = "?q=christmas";

function makeRequest(data, onSuccessCallback) {
    const filter = getQuery(data);
    const printType = getSearchParam("printType", data);
    const sorting = getSearchParam("orderBy", data);
    const startIndex = getSearchParam("startIndex", data);
    const maxResults = getSearchParam("maxResults", data);
    const query = `${filter}${printType}${sorting}${startIndex}${maxResults}`;
    $.ajax({
        method: "GET",
        url: `${url}${query}&key=${apiKey}`
    })
        .done(response => {
            onSuccessCallback(response);
        })
        .fail(response => {
            console.log(response);
        })
}

// Constructs the filtering portion of the query
function getQuery(data) {
    if (!data || !data.query) {
        return defaultQuery;
    }

    const query = data.query;

    let result = `${emptyQuery}${query.q}`;
    for (const key in query) {
        if (key != "q" && !isParamNullOrEmpty(key, query)) {
            const value = query[key];
            console.log(value);
            result += `+${key}:${JSON.stringify(value)}`;
        }
    }
    return result === emptyQuery ? defaultQuery : result;
}

// Constructs a search parameter if the specified parameter is present in the data object 
function getSearchParam(parameter, data) {
    let result = "";
    if (isParamNullOrEmpty(parameter, data)) {
        return result;
    }
    return `&${parameter}=${data[parameter]}`;
}

function isParamNullOrEmpty(parameter, data) {
    return !data || !parameter || !data[parameter] || data[parameter] === "";
}

// Retrieves recursively sub-element from a specified node
function getChildElement(element, node) {
    const nodes = node.split('.');
    if (nodes.length > 1) {
        const currentNode = nodes.shift();
        if (currentNode in element) {
            return getChildElement(element[currentNode], nodes.join('.'))
        }
    } else {
        return element[node];
    }
}


function shortenString(value, maxLength) {
    if (!value || value.length <= maxLength) {
        return value;
    }

    return `${value.substring(0, maxLength)}...`
}
