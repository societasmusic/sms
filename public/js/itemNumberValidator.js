function itemNumberValidator(event) {
    if (event.target.value == "UPC-Custom" || event.target.value == "ISRC-Custom") { 
        document.getElementById('autogen').checked = true; 
        document.getElementById('autogen').disabled = true; 
        document.getElementById('itemNumberText').disabled = false; 
    } else if (event.target.value == "ISRC-QZZDS") {
        document.getElementById('autogen').disabled = false; 
    };
};