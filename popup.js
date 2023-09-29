async function getActiveTabURL(){
    let queryOptions ={active:true,currentWindow:true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;}
const search=()=>{
  
  const searchbox= document.getElementById('search-box').value.toUpperCase();
  const storeitems = document.getElementById("bookmarks");
  const item = document.querySelectorAll(".bookmark");
  //console.log(item)
  let item_names = document.getElementsByClassName("bookmark-title");
  item_names = Array.from(item_names);
  for(var i =0;i<item_names.length;i++){
    
    let match = item[i].innerText;
    //console.log(`match is ${match}`);
    if(match){
      //let textvalue = match.textContent || match.innerHTML;
      item_names.forEach((element)=>{
        if(match.toUpperCase().includes(searchbox)){
          item[i].style.display = "";
        }else{
          item[i].style.display = "none";
        }
      })
      
    }
  }
};
//Method that makes titles smaller
const shrinkTitle =(title)=>{
  const seperators = [':','!','-',';'];
  let shrankedTitle = title;
  seperators.forEach((sep)=>{
    if(shrankedTitle.includes(sep)){
      console.log(`Seperator ${sep} found`);
      shrankedTitle = shrankedTitle.split(sep)[0];
    }
  });
  return shrankedTitle;
};
// adding a new bookmark row to the popup
const addNewBookmark = (bookmarks, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const info = document.createElement("div");
    info.textContent = bookmark.title;
    info.className="report-article-info " +  bookmark.id;
    bookmarkTitleElement.textContent = shrinkTitle(bookmark.title);
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";
    setBookmarkAttributes("down",onExpand, controlsElement);
    setBookmarkAttributes("link",onLinkClick, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);
   
    newBookmarkElement.id = "bookmark-" + bookmark.id;
    newBookmarkElement.className = "bookmark";
  
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarks.appendChild(newBookmarkElement);
    bookmarks.appendChild(info);
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
const onExpand = async e=>{

  const parentNode = e.target.parentNode.parentNode;
  const parentNodeId = parentNode.id.split('-')[1];
  const elementToHide = document.getElementsByClassName(parentNodeId)[0];
  if (elementToHide.style.display === "none") {
    elementToHide.style.display = "block";
    e.src = "assets/up.png";
  } else {
    elementToHide.style.display = "none";
    e.src = "assets/down.png";
  }
}
const onLinkClick = async e=>{
  const parentNode = e.target.parentNode.parentNode;
  const parentNodeId = parentNode.id.split('-')[1];
  chrome.storage.local.get(["bookmarks_key"], (data) => {
    let currentArticleBookmarks = data["bookmarks_key"] ? JSON.parse(data["bookmarks_key"]) : [];
    const element = currentArticleBookmarks.find((element) => element.id ==parentNodeId );
    window.open(element.articleURL, "_blank");
  });
};
const onDelete = async e => {
  //const activeTab = await getActiveTabURL();
  //Get parent node
  const parentNode = e.target.parentNode.parentNode;
  const parentNodeId = parentNode.id.split('-')[1];
  console.log(`parent node id ${parentNodeId}`)
  parentNode.remove();
  chrome.storage.local.get(["bookmarks_key"], (data) => {
      let currentArticleBookmarks = data["bookmarks_key"] ? JSON.parse(data["bookmarks_key"]) : [];
      /*chrome.tabs.sendMessage(activeTab.id, {
          type: "DELETE",
          value: parentNode,
          bookmarks: currentVideoBookmarks
      });*/
      currentArticleBookmarks = currentArticleBookmarks.filter((b) => b.id != parentNodeId);
      chrome.storage.local.set({ ['bookmarks_key']: JSON.stringify(currentArticleBookmarks) });
      viewBookmarks(currentArticleBookmarks);
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
   // const currentId = activeTab.url.split("article")[1].split('/')[1]; //getting article id
    
    //console.log(`current article is ${currentId}`)

    if (activeTab.url.includes("eirinika.gr/article")) {
        chrome.storage.local.get(["bookmarks_key"], (data) => {
          const currentVideoBookmarks = data["bookmarks_key"] ? JSON.parse(data["bookmarks_key"]) : [];
          document.getElementsByClassName('search-container')[0].addEventListener('keyup',search);
          viewBookmarks(currentVideoBookmarks);
        });
    }else{
      const container = document.getElementsByClassName("container")[0];
      container.innerHTML='<div class="title">This page is not eirinika.gr or may not contain an article.</div>'
      console.log("no includes eirinika");
      document.getElementById('myBtn').style.display='none';
      document.getElementById('clearBtn').style.display='none';
  }
    
});

const clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click",async function(e){
    const activeTab = await getActiveTabURL();    
    let currentArticleBookmarks=[];
    chrome.storage.local.set({ ['bookmarks_key']: JSON.stringify(currentArticleBookmarks) });
    viewBookmarks(currentArticleBookmarks);
});
const myBtn = document.getElementById("myBtn");
myBtn.addEventListener("click",function(e){
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Lato:ital@1&family=Roboto&display=swap" rel="stylesheet">
        <style>
          h1{
            font-family: 'Montserrat', sans-serif;
          }
          ol{
            line-height: 1.6;
          }
          li, p{
            font-family: 'Roboto', sans-serif;
          }
          body{
            margin: 10px;
          }
        </style>
        <title>Generated HTML File</title>
    </head>
    <body>
        <h1>Eirinika.gr Report</h1>
        
    `;

    chrome.storage.local.get(["bookmarks_key"], (data) => {
      const currentVideoBookmarks = data["bookmarks_key"] ? JSON.parse(data["bookmarks_key"]) : [];
      htmlContent += `<p>Συνολικά άρθρα ${currentVideoBookmarks.length}</p><ol>`;
      currentVideoBookmarks.forEach(bookmark => {
        console.log(`${bookmark.id} ${bookmark.title} ${bookmark.articleURL}`);
        htmlContent += `<li><div><a href="${bookmark.articleURL}">${bookmark.title}</a></div></li>`;
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
