/*INFO 
  This script will check if the user is watching an article of the web page eirinika.gr
  Inputs: tabId,tab
  Outputs: 
*/
chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if(tab.url && tab.url.includes("https://www.eirinika.gr/article")){
      console.log(urlParameters);
      const queryParameters = tab.url.split("article")[1];
      const urlParameters = new URLSearchParams(queryParameters);
      // Regular expression to match the number in the URL
      var regex = /\/(\d+)\/[^/]*$/;
      var match = tab.url.match(regex);
      var articleName = new Date().getUTCMilliseconds();
      // Check if a match is found and get the number
      if (match && match[1]) {
        var number = match[1];
        console.log(`Article number is ${number}`); // Output: 259010
        articleName = number
      } else {
        console.log("Number not found in the URL.");
      }
      chrome.tabs.sendMessage(tabId,{
        type:"NEW",
        articleId: articleName
      })
    }

  });
  