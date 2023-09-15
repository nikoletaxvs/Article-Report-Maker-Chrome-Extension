async function getActiveTabURL(){
    let queryOptions ={active:true,currentWindow:true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;}
// adding a new bookmark row to the popup
const addNewBookmark = (bookmarks, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
  
    bookmarkTitleElement.textContent = bookmark.title;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";
  
    setBookmarkAttributes("delete", onDelete, controlsElement);
  
    newBookmarkElement.id = "bookmark-" + bookmark.id;
    newBookmarkElement.className = "bookmark";
  
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarks.appendChild(newBookmarkElement);
  };
  

  const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";
    const totalArticles = document.getElementById("totalBookmarks");
    totalArticles.innerHTML = currentBookmarks.length.toString();
    
    if (currentBookmarks.length > 0) {
      for (let i = 0; i < currentBookmarks.length; i++) {
        const bookmark = currentBookmarks[i];
        addNewBookmark(bookmarksElement, bookmark);
      }
    } else {
      bookmarksElement.innerHTML = '<i class="row">No articles saved</i>';
    }
  
    return;
  };

const onPlay = e => {};
const onDelete = async e => {
    const activeTab = await getActiveTabURL();
    
    const parentNode = e.target.parentNode.parentNode.id;
    console.log(`parent node id ${parentNode}`)
    const bookmarkElementToDelete = document.getElementById(
     parentNode
    );
  
    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
    chrome.storage.sync.get(["bookmarks_key"], (data) => {
        const currentVideoBookmarks = data["bookmarks_key"] ? JSON.parse(data["bookmarks_key"]) : [];
        chrome.tabs.sendMessage(activeTab.id, {
            type: "DELETE",
            value: parentNode,
            bookmarks: currentVideoBookmarks
          });
        viewBookmarks(currentVideoBookmarks);
      });
    
  };


const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
  
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
  };

document.addEventListener("DOMContentLoaded",async () => {
   
    const activeTab = await getActiveTabURL();
    const currentId = activeTab.url.split("article")[1].split('/')[1]; //getting article id
    
    console.log(`current article is ${currentId}`)
    if (activeTab.url.includes("eirinika.gr/article")) {
        chrome.storage.sync.get(["bookmarks_key"], (data) => {
          const currentVideoBookmarks = data["bookmarks_key"] ? JSON.parse(data["bookmarks_key"]) : [];
    
          viewBookmarks(currentVideoBookmarks);
        });
    }else{
        console.log("no includes eirinika")
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML='<div class="title">This page is not eirinika.gr or may not contain an article.</div>'
    }
    
});
const clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click",async function(e){
    const activeTab = await getActiveTabURL();
    
  
    
    chrome.storage.sync.get(["bookmarks_key"], (data) => {
        const currentVideoBookmarks = data["bookmarks_key"] ? JSON.parse(data["bookmarks_key"]) : [];
        chrome.tabs.sendMessage(activeTab.id, {
            type: "CLEAR",
            value: '',
            bookmarks: currentVideoBookmarks
          });
        viewBookmarks(currentVideoBookmarks);
      });
});
const myBtn = document.getElementById("myBtn");
myBtn.addEventListener("click",function(e){
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Generated HTML File</title>
    </head>
    <body>
        <h1>Ειρινικά Report</h1>
        
    `;

    chrome.storage.sync.get(["bookmarks_key"], (data) => {
        const currentVideoBookmarks = data["bookmarks_key"] ? JSON.parse(data["bookmarks_key"]) : [];
        htmlContent += `<p>Συνολικά άρθρα ${currentVideoBookmarks.length}</p><ol>`;
        currentVideoBookmarks.forEach(bookmark => {
            console.log(`${bookmark.id} ${bookmark.title} ${bookmark.articleURL} `)
            htmlContent+= `<li><div><a href="${bookmark.articleURL}">${bookmark.title}</a></div></li>`;
            
        });
       
        htmlContent+=`</ol></body>
            </html>
            `;
          // Create a Blob with the HTML content
          const blob = new Blob([htmlContent], { type: 'text/html' });

          // Create a URL for the Blob
          const url = URL.createObjectURL(blob);

          // Create a link to download the file
          const link = document.createElement('a');
          link.href = url;
          link.download = `Report - ${new Date().getDate().toString()}/${new Date().getMonth().toString()}/${new Date().getFullYear().toString()}`;

          // Trigger a click event on the link to start the download
          link.click();

          // Clean up by revoking the Blob URL
          URL.revokeObjectURL(url);

          
    });
});
